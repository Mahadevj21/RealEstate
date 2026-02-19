package com.realestate.realestate.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.Transaction;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.UserRepository;
import com.realestate.realestate.service.TransactionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    // Get wallet balance for a user
    @GetMapping("/{userId}/balance")
    public Map<String, Object> getWalletBalance(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return Map.of(
            "userId", user.getId(),
            "username", user.getUsername(),
            "balance", user.getBalance()
        );
    }

    // Get transaction history for a user
    @GetMapping("/{userId}/transactions")
    public List<Transaction> getTransactionHistory(@PathVariable Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return transactionService.getTransactionsByUserId(userId);
    }

    // Get single transaction
    @GetMapping("/transaction/{transactionId}")
    public Transaction getTransaction(@PathVariable Long transactionId) {
        return transactionService.getTransactionById(transactionId);
    }
}
