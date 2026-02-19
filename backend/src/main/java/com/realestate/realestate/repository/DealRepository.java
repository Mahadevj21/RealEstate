package com.realestate.realestate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.realestate.entity.Deal;

@Repository
public interface DealRepository extends JpaRepository<Deal, Long> {
    List<Deal> findByBuyerId(Long buyerId);
    List<Deal> findBySellerId(Long sellerId);
    List<Deal> findByPropertyId(Long propertyId);
    List<Deal> findByStatus(Deal.DealStatus status);
}
