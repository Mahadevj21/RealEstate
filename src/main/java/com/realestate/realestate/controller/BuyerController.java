package com.realestate.realestate.controller;

import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/buyers")
@RequiredArgsConstructor
public class BuyerController {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    // ❤️ Add to favourites
    @PostMapping("/{buyerId}/favourites/{propertyId}")
    public Set<Property> addFavourite(
            @PathVariable Long buyerId,
            @PathVariable Long propertyId
    ) {
        User buyer = userRepository.findById(buyerId)
                .filter(u -> u.getRole() == User.Role.BUYER)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        buyer.getFavouriteProperties().add(property);
        userRepository.save(buyer);

        return buyer.getFavouriteProperties();
    }

    // ❤️ View favourites
    @GetMapping("/{buyerId}/favourites")
    public Set<Property> getFavourites(@PathVariable Long buyerId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        return buyer.getFavouriteProperties();
    }
}
