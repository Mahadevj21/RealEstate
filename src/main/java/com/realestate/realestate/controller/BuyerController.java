package com.realestate.realestate.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.Favourite;
import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.FavouriteRepository;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;
import com.realestate.realestate.service.DealService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/buyer")
@RequiredArgsConstructor
public class BuyerController {

    private final DealService dealService;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final FavouriteRepository favouriteRepository;

    // Buyer buys a property (dummy payment logic)
    @PostMapping("/buy/{propertyId}/buyer/{buyerId}")
    public String buyProperty(@PathVariable Long propertyId,
                              @PathVariable Long buyerId) {
        return dealService.finalizeDeal(propertyId, buyerId);
    }

    // Add property to favorites
    @PostMapping("/{buyerId}/favourites/{propertyId}")
    public Favourite addToFavourites(
            @PathVariable Long buyerId,
            @PathVariable Long propertyId
    ) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // Check if already in favourites
        if (favouriteRepository.findByUserIdAndPropertyId(buyerId, propertyId).isPresent()) {
            throw new RuntimeException("Property already in favourites");
        }

        Favourite favourite = new Favourite();
        favourite.setUser(buyer);
        favourite.setProperty(property);

        return favouriteRepository.save(favourite);
    }

    // Remove property from favorites
    @DeleteMapping("/{buyerId}/favourites/{propertyId}")
    public String removeFromFavourites(
            @PathVariable Long buyerId,
            @PathVariable Long propertyId
    ) {
        favouriteRepository.findByUserIdAndPropertyId(buyerId, propertyId)
                .orElseThrow(() -> new RuntimeException("Favourite not found"));

        favouriteRepository.deleteByUserIdAndPropertyId(buyerId, propertyId);
        return "Property removed from favourites";
    }

    // Get buyer's favorite properties
    @GetMapping("/{buyerId}/favourites")
    public List<Property> getFavouriteProperties(@PathVariable Long buyerId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        return favouriteRepository.findByUserId(buyerId)
                .stream()
                .map(Favourite::getProperty)
                .collect(Collectors.toList());
    }

    // Filter properties by location
    @GetMapping("/filter/location")
    public List<Property> filterByLocation(@RequestParam String location) {
        return propertyRepository.findByLocation(location);
    }

    // Filter properties by price range
    @GetMapping("/filter/price")
    public List<Property> filterByPrice(
            @RequestParam double minPrice,
            @RequestParam double maxPrice
    ) {
        return propertyRepository.findByPriceBetween(minPrice, maxPrice);
    }

    // Filter properties by sold status
    @GetMapping("/filter/sold")
    public List<Property> filterBySoldStatus(@RequestParam boolean sold) {
        return propertyRepository.findBySold(sold);
    }

    // Advanced filter: location, price range, and sold status
    @GetMapping("/filter/advanced")
    public List<Property> advancedFilter(
            @RequestParam(required = false, defaultValue = "") String location,
            @RequestParam(required = false, defaultValue = "0") double minPrice,
            @RequestParam(required = false, defaultValue = "999999999") double maxPrice,
            @RequestParam(required = false, defaultValue = "false") boolean sold
    ) {
        if (location.isEmpty()) {
            return propertyRepository.findByPriceBetweenAndSold(minPrice, maxPrice, sold);
        }
        return propertyRepository.filterProperties(location, minPrice, maxPrice, sold);
    }

    // Get available properties (not sold)
    @GetMapping("/available")
    public List<Property> getAvailableProperties() {
        return propertyRepository.findBySold(false);
    }
}
