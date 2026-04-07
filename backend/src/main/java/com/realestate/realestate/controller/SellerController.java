package com.realestate.realestate.controller;

import java.util.ArrayList;
import java.util.HashMap;
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
import com.realestate.realestate.service.DealService;
import com.realestate.realestate.service.PropertyService;
import com.realestate.realestate.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/seller")
@RequiredArgsConstructor
public class SellerController {

    private final DealService dealService;
    private final UserService userService;
    private final PropertyService propertyService;

    @GetMapping("/{sellerId}/pending-deals")
    public List<Deal> getPendingDeals(@PathVariable Long sellerId) {
        userService.findById(sellerId);
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
        User seller = userService.findById(sellerId);
        Map<String, Object> balanceInfo = new HashMap<>();
        balanceInfo.put("id", seller.getId());
        balanceInfo.put("username", seller.getUsername());
        balanceInfo.put("balance", seller.getBalance());
        return balanceInfo;
    }

    @GetMapping("/{sellerId}/properties")
    public List<Property> getSellerProperties(@PathVariable Long sellerId) {
        userService.findById(sellerId);
        return propertyService.getAllProperties().stream()
                .filter(p -> p.getSeller() != null && p.getSeller().getId().equals(sellerId))
                .toList();
    }

    @GetMapping("/{sellerId}/all-deals")
    public List<Deal> getAllSellerDeals(@PathVariable Long sellerId) {
        userService.findById(sellerId);
        return dealService.getAllSellerDeals(sellerId);
    }

    @GetMapping("/{sellerId}/analytics/performance")
    public List<Map<String, Object>> getSellerPerformance(@PathVariable Long sellerId) {
        List<Property> props = propertyService.getAllProperties().stream()
                .filter(p -> p.getSeller() != null && p.getSeller().getId().equals(sellerId))
                .toList();

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
