package com.realestate.realestate.component;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;

        System.out.println("--- 🚀 Seeding Initial Data ---");

        // 1. Create Users
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@realestate.com");
        admin.setPassword("admin123");
        admin.setRole(User.Role.ADMIN);
        admin.setBalance(500000.0);
        admin.setCreatedAt(LocalDateTime.now().minusMonths(3));
        userRepository.save(admin);

        User seller = new User();
        seller.setUsername("johndoe");
        seller.setEmail("seller@realestate.com");
        seller.setPassword("admin123");
        seller.setRole(User.Role.SELLER);
        seller.setBalance(100000.0);
        seller.setCreatedAt(LocalDateTime.now().minusMonths(2));
        userRepository.save(seller);

        User buyer = new User();
        buyer.setUsername("janebuyer");
        buyer.setEmail("buyer@realestate.com");
        buyer.setPassword("admin123");
        buyer.setRole(User.Role.BUYER);
        buyer.setBalance(250000.0);
        buyer.setCreatedAt(LocalDateTime.now().minusMonths(2));
        userRepository.save(buyer);

        // 2. Seed 10 Properties
        String[] titles = {
            "Modern Sky Apartment", "Sunset Ocean Villa", "Green Valley Ranch", 
            "Penthouse in Manhattan", "Cozy Lake Cabin", "Minimalist Studio", 
            "Heritage Royal Mansion", "Suburban Family Home", "Tech City Duplex", "Country Side Estate"
        };
        String[] locs = { "Mumbai", "Goa", "Pune", "Delhi", "Nanital", "Bangalore", "Rajasthan", "Chennai", "Hyderabad", "Kerala" };
        double[] prices = { 120000, 450000, 280000, 950000, 180000, 85000, 1500000, 220000, 310000, 500000 };
        String[] imgs = {
            "https://images.unsplash.com/photo-1545324418-f1d3ac157359?auto=format&fit=crop&w=400",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400",
            "https://images.unsplash.com/photo-1500315331616-db4f707c24d1?auto=format&fit=crop&w=400",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400",
            "https://images.unsplash.com/photo-1536376074432-8d2a3d3c82e7?auto=format&fit=crop&w=400",
            "https://images.unsplash.com/photo-1448630360428-6e3e5762da3f?auto=format&fit=crop&w=400",
            "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400"
        };

        for (int i = 0; i < 10; i++) {
            Property p = new Property();
            p.setTitle(titles[i]);
            p.setDescription("A beautiful premium property located in the heart of " + locs[i] + ". High-end finishes and spacious layout.");
            p.setPrice(prices[i]);
            p.setLocation(locs[i]);
            p.setImageUrl(imgs[i]);
            p.setSeller(seller);
            p.setType(i % 2 == 0 ? "apartment" : "villa");
            p.setBedrooms(2 + (i % 3));
            p.setBathrooms(1 + (i % 2));
            p.setSold(false);
            p.setApproved(i < 6); // First 6 are approved, last 4 pending
            p.setCreatedAt(LocalDateTime.now().minusDays(i * 5L));
            propertyRepository.save(p);
        }

        System.out.println("--- ✅ Data Seeding Completed ---");
    }
}
