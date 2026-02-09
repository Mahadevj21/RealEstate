package com.realestate.realestate.service;

import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class DealService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public DealService(PropertyRepository propertyRepository, UserRepository userRepository) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    public String finalizeDeal(Long propertyId, Long buyerId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (property.isSold()) {
            throw new RuntimeException("Property already sold");
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        User seller = property.getSeller();

        User admin = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Dummy payment logic
        buyer.setBalance(buyer.getBalance() - 100);
        seller.setBalance(seller.getBalance() - 100);
        admin.setBalance(admin.getBalance() + 200);

        property.setSold(true);

        userRepository.save(buyer);
        userRepository.save(seller);
        userRepository.save(admin);
        propertyRepository.save(property);

        return "Deal finalized successfully";
    }
}
