package com.vku.agilepoker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vku.agilepoker.entity.Vote;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    List<Vote> findByStoryId(Long storyId);
    Optional<Vote> findByStoryIdAndParticipantName(Long storyId, String participantName);
    void deleteByStoryId(Long storyId);
}