package com.realestate.realestate.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.Property;
import com.realestate.realestate.service.PropertyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getDetails();
    }

    @PostMapping("/add/{sellerId}")
    public Property addProperty(@PathVariable Long sellerId, @RequestBody Property property) {
        // Enforce that a seller can only add properties for their own ID
        Long currentUserId = getCurrentUserId();
        if (!sellerId.equals(currentUserId)) {
            throw new RuntimeException("Unauthorized: You can only add properties to your own account");
        }
        return propertyService.addProperty(sellerId, property);
    }

    @GetMapping
    public List<Property> getAllProperties() {
        return propertyService.getAllProperties();
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long propertyId) {
        try {
            propertyService.deleteProperty(propertyId, getCurrentUserId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{propertyId}")
    public ResponseEntity<?> updateProperty(@PathVariable Long propertyId, @RequestBody Property updatedProperty) {
        try {
            Property saved = propertyService.updateProperty(propertyId, updatedProperty, getCurrentUserId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }
}
