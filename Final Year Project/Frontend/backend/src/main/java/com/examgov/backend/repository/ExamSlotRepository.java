package com.examgov.backend.repository;

import com.examgov.backend.domain.ExamSlot;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamSlotRepository extends JpaRepository<ExamSlot, Long> {
    List<ExamSlot> findByExamDate(LocalDate examDate);

    List<ExamSlot> findByExamDateBetweenOrderByExamDateAscStartTimeAsc(LocalDate from, LocalDate to);

    List<ExamSlot> findAllByOrderByExamDateAscStartTimeAsc();
}
