package com.realestate.realestate.controller;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
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
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final PropertyService propertyService;
    private final DealService dealService;

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getDetails();
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/users/{userId}/block")
    public User blockUser(@PathVariable Long userId) {
        return userService.blockUser(userId);
    }

    @PutMapping("/users/{userId}/unblock")
    public User unblockUser(@PathVariable Long userId) {
        return userService.unblockUser(userId);
    }

    @GetMapping("/properties")
    public List<Property> getAllProperties() {
        return propertyService.getAllProperties();
    }

    @PutMapping("/properties/{propertyId}/approve")
    public ResponseEntity<?> approveProperty(@PathVariable Long propertyId) {
        try {
            Property p = propertyService.approveProperty(propertyId);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/properties/{propertyId}/reject")
    public ResponseEntity<?> rejectProperty(@PathVariable Long propertyId) {
        try {
            Property p = propertyService.rejectProperty(propertyId);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/deals")
    public List<Deal> getCompletedDeals() {
        return dealService.getCompletedDeals();
    }

    @GetMapping("/balance")
    public Map<String, Object> getAdminBalance() {
        // Use token to find current admin, don't trust URL parameters
        User admin = userService.findById(getCurrentUserId());

        return Map.of(
            "id", admin.getId(),
            "username", admin.getUsername(),
            "balance", admin.getBalance()
        );
    }

    @GetMapping("/analytics/stats")
    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Use optimized counts instead of fetching all lists
        stats.put("totalUsers", userService.countAllUsers());
        stats.put("activeListings", (long) propertyService.getApprovedProperties().size());
        stats.put("pendingApproval", (long) propertyService.getAllProperties().stream().filter(p -> !p.isApproved() && !p.isSold()).count());
        stats.put("completedDeals", (long) dealService.getCompletedDeals().size());
        stats.put("totalVolume", dealService.getCompletedDeals().stream().mapToDouble(Deal::getAmount).sum());

        return stats;
    }

    @GetMapping("/analytics/growth")
    public List<Map<String, Object>> getGrowthData() {
        List<Map<String, Object>> data = new ArrayList<>();
        LocalDate now = LocalDate.now();

        List<User> allUsers = userService.getAllUsers();
        List<Property> allProperties = propertyService.getAllProperties();

        String[] colors = {"#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe", "#00c49f"};

        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String label = month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            long signups = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null
                        && u.getCreatedAt().getMonth() == month.getMonth()
                        && u.getCreatedAt().getYear() == month.getYear())
                .count();

            long listings = allProperties.stream()
                .filter(p -> p.getCreatedAt() != null
                        && p.getCreatedAt().getMonth() == month.getMonth()
                        && p.getCreatedAt().getYear() == month.getYear())
                .count();

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("name", label);
            monthData.put("signups", (double) signups);
            monthData.put("listings", (double) listings);
            monthData.put("value", (double) (signups + listings));
            monthData.put("fill", colors[i % colors.length]);
            data.add(monthData);
        }

        return data;
    }

    @GetMapping("/reports/summary")
    public Map<String, Object> getReportSummary() {
        List<User> allUsers = userService.getAllUsers();
        List<Property> allProperties = propertyService.getAllProperties();
        List<Deal> completedDeals = dealService.getCompletedDeals();

        long buyers = allUsers.stream().filter(u -> u.getRole() == User.Role.BUYER).count();
        long sellers = allUsers.stream().filter(u -> u.getRole() == User.Role.SELLER).count();
        long soldProperties = allProperties.stream().filter(Property::isSold).count();
        long availableProperties = allProperties.stream().filter(p -> p.isApproved() && !p.isSold()).count();
        long pendingApproval = allProperties.stream().filter(p -> !p.isApproved() && !p.isSold()).count();
        double totalRevenue = completedDeals.stream().mapToDouble(Deal::getAmount).sum();
        double brokerageRevenue = completedDeals.size() * 200.0;

        Map<String, Object> report = new HashMap<>();
        report.put("totalUsers", (long) allUsers.size());
        report.put("buyers", buyers);
        report.put("sellers", sellers);
        report.put("totalProperties", (long) allProperties.size());
        report.put("soldProperties", soldProperties);
        report.put("availableProperties", availableProperties);
        report.put("pendingApproval", pendingApproval);
        report.put("completedDeals", (long) completedDeals.size());
        report.put("totalTransactionVolume", totalRevenue);
        report.put("brokerageRevenue", brokerageRevenue);

        return report;
    }
}
