package com.realestate.realestate.controller;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.Deal;
import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.TransactionRepository;
import com.realestate.realestate.repository.UserRepository;
import com.realestate.realestate.service.DealService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final DealService dealService;
    private final PropertyRepository propertyRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/users/{userId}/block")
    public User blockUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(true);
        return userRepository.save(user);
    }

    @PutMapping("/users/{userId}/unblock")
    public User unblockUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(false);
        return userRepository.save(user);
    }

    @GetMapping("/deals")
    public List<Deal> getCompletedDeals() {
        return dealService.getCompletedDeals();
    }

    @GetMapping("/balance")
    public Map<String, Object> getAdminBalance() {
        User admin = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return Map.of(
            "id", admin.getId(),
            "username", admin.getUsername(),
            "balance", admin.getBalance()
        );
    }

    @GetMapping("/analytics/stats")
    public Map<String, Object> getPlatformStats() {
        long totalUsers = userRepository.count();
        long activeListings = propertyRepository.countBySold(false);
        List<Deal> deals = dealService.getCompletedDeals();

        double totalVolume = deals.stream()
                .mapToDouble(Deal::getAmount)
                .sum();

        return Map.of(
            "totalUsers", totalUsers,
            "activeListings", activeListings,
            "completedDeals", deals.size(),
            "totalVolume", totalVolume
        );
    }

    @GetMapping("/analytics/growth")
    public List<Map<String, Object>> getGrowthData() {
        List<Map<String, Object>> data = new ArrayList<>();
        LocalDate now = LocalDate.now();

        List<User> allUsers = userRepository.findAll();
        List<Property> allProperties = propertyRepository.findAll();

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

            data.add(Map.of(
                "name", label,
                "signups", (double) signups,
                "listings", (double) listings,
                "value", (double) (signups + listings)
            ));
        }

        return data;
    }
}
