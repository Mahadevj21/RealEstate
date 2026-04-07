package com.realestate.realestate.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElse(null);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateProfile(Long userId, User updateData) {
        User user = findById(userId);

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

    public User blockUser(Long userId) {
        User user = findById(userId);
        user.setBlocked(true);
        return userRepository.save(user);
    }

    public User unblockUser(Long userId) {
        User user = findById(userId);
        user.setBlocked(false);
        return userRepository.save(user);
    }

    public User updateUser(Long id, User user) {
        return userRepository.save(user);
    }
}
