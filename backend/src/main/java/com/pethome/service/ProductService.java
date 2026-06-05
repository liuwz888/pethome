package com.pethome.service;

import com.pethome.dto.ProductRequest;
import com.pethome.dto.ProductResponse;
import com.pethome.model.Product;
import com.pethome.model.User;
import com.pethome.repository.ProductRepository;
import com.pethome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProductsIncludingInactive() {
        return productRepository.findAll().stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("商品不存在: " + id));
        return new ProductResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setTags(request.getTags());
        product.setCategory(request.getCategory() != null ?
            Product.ProductCategory.valueOf(request.getCategory()) : null);
        product.setIsActive(true);
        product.setCreatedAt(java.time.LocalDateTime.now());
        product.setUpdatedAt(java.time.LocalDateTime.now());
        product.setImageUrl(request.getImageUrl());

        User currentUser = getAuthenticatedUser();
        product.setSupplier(currentUser);

        productRepository.save(product);
        return new ProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("商品不存在: " + id));

        User currentUser = getAuthenticatedUser();
        if (!currentUser.getRole().name().equals("ADMIN") &&
            !product.getSupplier().getId().equals(currentUser.getId())) {
            throw new RuntimeException("无权修改此商品");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setTags(request.getTags());
        product.setCategory(request.getCategory() != null ?
            Product.ProductCategory.valueOf(request.getCategory()) : null);
        product.setUpdatedAt(java.time.LocalDateTime.now());
        product.setImageUrl(request.getImageUrl());

        productRepository.save(product);
        return new ProductResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("商品不存在: " + id));

        User currentUser = getAuthenticatedUser();
        if (!currentUser.getRole().name().equals("ADMIN") &&
            !product.getSupplier().getId().equals(currentUser.getId())) {
            throw new RuntimeException("无权删除此商品");
        }

        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchByTag(String tag) {
        return productRepository.findByTagsContaining(tag).stream()
                .filter(Product::getIsActive)
                .map(ProductResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Product.ProductCategory category) {
        return productRepository.findByCategoryAndIsActiveTrue(category).stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsBySupplier(Long supplierId) {
        return productRepository.findBySupplierId(supplierId).stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String username) {
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + username));
        }
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            return userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + userDetails.getUsername()));
        }
        throw new IllegalStateException("Unable to determine authenticated user");
    }
}
