package com.realestate.realestate.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.Deal;
import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.service.DealService;
import com.realestate.realestate.service.PropertyService;
import com.realestate.realestate.service.UserService;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.DealRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/seller")
@RequiredArgsConstructor
public class SellerController {

    private final DealService dealService;
    private final UserService userService;
    private final PropertyService propertyService;
    private final PropertyRepository propertyRepository;
    private final DealRepository dealRepository;

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getDetails();
    }

    private void validateUser(Long userId) {
        if (!userId.equals(getCurrentUserId())) {
            throw new RuntimeException("Unauthorized: Access Denied");
        }
    }

    @GetMapping("/{sellerId}/pending-deals")
    public List<Deal> getPendingDeals(@PathVariable Long sellerId) {
        validateUser(sellerId);
        return dealService.getSellerPendingDeals(sellerId);
    }

    @PostMapping("/deals/{dealId}/accept")
    public String acceptDeal(@PathVariable Long dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
        validateUser(deal.getSeller().getId());
        return dealService.acceptDeal(dealId);
    }

    @PostMapping("/deals/{dealId}/reject")
    public String rejectDeal(@PathVariable Long dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
        validateUser(deal.getSeller().getId());
        return dealService.rejectDeal(dealId);
    }

    @GetMapping("/{sellerId}/balance")
    public Map<String, Object> getSellerBalance(@PathVariable Long sellerId) {
        validateUser(sellerId);
        User seller = userService.findById(sellerId);
        Map<String, Object> balanceInfo = new HashMap<>();
        balanceInfo.put("id", seller.getId());
        balanceInfo.put("username", seller.getUsername());
        balanceInfo.put("balance", seller.getBalance());
        return balanceInfo;
    }

    @GetMapping("/{sellerId}/properties")
    public List<Property> getSellerProperties(@PathVariable Long sellerId) {
        validateUser(sellerId);
        return propertyRepository.findBySellerId(sellerId);
    }

    @GetMapping("/{sellerId}/all-deals")
    public List<Deal> getAllSellerDeals(@PathVariable Long sellerId) {
        validateUser(sellerId);
        return dealService.getAllSellerDeals(sellerId);
    }

    @GetMapping("/{sellerId}/analytics/performance")
    public List<Map<String, Object>> getSellerPerformance(@PathVariable Long sellerId) {
        validateUser(sellerId);
        List<Property> props = propertyRepository.findBySellerId(sellerId);

        long active = props.stream().filter(p -> !p.isSold()).count();
        long sold = props.stream().filter(Property::isSold).count();

        List<Map<String, Object>> result = new ArrayList<>();
        
        Map<String, Object> activeData = new HashMap<>();
        activeData.put("name", "Active");
        activeData.put("value", (double) active);
        activeData.put("fill", "#82ca9d");
        result.add(activeData);

        Map<String, Object> soldData = new HashMap<>();
        soldData.put("name", "Sold");
        soldData.put("value", (double) sold);
        soldData.put("fill", "#8884d8");
        result.add(soldData);

        return result;
    }
}
