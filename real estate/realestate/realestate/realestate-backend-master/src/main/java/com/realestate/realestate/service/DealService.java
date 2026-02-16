package com.realestate.realestate.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.realestate.entity.Deal;
import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.Transaction;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.DealRepository;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;

@Service
public class DealService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final DealRepository dealRepository;
    private final com.realestate.realestate.service.TransactionService transactionService;

    public DealService(PropertyRepository propertyRepository, UserRepository userRepository, DealRepository dealRepository, com.realestate.realestate.service.TransactionService transactionService) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.dealRepository = dealRepository;
        this.transactionService = transactionService;
    }

    // Buyer creates a deal request
    public Deal createDealRequest(Long propertyId, Long buyerId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (property.isSold()) {
            throw new RuntimeException("Property already sold");
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        User seller = property.getSeller();
        if (seller == null) {
            throw new RuntimeException("Seller not found");
        }

        // Check if buyer has sufficient balance
        if (buyer.getBalance() < property.getPrice()) {
            throw new RuntimeException("Insufficient balance. Required: " + property.getPrice() + ", Available: " + buyer.getBalance());
        }

        Deal deal = new Deal();
        deal.setProperty(property);
        deal.setBuyer(buyer);
        deal.setSeller(seller);
        deal.setStatus(Deal.DealStatus.PENDING);
        deal.setAmount(property.getPrice());

        return dealRepository.save(deal);
    }

    // Seller accepts deal
    public String acceptDeal(Long dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.getStatus().equals(Deal.DealStatus.PENDING)) {
            throw new RuntimeException("Only pending deals can be accepted");
        }

        deal.setStatus(Deal.DealStatus.ACCEPTED);
        dealRepository.save(deal);

        // Finalize the deal
        return finalizeDeal(dealId);
    }

    // Seller rejects deal
    public String rejectDeal(Long dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.getStatus().equals(Deal.DealStatus.PENDING)) {
            throw new RuntimeException("Only pending deals can be rejected");
        }

        deal.setStatus(Deal.DealStatus.REJECTED);
        dealRepository.save(deal);

        return "Deal rejected successfully";
    }

    // Finalize deal and transfer balance
    private String finalizeDeal(Long dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        User buyer = deal.getBuyer();
        User seller = deal.getSeller();
        Property property = deal.getProperty();

        User admin = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Check buyer balance - needs property price + 100 brokerage
        if (buyer.getBalance() < (int) deal.getAmount() + 100) {
            throw new RuntimeException("Insufficient balance for buyer. Required: " + (deal.getAmount() + 100) + ", Available: " + buyer.getBalance());
        }

        // Check seller balance - needs 100 brokerage
        if (seller.getBalance() < 100) {
            throw new RuntimeException("Insufficient balance for seller. Required: 100, Available: " + seller.getBalance());
        }

        // Transfer balance:
        // Buyer pays seller the property price
        buyer.setBalance((int) (buyer.getBalance() - deal.getAmount()));
        seller.setBalance((int) (seller.getBalance() + deal.getAmount()));
        
        // Buyer pays admin 100 brokerage
        buyer.setBalance((int) (buyer.getBalance() - 100));
        admin.setBalance((int) (admin.getBalance() + 100));
        
        // Seller pays admin 100 brokerage
        seller.setBalance((int) (seller.getBalance() - 100));
        admin.setBalance((int) (admin.getBalance() + 100));

        property.setSold(true);

        deal.setStatus(Deal.DealStatus.COMPLETED);
        deal.setCompletedAt(LocalDateTime.now());

        // Persist balances and property
        userRepository.save(buyer);
        userRepository.save(seller);
        userRepository.save(admin);
        propertyRepository.save(property);

        // Record transactions
        // Buyer pays seller the property price
        Transaction tBuyer = new Transaction();
        tBuyer.setUser(buyer);
        tBuyer.setAmount(deal.getAmount());
        tBuyer.setType("DEBIT");
        tBuyer.setDescription("Paid ₹" + deal.getAmount() + " to seller for property id: " + property.getId() + " (deal:" + deal.getId() + ")");
        transactionService.save(tBuyer);

        // Seller receives property price
        Transaction tSeller = new Transaction();
        tSeller.setUser(seller);
        tSeller.setAmount(deal.getAmount());
        tSeller.setType("CREDIT");
        tSeller.setDescription("Received ₹" + deal.getAmount() + " from buyer for property id: " + property.getId() + " (deal:" + deal.getId() + ")");
        transactionService.save(tSeller);

        // Buyer pays admin 100 brokerage
        Transaction tBuyerBrokerage = new Transaction();
        tBuyerBrokerage.setUser(buyer);
        tBuyerBrokerage.setAmount(100);
        tBuyerBrokerage.setType("DEBIT");
        tBuyerBrokerage.setDescription("Paid ₹100 brokerage fee to admin for property id: " + property.getId() + " (deal:" + deal.getId() + ")");
        transactionService.save(tBuyerBrokerage);

        // Seller pays admin 100 brokerage
        Transaction tSellerBrokerage = new Transaction();
        tSellerBrokerage.setUser(seller);
        tSellerBrokerage.setAmount(100);
        tSellerBrokerage.setType("DEBIT");
        tSellerBrokerage.setDescription("Paid ₹100 brokerage fee to admin for property id: " + property.getId() + " (deal:" + deal.getId() + ")");
        transactionService.save(tSellerBrokerage);

        // Admin receives 200 brokerage
        Transaction tAdmin = new Transaction();
        tAdmin.setUser(admin);
        tAdmin.setAmount(200);
        tAdmin.setType("CREDIT");
        tAdmin.setDescription("Received ₹200 brokerage fee for property id: " + property.getId() + " (deal:" + deal.getId() + ")");
        transactionService.save(tAdmin);

        dealRepository.save(deal);

        return "Deal finalized successfully";
    }

    // Get all pending deals for seller
    public List<Deal> getSellerPendingDeals(Long sellerId) {
        return dealRepository.findBySellerId(sellerId)
                .stream()
                .filter(d -> d.getStatus().equals(Deal.DealStatus.PENDING))
                .toList();
    }

    // Get all deals for buyer
    public List<Deal> getBuyerDeals(Long buyerId) {
        return dealRepository.findByBuyerId(buyerId);
    }

    // Get all completed deals
    public List<Deal> getCompletedDeals() {
        return dealRepository.findByStatus(Deal.DealStatus.COMPLETED);
    }
}
