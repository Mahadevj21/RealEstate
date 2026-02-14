package com.realestate.realestate.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @PostMapping("/add/{sellerId}")
    public Property addProperty(
            @PathVariable Long sellerId,
            @RequestBody Property property
    ) {
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
    public String deleteProperty(@PathVariable Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        propertyRepository.delete(property);
        return "Property deleted successfully";
    }
}
