package com.vku.agilepoker.controller;

import java.util.Map;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import com.vku.agilepoker.dto.PokerDtos.ChatPayload;
import com.vku.agilepoker.dto.PokerDtos.VotePayload;
import com.vku.agilepoker.service.PokerRoomService;

@Controller
public class PokerSocketController {

    private final PokerRoomService pokerRoomService;

    public PokerSocketController(PokerRoomService pokerRoomService) {
        this.pokerRoomService = pokerRoomService;
    }

    @MessageMapping("/room/{roomCode}/select-story")
    public void selectStory(@DestinationVariable String roomCode, Map<String, Long> payload) {
        pokerRoomService.selectStoryForVoting(roomCode, payload.get("storyId"));
    }

    @MessageMapping("/room/{roomCode}/vote")
    public void submitVote(@DestinationVariable String roomCode, VotePayload payload) {
        pokerRoomService.submitHumanVote(roomCode, payload.getParticipantName(), payload.getPoints());
    }

    @MessageMapping("/room/{roomCode}/reveal")
    public void revealCards(@DestinationVariable String roomCode) {
        pokerRoomService.revealCards(roomCode);
    }

    @MessageMapping("/room/{roomCode}/finalize")
    public void finalizePoints(@DestinationVariable String roomCode, Map<String, Integer> payload) {
        pokerRoomService.finalizeStoryPoints(roomCode, payload.get("finalPoints"));
    }

    @MessageMapping("/room/{roomCode}/chat")
    public void sendChat(@DestinationVariable String roomCode, ChatPayload payload) {
        pokerRoomService.handleChatMessage(roomCode, payload);
    }
    @MessageMapping("/room/{roomCode}/revote")
    public void revote(@DestinationVariable String roomCode) {
        pokerRoomService.revoteCurrentStory(roomCode);
    }
}