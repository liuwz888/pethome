package com.pethome.repository;

import com.pethome.model.AppointmentPhaseRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentPhaseRecordRepository extends JpaRepository<AppointmentPhaseRecord, Long> {
    List<AppointmentPhaseRecord> findByAppointmentId(Long appointmentId);
    List<AppointmentPhaseRecord> findByAppointmentIdOrderByStartTimeAsc(Long appointmentId);
}
