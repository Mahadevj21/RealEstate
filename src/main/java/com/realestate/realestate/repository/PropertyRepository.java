package com.realestate.realestate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.realestate.realestate.entity.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByLocation(String location);
    List<Property> findBySold(boolean sold);
    List<Property> findByPriceBetween(double minPrice, double maxPrice);
    List<Property> findByLocationAndSold(String location, boolean sold);
    List<Property> findByPriceBetweenAndSold(double minPrice, double maxPrice, boolean sold);
    
    @Query("SELECT p FROM Property p WHERE p.location LIKE %:location% " +
           "AND p.price BETWEEN :minPrice AND :maxPrice AND p.sold = :sold")
    List<Property> filterProperties(
        @Param("location") String location,
        @Param("minPrice") double minPrice,
        @Param("maxPrice") double maxPrice,
        @Param("sold") boolean sold
    );
}
