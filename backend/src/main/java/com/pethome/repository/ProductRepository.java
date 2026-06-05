package com.pethome.repository;

import com.pethome.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsActiveTrue();
    List<Product> findBySupplierId(Long supplierId);
    List<Product> findByTagsContaining(String tag);
    List<Product> findByCategory(Product.ProductCategory category);
    List<Product> findByCategoryAndIsActiveTrue(Product.ProductCategory category);
}