package com.vku.agilepoker.controller;

import com.vku.agilepoker.config.JwtUtil;
import com.vku.agilepoker.entity.User;
import com.vku.agilepoker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String fullName = body.get("fullName");
        String role = body.getOrDefault("role", "DEVELOPER");

        if (username == null || password == null || fullName == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập đầy đủ thông tin!"));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập đã tồn tại!"));
        }

        User user = new User();
        user.setUsername(username.trim());
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName.trim());
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getFullName(), user.getRole());

        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        res.put("username", user.getUsername());
        res.put("fullName", user.getFullName());
        res.put("role", user.getRole());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Sai tên đăng nhập hoặc mật khẩu!"));
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getFullName(), user.getRole());

        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        res.put("username", user.getUsername());
        res.put("fullName", user.getFullName());
        res.put("role", user.getRole());
        return ResponseEntity.ok(res);
    }
}