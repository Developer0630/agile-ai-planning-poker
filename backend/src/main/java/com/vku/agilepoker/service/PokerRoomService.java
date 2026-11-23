package com.vku.agilepoker.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vku.agilepoker.dto.PokerDtos.*;
import com.vku.agilepoker.dto.PokerDtos.AiDiscussRequest;
import com.vku.agilepoker.dto.PokerDtos.AiDiscussResponse;
import com.vku.agilepoker.dto.PokerDtos.AiEstimateRequest;
import com.vku.agilepoker.dto.PokerDtos.AiEstimateResponse;
import com.vku.agilepoker.dto.PokerDtos.ChatItem;
import com.vku.agilepoker.dto.PokerDtos.ChatPayload;
import com.vku.agilepoker.dto.PokerDtos.VoteItem;
import com.vku.agilepoker.entity.ChatMessage;
import com.vku.agilepoker.entity.Room;
import com.vku.agilepoker.entity.UserStory;
import com.vku.agilepoker.entity.Vote;
import com.vku.agilepoker.repository.ChatMessageRepository;
import com.vku.agilepoker.repository.RoomRepository;
import com.vku.agilepoker.repository.UserStoryRepository;
import com.vku.agilepoker.repository.VoteRepository;

@Service
public class PokerRoomService {

    private final RoomRepository roomRepository;
    private final UserStoryRepository storyRepository;
    private final VoteRepository voteRepository;
    private final ChatMessageRepository chatRepository;
    private final AiIntegrationService aiService;
    private final SimpMessagingTemplate messagingTemplate;

    public static final String AI_AGENT_NAME = "Llama-3 Engineer (AI)";

    public PokerRoomService(RoomRepository roomRepository,
                            UserStoryRepository storyRepository,
                            VoteRepository voteRepository,
                            ChatMessageRepository chatRepository,
                            AiIntegrationService aiService,
                            SimpMessagingTemplate messagingTemplate) {
        this.roomRepository = roomRepository;
        this.storyRepository = storyRepository;
        this.voteRepository = voteRepository;
        this.chatRepository = chatRepository;
        this.aiService = aiService;
        this.messagingTemplate = messagingTemplate;
    }

    public Map<String, Object> getRoomFullState(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng: " + roomCode));

        List<UserStory> stories = storyRepository.findByRoomCode(roomCode);
        UserStory currentStory = room.getCurrentStoryId() != null
                ? storyRepository.findById(room.getCurrentStoryId()).orElse(null)
                : null;

        List<Object> voteList = new ArrayList<>();
        List<ChatMessage> messages = new ArrayList<>();

        if (currentStory != null) {
            boolean isRevealed = room.getStatus() == Room.RoomStatus.REVEALED;
            for (Vote v : voteRepository.findByStoryId(currentStory.getId())) {
                Map<String, Object> m = new HashMap<>();
                m.put("participantName", v.getParticipantName());
                m.put("isAi", v.isAi());
                m.put("hasVoted", v.getPoints() != null);
                m.put("points", isRevealed ? v.getPoints() : null);
                m.put("aiReasoning", isRevealed ? v.getAiReasoning() : null);
                voteList.add(m);
            }
            messages = chatRepository.findByRoomCodeAndStoryIdOrderByCreatedAtAsc(roomCode, currentStory.getId());
        }

        Map<String, Object> state = new HashMap<>();
        state.put("room", room);
        state.put("stories", stories);
        state.put("currentStory", currentStory);
        state.put("votes", voteList);
        state.put("messages", messages);
        return state;
    }

    public void broadcastRoomState(String roomCode) {
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/state", getRoomFullState(roomCode));
    }

    @Transactional
    public void selectStoryForVoting(String roomCode, Long storyId) {
        Room room = roomRepository.findByRoomCode(roomCode).orElseThrow();
        UserStory story = storyRepository.findById(storyId).orElseThrow();

        voteRepository.deleteByStoryId(storyId);
        room.setCurrentStoryId(storyId);
        room.setStatus(Room.RoomStatus.VOTING);
        roomRepository.save(room);

        broadcastRoomState(roomCode);
        triggerAiInitialVoteAsync(roomCode, story);
    }

    @Async
    public void triggerAiInitialVoteAsync(String roomCode, UserStory story) {
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/ai-typing", true);
        try {
            AiEstimateResponse res = aiService.requestInitialEstimate(
                    new AiEstimateRequest(story.getTitle(), story.getDescription(), story.getAcceptanceCriteria())
            );

            Vote aiVote = voteRepository.findByStoryIdAndParticipantName(story.getId(), AI_AGENT_NAME)
                    .orElseGet(() -> {
                        Vote v = new Vote();
                        v.setRoomCode(roomCode);
                        v.setStoryId(story.getId());
                        v.setParticipantName(AI_AGENT_NAME);
                        v.setAi(true);
                        return v;
                    });
            aiVote.setPoints(res.getStory_point());
            aiVote.setAiReasoning(res.getReasoning());
            voteRepository.save(aiVote);
        } finally {
            messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/ai-typing", false);
            broadcastRoomState(roomCode);
        }
    }

