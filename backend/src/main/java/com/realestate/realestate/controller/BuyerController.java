package com.realestate.realestate.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.Deal;
import com.realestate.realestate.entity.Favourite;
import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.DealRepository;
import com.realestate.realestate.repository.FavouriteRepository;
import com.realestate.realestate.repository.UserRepository;
import com.realestate.realestate.service.DealService;
import com.realestate.realestate.service.PropertyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/buyer")
@RequiredArgsConstructor
public class BuyerController {

    private final DealService dealService;
    private final PropertyService propertyService;
    private final UserRepository userRepository;
    private final FavouriteRepository favouriteRepository;
    private final DealRepository dealRepository;

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getDetails();
    }

    private void validateUser(Long userId) {
        if (!userId.equals(getCurrentUserId())) {
            throw new RuntimeException("Unauthorized: You cannot access data for another user");
        }
    }

    @PostMapping("/buy/{propertyId}/buyer/{buyerId}")
    public Deal buyProperty(@PathVariable Long propertyId,
                            @PathVariable Long buyerId) {
        validateUser(buyerId);
        return dealService.createDealRequest(propertyId, buyerId);
    }

    @GetMapping("/{buyerId}/balance")
    public Map<String, Object> getBuyerBalance(@PathVariable Long buyerId) {
        validateUser(buyerId);
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));
        return Map.of(
            "id", buyer.getId(),
            "username", buyer.getUsername(),
            "balance", buyer.getBalance()
        );
    }

    @GetMapping("/{buyerId}/deals")
    public List<Deal> getBuyerDeals(@PathVariable Long buyerId) {
        validateUser(buyerId);
        return dealService.getBuyerDeals(buyerId);
    }

    @PostMapping("/{buyerId}/favourites/{propertyId}")
    public Favourite addToFavourites(
            @PathVariable Long buyerId,
            @PathVariable Long propertyId
    ) {
        validateUser(buyerId);
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        Property property = propertyService.getPropertyById(propertyId);

        if (favouriteRepository.findByUserIdAndPropertyId(buyerId, propertyId).isPresent()) {
            throw new RuntimeException("Property already in favourites");
        }

        Favourite favourite = new Favourite();
        favourite.setUser(buyer);
        favourite.setProperty(property);

        return favouriteRepository.save(favourite);
    }

    @DeleteMapping("/{buyerId}/favourites/{propertyId}")
    public String removeFromFavourites(
            @PathVariable Long buyerId,
            @PathVariable Long propertyId
    ) {
        validateUser(buyerId);
        Favourite favourite = favouriteRepository.findByUserIdAndPropertyId(buyerId, propertyId)
                .orElseThrow(() -> new RuntimeException("Favourite not found"));

        favouriteRepository.deleteById(favourite.getId());
        return "Property removed from favourites";
    }

    @GetMapping("/{buyerId}/favourites")
    public List<Property> getFavouriteProperties(@PathVariable Long buyerId) {
        validateUser(buyerId);
        userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        return favouriteRepository.findByUserId(buyerId)
                .stream()
                .map(Favourite::getProperty)
                .collect(Collectors.toList());
    }

    // filterProperty() — delegates to PropertyService (approved only)
    @GetMapping("/filter/location")
    public List<Property> filterByLocation(@RequestParam String location) {
        return propertyService.filterProperties(location, 0, Double.MAX_VALUE, false);
    }

    @GetMapping("/filter/price")
    public List<Property> filterByPrice(@RequestParam double minPrice, @RequestParam double maxPrice) {
        return propertyService.filterProperties("", minPrice, maxPrice, false);
    }

    @GetMapping("/filter/sold")
    public List<Property> filterBySoldStatus(@RequestParam boolean sold) {
        return propertyService.filterProperties("", 0, Double.MAX_VALUE, sold);
    }

    @GetMapping("/filter/advanced")
    public List<Property> advancedFilter(
            @RequestParam(required = false, defaultValue = "") String location,
            @RequestParam(required = false, defaultValue = "0") double minPrice,
            @RequestParam(required = false, defaultValue = "999999999") double maxPrice,
            @RequestParam(required = false, defaultValue = "false") boolean sold
    ) {
        return propertyService.filterProperties(location, minPrice, maxPrice, sold);
    }

    // searchProperty() — keyword search via PropertyService
    @GetMapping("/search")
    public List<Property> searchProperties(@RequestParam String keyword) {
        return propertyService.searchProperties(keyword);
    }

    // Available = approved + not sold
    @GetMapping("/available")
    public List<Property> getAvailableProperties() {
        return propertyService.getApprovedProperties();
    }
}
