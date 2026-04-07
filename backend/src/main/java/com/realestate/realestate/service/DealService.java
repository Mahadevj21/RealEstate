package com.realestate.realestate.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.realestate.entity.Deal;
import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.DealRepository;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DealService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final DealRepository dealRepository;
    private final TransactionService transactionService;
    private final EmailService emailService;

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

    public String acceptDeal(Long dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.getStatus().equals(Deal.DealStatus.PENDING)) {
            throw new RuntimeException("Only pending deals can be accepted");
        }

        deal.setStatus(Deal.DealStatus.ACCEPTED);
        dealRepository.save(deal);

        return finalizeDeal(dealId);
    }

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

    private String finalizeDeal(Long dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        User buyer = deal.getBuyer();
        User seller = deal.getSeller();
        Property property = deal.getProperty();

        User admin = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        double propertyPrice = deal.getAmount();
        double brokerageFee = 100.0;

        if (buyer.getBalance() < propertyPrice + brokerageFee) {
            throw new RuntimeException("Buyer has insufficient balance (Needs ₹" + (propertyPrice + brokerageFee) + ")");
        }

        // We don't check seller balance upfront because fee is deducted from the sale proceeds
        // seller.getBalance() will be updated to balancer + price - fee

        // Handle balance transfers
        buyer.setBalance(buyer.getBalance() - propertyPrice - brokerageFee);
        seller.setBalance(seller.getBalance() + propertyPrice - brokerageFee);
        admin.setBalance(admin.getBalance() + (brokerageFee * 2));

        property.setSold(true);
        deal.setStatus(Deal.DealStatus.COMPLETED);
        deal.setCompletedAt(LocalDateTime.now());

        userRepository.save(buyer);
        userRepository.save(seller);
        userRepository.save(admin);
        propertyRepository.save(property);
        dealRepository.save(deal);

        // Use TransactionService.createTransaction() — proper service layer call
        transactionService.createTransaction(buyer, propertyPrice, "DEBIT",
                "Paid for property ID: " + property.getId());
        transactionService.createTransaction(seller, propertyPrice, "CREDIT",
                "Received payment for property ID: " + property.getId());
        transactionService.createTransaction(buyer, brokerageFee, "DEBIT",
                "Paid brokerage fee for property ID: " + property.getId());
        transactionService.createTransaction(seller, brokerageFee, "DEBIT",
                "Paid brokerage fee for property ID: " + property.getId());
        transactionService.createTransaction(admin, brokerageFee * 2, "CREDIT",
                "Received brokerage for property ID: " + property.getId());

        // Send Confirmation Emails
        emailService.sendEmail(buyer.getEmail(), "Property Booking Confirmed!",
            "Congratulations " + buyer.getUsername() + "!\n\nYour booking for '" + property.getTitle() +
            "' at " + property.getLocation() + " is confirmed.\n\nTotal Paid: " + propertyPrice +
            "\n\nHappy Living!\nPropmanage Team");

        emailService.sendEmail(seller.getEmail(), "Property Sold!",
            "Hello " + seller.getUsername() + ",\n\nYour property '" + property.getTitle() +
            "' has been successfully sold to " + buyer.getUsername() +
            ".\n\nAmount Received: " + propertyPrice +
            "\n\nThank you for listing with us!\nPropmanage Team");

        return "Deal finalized successfully";
    }

    public List<Deal> getSellerPendingDeals(Long sellerId) {
        return dealRepository.findBySellerId(sellerId).stream()
                .filter(d -> d.getStatus().equals(Deal.DealStatus.PENDING))
                .toList();
    }

    // viewSales() — all deals for a seller (pending, completed, rejected)
    public List<Deal> getAllSellerDeals(Long sellerId) {
        return dealRepository.findBySellerId(sellerId);
    }

    public List<Deal> getBuyerDeals(Long buyerId) {
        return dealRepository.findByBuyerId(buyerId);
    }

    public List<Deal> getCompletedDeals() {
        return dealRepository.findByStatus(Deal.DealStatus.COMPLETED);
    }
}
