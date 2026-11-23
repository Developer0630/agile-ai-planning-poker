package com.vku.agilepoker.controller;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vku.agilepoker.entity.Room;
import com.vku.agilepoker.entity.UserStory;
import com.vku.agilepoker.repository.RoomRepository;
import com.vku.agilepoker.repository.UserStoryRepository;
import com.vku.agilepoker.service.PokerRoomService;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomRestController {

    private final RoomRepository roomRepository;
    private final UserStoryRepository storyRepository;
    private final PokerRoomService pokerRoomService;

    public RoomRestController(RoomRepository roomRepository,
                              UserStoryRepository storyRepository,
                              PokerRoomService pokerRoomService) {
        this.roomRepository = roomRepository;
        this.storyRepository = storyRepository;
        this.pokerRoomService = pokerRoomService;
    }

    @PostMapping
    public Room createRoom(@RequestBody Map<String, String> body) {
        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        Room room = new Room();
        room.setRoomCode(code);
        room.setName(body.getOrDefault("name", "Sprint Planning Room"));
        room.setStatus(Room.RoomStatus.WAITING);
        room.setCreatedAt(LocalDateTime.now());
        Room saved = roomRepository.save(room);

        UserStory s1 = new UserStory();
        s1.setRoomCode(code);
        s1.setTitle("Tích hợp thanh toán VNPay & Webhook IPN");
        s1.setDescription("Xây dựng luồng thanh toán qua cổng VNPay, xử lý callback IPN cập nhật trạng thái đơn hàng.");
        s1.setAcceptanceCriteria("- Verify chữ ký HMAC-SHA512\n- Xử lý idempotency chống cộng tiền 2 lần");
        s1.setStatus("BACKLOG");
        storyRepository.save(s1);

        UserStory s2 = new UserStory();
        s2.setRoomCode(code);
        s2.setTitle("Thiết kế giao diện trang Đăng nhập");
        s2.setDescription("Tạo form đăng nhập bằng email/password và validate cơ bản phía client.");
        s2.setAcceptanceCriteria("- Hiển thị thông báo lỗi khi sai mật khẩu\n- Responsive trên mobile");
        s2.setStatus("BACKLOG");
        storyRepository.save(s2);

        return saved;
    }
    @PutMapping("/{roomCode}/stories/{storyId}")
    public UserStory updateStory(@PathVariable String roomCode,
                                 @PathVariable Long storyId,
                                 @RequestBody UserStory updated) {
        UserStory story = storyRepository.findById(storyId).orElseThrow();
        story.setTitle(updated.getTitle());
        story.setDescription(updated.getDescription());
        story.setAcceptanceCriteria(updated.getAcceptanceCriteria());
        UserStory saved = storyRepository.save(story);
        pokerRoomService.broadcastRoomState(roomCode);
        return saved;
    }

    @DeleteMapping("/{roomCode}/stories/{storyId}")
    public Map<String, String> deleteStory(@PathVariable String roomCode,
                                           @PathVariable Long storyId) {
        roomRepository.findByRoomCode(roomCode).ifPresent(room -> {
            if (storyId.equals(room.getCurrentStoryId())) {
                room.setCurrentStoryId(null);
                room.setStatus(Room.RoomStatus.WAITING);
                roomRepository.save(room);
            }
        });
        storyRepository.deleteById(storyId);
        pokerRoomService.broadcastRoomState(roomCode);
        return Map.of("status", "deleted");
    }
    @GetMapping("/{roomCode}")
    public Map<String, Object> getRoomState(@PathVariable String roomCode) {
        return pokerRoomService.getRoomFullState(roomCode);
    }

    @PostMapping("/{roomCode}/stories")
    public UserStory addStory(@PathVariable String roomCode, @RequestBody UserStory story) {
        story.setRoomCode(roomCode);
        story.setStatus("BACKLOG");
        UserStory saved = storyRepository.save(story);
        pokerRoomService.broadcastRoomState(roomCode);
        return saved;
    }
}