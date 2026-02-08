package com.realestate.realestate.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    public enum Role {
        ADMIN,
        BUYER,
        SELLER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean blocked;

    // ❤️ FAVOURITES
    @ManyToMany
    @JoinTable(
        name = "favourites",
        joinColumns = @JoinColumn(name = "buyer_id"),
        inverseJoinColumns = @JoinColumn(name = "property_id")
    )
    @JsonIgnore
    private Set<Property> favouriteProperties = new HashSet<>();
}
