package com.realestate.realestate.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/{sellerId}/pending-deals")
    public List<Deal> getPendingDeals(@PathVariable Long sellerId) {
        userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return dealService.getSellerPendingDeals(sellerId);
    }

    @PostMapping("/deals/{dealId}/accept")
    public String acceptDeal(@PathVariable Long dealId) {
        return dealService.acceptDeal(dealId);
    }

    @PostMapping("/deals/{dealId}/reject")
    public String rejectDeal(@PathVariable Long dealId) {
        return dealService.rejectDeal(dealId);
    }

    @GetMapping("/{sellerId}/balance")
    public Map<String, Object> getSellerBalance(@PathVariable Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return Map.of(
            "id", seller.getId(),
            "username", seller.getUsername(),
            "balance", seller.getBalance()
        );
    }

    @GetMapping("/{sellerId}/properties")
    public List<Property> getSellerProperties(@PathVariable Long sellerId) {
        userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return propertyRepository.findBySellerId(sellerId);
    }

    @GetMapping("/{sellerId}/analytics/performance")
    public List<Map<String, Object>> getSellerPerformance(@PathVariable Long sellerId) {
        List<Property> props = propertyRepository.findBySellerId(sellerId);

        long active = props.stream().filter(p -> !p.isSold()).count();
        long sold = props.stream().filter(Property::isSold).count();

        List<Map<String, Object>> result = new ArrayList<>();
        result.add(Map.of("name", "Active", "value", (double) active, "fill", "#82ca9d"));
        result.add(Map.of("name", "Sold", "value", (double) sold, "fill", "#8884d8"));

        return result;
    }
}
