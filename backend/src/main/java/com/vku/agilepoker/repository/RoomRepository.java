package com.vku.agilepoker.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vku.agilepoker.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomCode(String roomCode);
}