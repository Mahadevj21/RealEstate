package com.realestate.realestate.service;

import org.springframework.stereotype.Service;

import com.realestate.realestate.entity.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final EmailService emailService;

    public User register(User user) {
        if (user.getRole() == null) {
            user.setRole(User.Role.BUYER);
        }
        user.setBlocked(false);
        if (user.getBalance() == 0) {
            user.setBalance(0);
        }
        
        User savedUser = userService.saveUser(user);
        
        emailService.sendEmail(savedUser.getEmail(), "Welcome to Propmanage!", 
            "Hello " + savedUser.getUsername() + ",\n\nWelcome to Propmanage! Your account has been successfully created.\n\nBest regards,\nThe Propmanage Team");
        
        return savedUser;
    }

    public User login(String email, String password) {
        User user = userService.findByEmail(email);
        if (user == null || !user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }
        if (user.isBlocked()) {
            throw new RuntimeException("Account is blocked");
        }
        return user;
    }
}
