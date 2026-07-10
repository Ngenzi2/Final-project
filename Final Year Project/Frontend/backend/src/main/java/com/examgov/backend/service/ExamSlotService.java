package com.examgov.backend.service;

import com.examgov.backend.domain.ExamSlot;
import com.examgov.backend.domain.RegistrationStatus;
import com.examgov.backend.domain.User;
import com.examgov.backend.dto.request.ExamSlotRequest;
import com.examgov.backend.dto.response.ExamSlotResponse;
import com.examgov.backend.exception.NotFoundException;
import com.examgov.backend.repository.ExamRegistrationRepository;
import com.examgov.backend.repository.ExamSlotRepository;
import com.examgov.backend.repository.UserRepository;
import com.examgov.backend.security.AppUserDetails;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExamSlotService {

    private final ExamSlotRepository examSlotRepository;
    private final ExamRegistrationRepository examRegistrationRepository;
    private final UserRepository userRepository;

    public ExamSlotService(
            ExamSlotRepository examSlotRepository,
            ExamRegistrationRepository examRegistrationRepository,
            UserRepository userRepository) {
        this.examSlotRepository = examSlotRepository;
        this.examRegistrationRepository = examRegistrationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ExamSlotResponse create(ExamSlotRequest request, AppUserDetails principal) {
        ExamSlot slot = new ExamSlot();
        slot.setName(request.name());
        slot.setLocation(request.location());
        slot.setExamDate(request.examDate());
        slot.setStartTime(request.startTime());
        slot.setCapacity(request.capacity());

        User creator = userRepository.findById(principal.getId()).orElse(null);
        slot.setCreatedBy(creator);

        return toResponse(examSlotRepository.save(slot));
    }

    @Transactional(readOnly = true)
    public List<ExamSlotResponse> list(LocalDate from, LocalDate to) {
        List<ExamSlot> slots;
        if (from != null && to != null) {
            slots = examSlotRepository.findByExamDateBetweenOrderByExamDateAscStartTimeAsc(from, to);
        } else {
            slots = examSlotRepository.findAllByOrderByExamDateAscStartTimeAsc();
        }
        return slots.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ExamSlotResponse> byDate(LocalDate date) {
        return examSlotRepository.findByExamDate(date).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ExamSlotResponse get(Long id) {
        ExamSlot slot = examSlotRepository.findById(id).orElseThrow(() -> new NotFoundException("Exam slot not found."));
        return toResponse(slot);
    }

    private ExamSlotResponse toResponse(ExamSlot slot) {
        long bookedCount = examRegistrationRepository.countByExamSlotIdAndStatus(slot.getId(), RegistrationStatus.BOOKED);
        return new ExamSlotResponse(
                slot.getId(), slot.getName(), slot.getLocation(), slot.getExamDate(), slot.getStartTime(), slot.getCapacity(), bookedCount);
    }
}
