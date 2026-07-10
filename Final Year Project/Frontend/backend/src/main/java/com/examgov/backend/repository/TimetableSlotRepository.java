package com.examgov.backend.repository;

import com.examgov.backend.domain.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {
}
