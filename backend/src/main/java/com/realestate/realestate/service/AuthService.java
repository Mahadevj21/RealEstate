package com.realestate.realestate.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.realestate.realestate.component.JwtUtil;
import com.realestate.realestate.dto.AuthResponse;
import com.realestate.realestate.entity.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthResponse register(User user) {
        if (user.getRole() == null) {
            user.setRole(User.Role.BUYER);
        }
        user.setBlocked(false);
        if (user.getBalance() == 0) {
            user.setBalance(0);
        }

        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userService.saveUser(user);

        emailService.sendEmail(
            savedUser.getEmail(),
            "Welcome to Propmanage!",
            "Hello " + savedUser.getUsername() + ",\n\nWelcome to Propmanage! Your account has been successfully created.\n\nBest regards,\nThe Propmanage Team"
        );

        String token = jwtUtil.generateToken(
            savedUser.getEmail(),
            savedUser.getRole().name(),
            savedUser.getId()
        );

        return new AuthResponse(token, savedUser);
    }

    public AuthResponse login(String email, String password) {
        User user = userService.findByEmail(email);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        if (user.isBlocked()) {
            throw new RuntimeException("Account is blocked");
        }

        String token = jwtUtil.generateToken(
            user.getEmail(),
            user.getRole().name(),
            user.getId()
        );

        return new AuthResponse(token, user);
    }
}
