package com.pethome.repository;

import com.pethome.model.AppointmentReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentReviewRepository extends JpaRepository<AppointmentReview, Long> {
    AppointmentReview findByAppointmentId(Long appointmentId);
}
