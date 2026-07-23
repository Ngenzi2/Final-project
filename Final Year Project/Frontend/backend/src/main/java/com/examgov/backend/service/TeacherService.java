package com.examgov.backend.service;

import com.examgov.backend.domain.Company;
import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.Teacher;
import com.examgov.backend.domain.TimetableSlot;
import com.examgov.backend.domain.User;
import com.examgov.backend.dto.request.TeacherCreateRequest;
import com.examgov.backend.dto.request.TimetableSlotRequest;
import com.examgov.backend.dto.response.TeacherResponse;
import com.examgov.backend.exception.ConflictException;
import com.examgov.backend.exception.ForbiddenActionException;
import com.examgov.backend.exception.NotFoundException;
import com.examgov.backend.repository.CompanyRepository;
import com.examgov.backend.repository.StudentRepository;
import com.examgov.backend.repository.TeacherRepository;
import com.examgov.backend.repository.UserRepository;
import com.examgov.backend.security.AppUserDetails;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherService(
            TeacherRepository teacherRepository,
            CompanyRepository companyRepository,
            UserRepository userRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {
        this.teacherRepository = teacherRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public TeacherResponse create(TeacherCreateRequest request, AppUserDetails principal) {
        if (principal.getCompanyId() == null) {
            throw new ForbiddenActionException("Only a company account can register teachers.");
        }
        Company company =
                companyRepository
                        .findById(principal.getCompanyId())
                        .orElseThrow(() -> new NotFoundException("Company not found."));
        if (!company.isApproved() || company.isSuspended()) {
            throw new ForbiddenActionException("Company must be approved and not suspended before registering teachers.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with email " + request.email() + " already exists.");
        }

        Teacher teacher = new Teacher();
        teacher.setName(request.name());
        teacher.setEmail(request.email());
        teacher.setLicenseNumber(request.licenseNumber());
        teacher.setCompany(company);
        teacher.setRegisteredAt(LocalDate.now());
        teacher = teacherRepository.save(teacher);

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.TEACHER);
        user.setName(request.name());
        user.setCompany(company);
        user.setTeacher(teacher);
        userRepository.save(user);

        return toResponse(teacher);
    }

    @Transactional(readOnly = true)
    public List<TeacherResponse> list(AppUserDetails principal) {
        List<Teacher> teachers =
                switch (principal.getRole()) {
                    case AUTHORITY, EXAM_OFFICER -> teacherRepository.findAll();
                    case COMPANY -> teacherRepository.findByCompanyId(principal.getCompanyId());
                    case TEACHER ->
                            principal.getTeacherId() != null
                                    ? teacherRepository.findById(principal.getTeacherId()).map(List::of).orElse(List.of())
                                    : List.of();
                    case STUDENT ->
                            principal.getStudentId() != null
                                    ? studentRepository.findById(principal.getStudentId())
                                            .map(student -> List.of(student.getTeacher()))
                                            .orElse(List.of())
                                    : List.of();
                };
        return teachers.stream().map(this::toResponse).toList();
    }

    @Transactional
    public TeacherResponse addTimetableSlot(Long teacherId, TimetableSlotRequest request, AppUserDetails principal) {
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow(() -> new NotFoundException("Teacher not found."));
        assertCanManage(teacher, principal);

        TimetableSlot slot = new TimetableSlot();
        slot.setTeacher(teacher);
        slot.setDay(request.day());
        slot.setStartTime(request.startTime());
        slot.setEndTime(request.endTime());
        slot.setActivity(request.activity());
        teacher.getTimetableSlots().add(slot);

        return toResponse(teacherRepository.save(teacher));
    }

    @Transactional
    public TeacherResponse removeTimetableSlot(Long teacherId, Long slotId, AppUserDetails principal) {
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow(() -> new NotFoundException("Teacher not found."));
        assertCanManage(teacher, principal);

        teacher.getTimetableSlots().removeIf(slot -> slot.getId().equals(slotId));
        return toResponse(teacherRepository.save(teacher));
    }

    @Transactional
    public TeacherResponse setActive(Long teacherId, boolean active, AppUserDetails principal) {
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow(() -> new NotFoundException("Teacher not found."));
        if (principal.getRole() != Role.COMPANY || !teacher.getCompany().getId().equals(principal.getCompanyId())) {
            throw new ForbiddenActionException("You do not have access to this teacher.");
        }
        teacher.setActive(active);
        return toResponse(teacherRepository.save(teacher));
    }

    @Transactional
    public void delete(Long teacherId, AppUserDetails principal) {
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow(() -> new NotFoundException("Teacher not found."));
        if (principal.getRole() != Role.COMPANY || !teacher.getCompany().getId().equals(principal.getCompanyId())) {
            throw new ForbiddenActionException("You do not have access to this teacher.");
        }
        if (studentRepository.existsByTeacherId(teacherId)) {
            throw new ConflictException("Cannot delete a teacher with assigned students. Reassign or deactivate them instead.");
        }
        userRepository.findByTeacherId(teacherId).ifPresent(userRepository::delete);
        teacherRepository.delete(teacher);
    }

    private void assertCanManage(Teacher teacher, AppUserDetails principal) {
        if (principal.getRole() == Role.COMPANY && teacher.getCompany().getId().equals(principal.getCompanyId())) {
            return;
        }
        if (principal.getRole() == Role.TEACHER && teacher.getId().equals(principal.getTeacherId())) {
            return;
        }
        throw new ForbiddenActionException("You do not have access to this teacher.");
    }

    private TeacherResponse toResponse(Teacher teacher) {
        List<TeacherResponse.TimetableSlotResponse> slots =
                teacher.getTimetableSlots().stream()
                        .map(
                                s ->
                                        new TeacherResponse.TimetableSlotResponse(
                                                s.getId(), s.getDay(), s.getStartTime(), s.getEndTime(), s.getActivity()))
                        .toList();
        return new TeacherResponse(
                teacher.getId(),
                teacher.getName(),
                teacher.getEmail(),
                teacher.getLicenseNumber(),
                teacher.getCompany().getId(),
                teacher.getRegisteredAt(),
                teacher.isActive(),
                slots);
    }
}
