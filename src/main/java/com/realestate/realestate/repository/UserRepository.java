package com.realestate.realestate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.realestate.realestate.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    Optional<User> findByEmail(String email);
}
