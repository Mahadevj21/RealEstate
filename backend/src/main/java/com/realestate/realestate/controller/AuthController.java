package com.realestate.realestate.controller;

import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

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
}
