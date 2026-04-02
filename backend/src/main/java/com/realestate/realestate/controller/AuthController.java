package com.realestate.realestate.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.UserRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // REGISTER USER
    @PostMapping("/register")
    public User register(@RequestBody User user) {

        // default values safety
        if (user.getBalance() == 0) {
            user.setBalance(0);
        }

        // Set role from request or default to BUYER
        if (user.getRole() == null) {
            user.setRole(User.Role.BUYER);
        }

        user.setBlocked(false);

        return userRepository.save(user);
    }

    // LOGIN USER
    @PostMapping("/login")
    public User login(@RequestBody User loginRequest) {

        return userRepository.findByEmail(loginRequest.getEmail())
                .filter(user -> user.getPassword().equals(loginRequest.getPassword()))
                .filter(user -> !user.isBlocked())
                .map(user -> {
                    if (user.isBlocked()) {
                        throw new RuntimeException("Your account has been blocked by admin");
                    }
                    return user;
                })
                .orElseThrow(() -> new RuntimeException("Invalid credentials or account is blocked"));
    }

    // UPDATE USER PROFILE
    @PutMapping("/profile/{userId}")
    public User updateProfile(@PathVariable Long userId, @RequestBody User updateData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updateData.getUsername() != null && !updateData.getUsername().isEmpty()) {
            user.setUsername(updateData.getUsername());
        }
        if (updateData.getEmail() != null && !updateData.getEmail().isEmpty()) {
            user.setEmail(updateData.getEmail());
        }
        if (updateData.getPassword() != null && !updateData.getPassword().isEmpty()) {
            user.setPassword(updateData.getPassword());
        }

        return userRepository.save(user);
    }
}
