package com.realestate.realestate.config;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void runAfterStartup() {
        if (userRepository.count() > 0) return;

        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@test.com");
        admin.setPassword("password123");
        admin.setRole(User.Role.ADMIN);
        admin.setBalance(0);
        userRepository.save(admin);

        User seller = new User();
        seller.setUsername("seller");
        seller.setEmail("seller@test.com");
        seller.setPassword("password123");
        seller.setRole(User.Role.SELLER);
        seller.setBalance(1500);
        userRepository.save(seller);

        User buyer = new User();
        buyer.setUsername("buyer");
        buyer.setEmail("buyer@test.com");
        buyer.setPassword("password123");
        buyer.setRole(User.Role.BUYER);
        buyer.setBalance(1500);
        userRepository.save(buyer);

        Property p1 = new Property();
        p1.setTitle("Beautiful House");
        p1.setDescription("A beautiful 3BHK house in prime location");
        p1.setLocation("Downtown");
        p1.setPrice(150);
        p1.setImageUrl(null);
        p1.setSeller(seller);
        propertyRepository.save(p1);

        Property p2 = new Property();
        p2.setTitle("Modern Apartment");
        p2.setDescription("Modern 2BHK apartment with all amenities");
        p2.setLocation("City Center");
        p2.setPrice(200);
        p2.setImageUrl(null);
        p2.setSeller(seller);
        propertyRepository.save(p2);

        User techseeker = new User();
        techseeker.setUsername("techseeker");
        techseeker.setEmail("techseeker@test.com");
        techseeker.setPassword("password123");
        techseeker.setRole(User.Role.SELLER);
        techseeker.setBalance(1000);
        userRepository.save(techseeker);
    }
}
