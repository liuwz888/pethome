package com.pethome.config;

import com.pethome.model.User;
import com.pethome.model.Product;
import com.pethome.repository.UserRepository;
import com.pethome.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Set;

/**
 * Initializes test data for development and testing environments.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Initialize users if they do not already exist.
        // Admin user
        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            User u = new User();
            u.setUsername("admin");
            u.setPassword(passwordEncoder.encode("admin123"));
            u.setEmail("admin@example.com");
            u.setRole(User.Role.ADMIN);
            u.setStatus(User.Status.ACTIVE);
            u.setPhone("13800000001");
            u.setAddress("北京市朝阳区");
            return userRepository.save(u);
        });

        // Supplier user
        User supplier1 = userRepository.findByUsername("supplier1").orElseGet(() -> {
            User u = new User();
            u.setUsername("supplier1");
            u.setPassword(passwordEncoder.encode("supplier123"));
            u.setEmail("supplier1@example.com");
            u.setRole(User.Role.SUPPLIER);
            u.setStatus(User.Status.ACTIVE);
            u.setPhone("13800000002");
            u.setAddress("上海市浦东新区");
            return userRepository.save(u);
        });

        // Pet owner user
        User petOwner = userRepository.findByUsername("owner1").orElseGet(() -> {
            User u = new User();
            u.setUsername("owner1");
            u.setPassword(passwordEncoder.encode("owner123"));
            u.setEmail("owner1@example.com");
            u.setRole(User.Role.PET_OWNER);
            u.setStatus(User.Status.ACTIVE);
            u.setPhone("13800000003");
            u.setAddress("北京市海淀区");
            return userRepository.save(u);
        });

        // Initialize sample products if none exist.
        if (productRepository.count() == 0) {
            Product product1 = new Product();
            product1.setName("Premium Dog Food");
            product1.setDescription("High-quality dog food with organic ingredients.");
            product1.setPrice(BigDecimal.valueOf(49.99));
            product1.setTags(Set.of("dog", "food", "premium"));
            product1.setSupplier(supplier1);
            productRepository.save(product1);

            Product product2 = new Product();
            product2.setName("Cat Scratching Post");
            product2.setDescription("Durable scratching post for cats.");
            product2.setPrice(BigDecimal.valueOf(29.99));
            product2.setTags(Set.of("cat", "accessory", "scratch"));
            product2.setSupplier(supplier1);
            productRepository.save(product2);

            Product product3 = new Product();
            product3.setName("Pet Health Supplement");
            product3.setDescription("Vitamins and supplements for pets.");
            product3.setPrice(BigDecimal.valueOf(39.99));
            product3.setTags(Set.of("health", "supplement", "vitamin"));
            product3.setSupplier(supplier1);
            productRepository.save(product3);
        }
    }
}
