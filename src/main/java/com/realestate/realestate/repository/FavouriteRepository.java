package com.realestate.realestate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.realestate.entity.Favourite;
import com.realestate.realestate.entity.User;

public interface FavouriteRepository extends JpaRepository<Favourite, Long> {
    List<Favourite> findByUser(User user);
    List<Favourite> findByUserId(Long userId);
    Optional<Favourite> findByUserIdAndPropertyId(Long userId, Long propertyId);
    void deleteByUserIdAndPropertyId(Long userId, Long propertyId);
}
