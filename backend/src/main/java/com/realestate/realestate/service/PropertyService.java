package com.realestate.realestate.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.DealRepository;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final DealRepository dealRepository;

    public Property addProperty(Long sellerId, Property property) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        property.setSeller(seller);
        property.setSold(false);
        property.setApproved(false); // pending admin approval
        return propertyRepository.save(property);
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    // Only approved + unsold properties visible to buyers
    public List<Property> getApprovedProperties() {
        return propertyRepository.findByApprovedAndSold(true, false);
    }

    public void deleteProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new RuntimeException("Property not found");
        }

        // Delete associated deals to avoid foreign key issues
        dealRepository.deleteAll(dealRepository.findByPropertyId(propertyId));

        propertyRepository.deleteById(propertyId);
    }

    public Property updateProperty(Long propertyId, Property updatedProperty) {
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

        return propertyRepository.save(property);
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    // approveProperty() — admin approves a listing so buyers can see it
    public Property approveProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setApproved(true);
        return propertyRepository.save(property);
    }

    // rejectProperty() — admin rejects a listing, it remains invisible to buyers
    public Property rejectProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setApproved(false);
        return propertyRepository.save(property);
    }

    // searchProperties() — keyword search on title, description, location
    public List<Property> searchProperties(String keyword) {
        String kw = keyword.toLowerCase();
        return propertyRepository.findAll().stream()
                .filter(p -> p.isApproved() && !p.isSold())
                .filter(p ->
                    (p.getTitle() != null && p.getTitle().toLowerCase().contains(kw)) ||
                    (p.getDescription() != null && p.getDescription().toLowerCase().contains(kw)) ||
                    (p.getLocation() != null && p.getLocation().toLowerCase().contains(kw))
                )
                .collect(Collectors.toList());
    }

    // filterProperties() — filter by location, price range, sold status (approved only)
    public List<Property> filterProperties(String location, double minPrice, double maxPrice, boolean sold) {
        return propertyRepository.filterApprovedProperties(location, minPrice, maxPrice, sold);
    }
}
