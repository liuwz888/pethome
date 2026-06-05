package com.pethome.repository;

import com.pethome.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPetOwnerId(Long petOwnerId);
    List<Appointment> findByServiceProviderId(Long serviceProviderId);
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);
    List<Appointment> findByPetOwnerIdAndStatus(Long petOwnerId, Appointment.AppointmentStatus status);
    List<Appointment> findByServiceProviderIdAndStatus(Long serviceProviderId, Appointment.AppointmentStatus status);
    List<Appointment> findByScheduledTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Appointment> findByServiceProviderIdAndScheduledTimeBetween(
        Long serviceProviderId, LocalDateTime start, LocalDateTime end);

    // 根据服务流程环节查询
    List<Appointment> findByPhase(Appointment.ServicePhase phase);
    List<Appointment> findByServiceProviderIdAndPhase(Long serviceProviderId, Appointment.ServicePhase phase);
}
