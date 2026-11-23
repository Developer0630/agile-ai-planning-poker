package com.vku.agilepoker.repository;

import com.vku.agilepoker.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserStoryRepository extends JpaRepository<UserStory, Long> {
    List<UserStory> findByRoomCode(String roomCode);
}
