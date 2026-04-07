package com.realestate.realestate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.realestate.realestate.entity.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByLocation(String location);
    List<Property> findBySold(boolean sold);
    long countBySold(boolean sold);
    List<Property> findByPriceBetween(double minPrice, double maxPrice);
    List<Property> findByLocationAndSold(String location, boolean sold);
    List<Property> findByPriceBetweenAndSold(double minPrice, double maxPrice, boolean sold);
    List<Property> findBySellerId(Long sellerId);

    // Approval-aware queries
    List<Property> findByApprovedAndSold(boolean approved, boolean sold);

    @Query("SELECT p FROM Property p WHERE p.location LIKE %:location% " +
           "AND p.price BETWEEN :minPrice AND :maxPrice AND p.sold = :sold")
    List<Property> filterProperties(
        @Param("location") String location,
        @Param("minPrice") double minPrice,
        @Param("maxPrice") double maxPrice,
        @Param("sold") boolean sold
    );

    // filterProperties — only approved listings (used by PropertyService.filterProperties)
    @Query("SELECT p FROM Property p WHERE p.approved = true " +
           "AND (:location = '' OR p.location LIKE %:location%) " +
           "AND p.price BETWEEN :minPrice AND :maxPrice AND p.sold = :sold")
    List<Property> filterApprovedProperties(
        @Param("location") String location,
        @Param("minPrice") double minPrice,
        @Param("maxPrice") double maxPrice,
        @Param("sold") boolean sold
    );
}
