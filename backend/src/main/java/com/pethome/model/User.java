package com.pethome.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Profile fields
    @Column(name = "phone_number")
    private String phone;

    @Column(name = "avatar_url")
    private String avatar;

    @Column(length = 500)
    private String address;

    public enum Role {
        ADMIN, SUPPLIER, PET_OWNER, SERVICE
    }

    public enum Status {
        ACTIVE, SUSPENDED
    }
}
