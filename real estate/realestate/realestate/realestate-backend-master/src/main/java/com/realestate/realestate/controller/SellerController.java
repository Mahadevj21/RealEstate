package com.realestate.realestate.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.Deal;
import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;
import com.realestate.realestate.service.DealService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/seller")
@RequiredArgsConstructor
public class SellerController {

    private final DealService dealService;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    // Get seller's pending deals
    @GetMapping("/{sellerId}/pending-deals")
    public List<Deal> getPendingDeals(@PathVariable Long sellerId) {
        // Verify seller exists
        userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return dealService.getSellerPendingDeals(sellerId);
    }

    // Accept a deal
    @PostMapping("/deals/{dealId}/accept")
    public String acceptDeal(@PathVariable Long dealId) {
        return dealService.acceptDeal(dealId);
    }

    // Reject a deal
    @PostMapping("/deals/{dealId}/reject")
    public String rejectDeal(@PathVariable Long dealId) {
        return dealService.rejectDeal(dealId);
    }

    // Get seller's balance
    @GetMapping("/{sellerId}/balance")
    public java.util.Map<String, Object> getSellerBalance(@PathVariable Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return java.util.Map.of(
            "id", seller.getId(),
            "username", seller.getUsername(),
            "balance", seller.getBalance()
        );
    }

    // Get seller's properties
    @GetMapping("/{sellerId}/properties")
    public List<Property> getSellerProperties(@PathVariable Long sellerId) {
        // Verify seller exists
        userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return propertyRepository.findBySellerId(sellerId);
    }
}
