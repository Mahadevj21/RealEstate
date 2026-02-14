package com.realestate.realestate.controller;

import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    // BLOCK USER
    @PutMapping("/users/{userId}/block")
    public User blockUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(true);
        return userRepository.save(user);
    }

    // UNBLOCK USER
    @PutMapping("/users/{userId}/unblock")
    public User unblockUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(false);
        return userRepository.save(user);
    }
}
