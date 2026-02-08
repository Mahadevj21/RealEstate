package com.realestate.realestate.controller;

import org.springframework.web.bind.annotation.*;

import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.UserRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        return userRepository.findByEmail(user.getEmail())
                .filter(u -> u.getPassword().equals(user.getPassword()))
                .map(u -> "Login successful as " + u.getRole())
                .orElse("Invalid credentials");
    }
}
