package com.realestate.realestate.controller;

import java.util.List;

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
    public Property addProperty(
            @PathVariable Long sellerId,
            @RequestBody Property property
    ) {
        System.out.println("Adding property - imageUrl length: " + (property.getImageUrl() != null ? property.getImageUrl().length() : 0));
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        property.setSeller(seller);
        property.setSold(false);

        Property saved = propertyRepository.save(property);
        System.out.println("Property saved - imageUrl in DB: " + (saved.getImageUrl() != null ? saved.getImageUrl().length() : "null"));
        return saved;
    }

    @GetMapping
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long propertyId) {
        try {
            if (!propertyRepository.existsById(propertyId)) {
                return ResponseEntity.status(404).body(new java.util.HashMap<String, String>() {{
                    put("error", "Property not found");
                }});
            }
            
            // Delete all deals associated with this property first (foreign key constraint)
            dealRepository.deleteAll(dealRepository.findByPropertyId(propertyId));
            
            // Now delete the property
            propertyRepository.deleteById(propertyId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.out.println("Error deleting property: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new java.util.HashMap<String, String>() {{
                put("error", "Failed to delete: " + e.getMessage());
            }});
        }
    }

    @PutMapping("/{propertyId}")
    public ResponseEntity<?> updateProperty(
            @PathVariable Long propertyId,
            @RequestBody Property updatedProperty
    ) {
        try {
            System.out.println("Updating property " + propertyId + " - imageUrl length: " + (updatedProperty.getImageUrl() != null ? updatedProperty.getImageUrl().length() : 0));
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found"));

            if (updatedProperty.getTitle() != null) {
                property.setTitle(updatedProperty.getTitle());
            }
            if (updatedProperty.getDescription() != null) {
                property.setDescription(updatedProperty.getDescription());
            }
            if (updatedProperty.getPrice() > 0) {
                property.setPrice(updatedProperty.getPrice());
            }
            if (updatedProperty.getLocation() != null) {
                property.setLocation(updatedProperty.getLocation());
            }
            if (updatedProperty.getImageUrl() != null) {
                property.setImageUrl(updatedProperty.getImageUrl());
            }
            if (updatedProperty.getBedrooms() != null) {
                property.setBedrooms(updatedProperty.getBedrooms());
            }
            if (updatedProperty.getBathrooms() != null) {
                property.setBathrooms(updatedProperty.getBathrooms());
            }
            if (updatedProperty.getType() != null) {
                property.setType(updatedProperty.getType());
            }

            Property saved = propertyRepository.save(property);
            System.out.println("Property updated - imageUrl in DB: " + (saved.getImageUrl() != null ? saved.getImageUrl().length() : "null"));
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("Error updating property: " + e.getMessage());
            return ResponseEntity.status(500).body(new java.util.HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
}
