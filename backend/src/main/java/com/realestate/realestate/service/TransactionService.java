package com.realestate.realestate.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.realestate.entity.Property;
import com.realestate.realestate.entity.Transaction;
import com.realestate.realestate.entity.User;
import com.realestate.realestate.repository.PropertyRepository;
import com.realestate.realestate.repository.TransactionRepository;
import com.realestate.realestate.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    // Save a raw transaction (used internally)
    public Transaction save(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    /**
     * createTransaction – builds and persists a transaction record.
     * Used by DealService and processPayment.
     */
    public Transaction createTransaction(User user, double amount, String type, String description) {
        Transaction t = new Transaction();
        t.setUser(user);
        t.setAmount(amount);
        t.setType(type);
        t.setDescription(description);
        t.setStatus("SUCCESS");
        return transactionRepository.save(t);
    }

    /**
     * processPayment – deducts amount from buyer's balance and creates a DEBIT transaction.
     * Returns the saved transaction, or throws if insufficient funds.
     */
    public Transaction processPayment(Long buyerId, Long propertyId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        double price = property.getPrice();

        if (buyer.getBalance() < price) {
            // Create a FAILED transaction record for audit
            Transaction failed = new Transaction();
            failed.setUser(buyer);
            failed.setAmount(price);
            failed.setType("DEBIT");
            failed.setDescription("Payment FAILED for property: " + property.getTitle() + " (insufficient funds)");
            failed.setStatus("FAILED");
            return transactionRepository.save(failed);
        }

        buyer.setBalance(buyer.getBalance() - price);
        userRepository.save(buyer);

        return createTransaction(buyer, price, "DEBIT",
                "Payment for property: " + property.getTitle() + " (ID: " + propertyId + ")");
    }

    /**
     * updateStatus – updates the status of an existing transaction (e.g., PENDING → SUCCESS/FAILED).
     */
    public Transaction updateStatus(Long transactionId, String status) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        transaction.setStatus(status);
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public Transaction getTransactionById(Long transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
    }
}
