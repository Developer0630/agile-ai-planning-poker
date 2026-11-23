package com.vku.agilepoker.dto;

import java.util.List;
import java.util.Map;

public class PokerDtos {

    public static class VoteItem {
        private String engineer;
        private Integer points;

        public VoteItem() {}
        public VoteItem(String engineer, Integer points) {
            this.engineer = engineer;
            this.points = points;
        }
        public String getEngineer() { return engineer; }
        public void setEngineer(String engineer) { this.engineer = engineer; }
        public Integer getPoints() { return points; }
        public void setPoints(Integer points) { this.points = points; }
    }

    public static class ChatItem {
        private String sender;
        private String message;

        public ChatItem() {}
        public ChatItem(String sender, String message) {
            this.sender = sender;
            this.message = message;
        }
        public String getSender() { return sender; }
        public void setSender(String sender) { this.sender = sender; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class AiEstimateRequest {
        private String title;
        private String description;
        private String acceptance_criteria;

        public AiEstimateRequest() {}
        public AiEstimateRequest(String title, String description, String acceptance_criteria) {
            this.title = title;
            this.description = description;
            this.acceptance_criteria = acceptance_criteria;
        }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getAcceptance_criteria() { return acceptance_criteria; }
        public void setAcceptance_criteria(String acceptance_criteria) { this.acceptance_criteria = acceptance_criteria; }
    }

    public static class AiEstimateResponse {
        private Integer story_point;
        private String reasoning;

        public AiEstimateResponse() {}
        public AiEstimateResponse(Integer story_point, String reasoning) {
            this.story_point = story_point;
            this.reasoning = reasoning;
        }
        public Integer getStory_point() { return story_point; }
        public void setStory_point(Integer story_point) { this.story_point = story_point; }
        public String getReasoning() { return reasoning; }
        public void setReasoning(String reasoning) { this.reasoning = reasoning; }
    }

    public static class AiDiscussRequest {
        private Map<String, String> story;
        private List<VoteItem> current_votes;
        private List<ChatItem> chat_history;

        public AiDiscussRequest() {}
        public AiDiscussRequest(Map<String, String> story, List<VoteItem> current_votes, List<ChatItem> chat_history) {
            this.story = story;
            this.current_votes = current_votes;
            this.chat_history = chat_history;
        }
        public Map<String, String> getStory() { return story; }
        public void setStory(Map<String, String> story) { this.story = story; }
        public List<VoteItem> getCurrent_votes() { return current_votes; }
        public void setCurrent_votes(List<VoteItem> current_votes) { this.current_votes = current_votes; }
        public List<ChatItem> getChat_history() { return chat_history; }
        public void setChat_history(List<ChatItem> chat_history) { this.chat_history = chat_history; }
    }

    public static class AiDiscussResponse {
        private String reply;
        private Integer updated_point;

        public AiDiscussResponse() {}
        public AiDiscussResponse(String reply, Integer updated_point) {
            this.reply = reply;
            this.updated_point = updated_point;
        }
        public String getReply() { return reply; }
        public void setReply(String reply) { this.reply = reply; }
        public Integer getUpdated_point() { return updated_point; }
        public void setUpdated_point(Integer updated_point) { this.updated_point = updated_point; }
    }

    public static class VotePayload {
        private String participantName;
        private Integer points;

        public String getParticipantName() { return participantName; }
        public void setParticipantName(String participantName) { this.participantName = participantName; }
        public Integer getPoints() { return points; }
        public void setPoints(Integer points) { this.points = points; }
    }

    public static class ChatPayload {
        private String senderName;
        private String content;
        private boolean askAi;

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public boolean isAskAi() { return askAi; }
        public void setAskAi(boolean askAi) { this.askAi = askAi; }
    }
}