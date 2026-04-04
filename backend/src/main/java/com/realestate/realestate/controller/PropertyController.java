package com.realestate.realestate.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.DealRepository;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final DealRepository dealRepository;

    @PostMapping("/add/{sellerId}")
    public Property addProperty(@PathVariable Long sellerId, @RequestBody Property property) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        property.setSeller(seller);
        property.setSold(false);
        return propertyRepository.save(property);
    }

    @GetMapping
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long propertyId) {
        try {
            if (!propertyRepository.existsById(propertyId)) {
                return ResponseEntity.status(404).body(Map.of("error", "Property not found"));
            }
            
            // Delete associated deals to avoid foreign key issues
            dealRepository.deleteAll(dealRepository.findByPropertyId(propertyId));
            
            propertyRepository.deleteById(propertyId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete: " + e.getMessage()));
        }
    }

    @PutMapping("/{propertyId}")
    public ResponseEntity<?> updateProperty(@PathVariable Long propertyId, @RequestBody Property updatedProperty) {
        try {
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found"));

            if (updatedProperty.getTitle() != null) property.setTitle(updatedProperty.getTitle());
            if (updatedProperty.getDescription() != null) property.setDescription(updatedProperty.getDescription());
            if (updatedProperty.getPrice() > 0) property.setPrice(updatedProperty.getPrice());
            if (updatedProperty.getLocation() != null) property.setLocation(updatedProperty.getLocation());
            if (updatedProperty.getImageUrl() != null) property.setImageUrl(updatedProperty.getImageUrl());
            if (updatedProperty.getBedrooms() != null) property.setBedrooms(updatedProperty.getBedrooms());
            if (updatedProperty.getBathrooms() != null) property.setBathrooms(updatedProperty.getBathrooms());
            if (updatedProperty.getType() != null) property.setType(updatedProperty.getType());

            Property saved = propertyRepository.save(property);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
