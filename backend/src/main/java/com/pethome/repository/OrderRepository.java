package com.pethome.repository;

import com.pethome.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByPetOwnerId(Long petOwnerId);
    List<Order> findByServiceProviderId(Long serviceProviderId);
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByPetOwnerIdAndStatus(Long petOwnerId, Order.OrderStatus status);
}
