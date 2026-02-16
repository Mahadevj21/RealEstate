package com.realestate.realestate.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.Deal;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.UserRepository;
import com.realestate.realestate.service.DealService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final DealService dealService;

    // GET ALL USERS
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

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

    // GET ALL COMPLETED DEALS
    @GetMapping("/deals")
    public List<Deal> getCompletedDeals() {
        return dealService.getCompletedDeals();
    }

    // GET ADMIN BALANCE
    @GetMapping("/balance")
    public java.util.Map<String, Object> getAdminBalance() {
        User admin = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return java.util.Map.of(
            "id", admin.getId(),
            "username", admin.getUsername(),
            "balance", admin.getBalance()
        );
    }
}