    @Transactional
    public void submitHumanVote(String roomCode, String participantName, Integer points) {
        Room room = roomRepository.findByRoomCode(roomCode).orElseThrow();
        if (room.getCurrentStoryId() == null) return;

        Long storyId = room.getCurrentStoryId();
        Vote vote = voteRepository.findByStoryIdAndParticipantName(storyId, participantName)
                .orElseGet(() -> {
                    Vote v = new Vote();
                    v.setRoomCode(roomCode);
                    v.setStoryId(storyId);
                    v.setParticipantName(participantName);
                    v.setAi(false);
                    return v;
                });
        vote.setPoints(points);
        voteRepository.save(vote);

        broadcastRoomState(roomCode);
    }

    @Transactional
    public void revealCards(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode).orElseThrow();
        if (room.getCurrentStoryId() == null) return;

        room.setStatus(Room.RoomStatus.REVEALED);
        roomRepository.save(room);

        voteRepository.findByStoryIdAndParticipantName(room.getCurrentStoryId(), AI_AGENT_NAME)
                .ifPresent(aiVote -> {
                    if (aiVote.getAiReasoning() != null) {
                        saveAndBroadcastChat(roomCode, room.getCurrentStoryId(), AI_AGENT_NAME, "AI",
                                "Mình chọn **" + aiVote.getPoints() + " điểm**. " + aiVote.getAiReasoning());
                    }
                });

        broadcastRoomState(roomCode);
    }

    @Transactional
    public void finalizeStoryPoints(String roomCode, Integer finalPoints) {
        Room room = roomRepository.findByRoomCode(roomCode).orElseThrow();
        if (room.getCurrentStoryId() == null) return;

        UserStory story = storyRepository.findById(room.getCurrentStoryId()).orElseThrow();
        story.setFinalPoints(finalPoints);
        story.setStatus("ESTIMATED");
        storyRepository.save(story);

        room.setStatus(Room.RoomStatus.WAITING);
        roomRepository.save(room);

        saveAndBroadcastChat(roomCode, story.getId(), "System", "SYSTEM",
                "Đã chốt Story Point cho task này là **" + finalPoints + " điểm**.");
        broadcastRoomState(roomCode);
    }

    public void handleChatMessage(String roomCode, ChatPayload payload) {
        Room room = roomRepository.findByRoomCode(roomCode).orElseThrow();
        Long storyId = room.getCurrentStoryId();
        if (storyId == null) return;

        saveAndBroadcastChat(roomCode, storyId, payload.getSenderName(), "HUMAN", payload.getContent());

        if (payload.isAskAi() || payload.getContent().toLowerCase().contains("@ai")) {
            triggerAiDiscussionAsync(roomCode, storyId);
        }
    }

    @Async
    public void triggerAiDiscussionAsync(String roomCode, Long storyId) {
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/ai-typing", true);
        try {
            UserStory story = storyRepository.findById(storyId).orElseThrow();
            Map<String, String> storyMap = Map.of(
                    "title", story.getTitle() != null ? story.getTitle() : "",
                    "description", story.getDescription() != null ? story.getDescription() : ""
            );

            List<VoteItem> currentVotes = voteRepository.findByStoryId(storyId).stream()
                    .map(v -> new VoteItem(v.getParticipantName(), v.getPoints()))
                    .collect(Collectors.toList());

            List<ChatItem> history = chatRepository
                    .findByRoomCodeAndStoryIdOrderByCreatedAtAsc(roomCode, storyId).stream()
                    .map(c -> new ChatItem(c.getSenderName(), c.getContent()))
                    .collect(Collectors.toList());

            AiDiscussResponse res = aiService.requestDiscussionReply(
                    new AiDiscussRequest(storyMap, currentVotes, history)
            );

            if (res.getUpdated_point() != null) {
                voteRepository.findByStoryIdAndParticipantName(storyId, AI_AGENT_NAME).ifPresent(v -> {
                    v.setPoints(res.getUpdated_point());
                    v.setAiReasoning(res.getReply());
                    voteRepository.save(v);
                });
            }

            saveAndBroadcastChat(roomCode, storyId, AI_AGENT_NAME, "AI", res.getReply());
            broadcastRoomState(roomCode);
        } finally {
            messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/ai-typing", false);
        }
    }

    private void saveAndBroadcastChat(String roomCode, Long storyId, String sender, String type, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setRoomCode(roomCode);
        msg.setStoryId(storyId);
        msg.setSenderName(sender);
        msg.setSenderType(type);
        msg.setContent(content);
        msg.setCreatedAt(LocalDateTime.now());
        ChatMessage saved = chatRepository.save(msg);

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/chat", saved);
    }
}