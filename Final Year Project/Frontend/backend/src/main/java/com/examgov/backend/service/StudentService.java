package com.examgov.backend.service;

import com.examgov.backend.domain.ExamType;
import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.Student;
import com.examgov.backend.domain.Teacher;
import com.examgov.backend.domain.TrainingStatus;
import com.examgov.backend.domain.User;
import com.examgov.backend.dto.request.StudentCreateRequest;
import com.examgov.backend.dto.response.BulkImportResponse;
import com.examgov.backend.dto.response.StudentResponse;
import com.examgov.backend.exception.ConflictException;
import com.examgov.backend.exception.ForbiddenActionException;
import com.examgov.backend.exception.NotFoundException;
import com.examgov.backend.repository.StudentRepository;
import com.examgov.backend.repository.TeacherRepository;
import com.examgov.backend.repository.UserRepository;
import com.examgov.backend.security.AppUserDetails;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    public StudentService(
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            FileStorageService fileStorageService) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public StudentResponse create(StudentCreateRequest request, MultipartFile photo, AppUserDetails principal) {
        if (principal.getTeacherId() == null) {
            throw new ForbiddenActionException("Only a teacher account can register students.");
        }
        Teacher teacher =
                teacherRepository.findById(principal.getTeacherId()).orElseThrow(() -> new NotFoundException("Teacher not found."));
        if (!teacher.getCompany().isApproved()) {
            throw new ForbiddenActionException("Company must be approved before registering students.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with email " + request.email() + " already exists.");
        }

        Student student = new Student();
        student.setName(request.name());
        student.setNationalId(request.nationalId());
        student.setEmail(request.email());
        student.setExamType(request.examType());
        student.setCompany(teacher.getCompany());
        student.setTeacher(teacher);
        student.setTrainingStatus(TrainingStatus.IN_TRAINING);
        student.setRegisteredAt(LocalDate.now());
        student = studentRepository.save(student);

        if (photo != null && !photo.isEmpty()) {
            student.setPhotoPath(fileStorageService.store("students", student.getId(), photo));
            student = studentRepository.save(student);
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.STUDENT);
        user.setName(request.name());
        user.setCompany(teacher.getCompany());
        user.setStudent(student);
        userRepository.save(user);

        return toResponse(student);
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> list(AppUserDetails principal, Long companyId, Long teacherId, String search) {
        List<Student> students =
                switch (principal.getRole()) {
                    case AUTHORITY -> resolveForAuthority(companyId, teacherId);
                    case COMPANY -> studentRepository.findByCompanyId(principal.getCompanyId());
                    case TEACHER -> studentRepository.findByTeacherId(principal.getTeacherId());
                    case STUDENT ->
                            principal.getStudentId() != null
                                    ? studentRepository.findById(principal.getStudentId()).map(List::of).orElse(List.of())
                                    : List.of();
                };

        if (search != null && !search.isBlank()) {
            String needle = search.trim().toLowerCase();
            students =
                    students.stream()
                            .filter(
                                    s ->
                                            s.getName().toLowerCase().contains(needle)
                                                    || s.getNationalId().toLowerCase().contains(needle))
                            .toList();
        }

        return students.stream().map(this::toResponse).toList();
    }

    @Transactional
    public BulkImportResponse bulkImport(MultipartFile file, AppUserDetails principal) {
        if (principal.getRole() != Role.COMPANY) {
            throw new ForbiddenActionException("Only a company account can bulk import students.");
        }
        Long companyId = principal.getCompanyId();

        List<String> lines;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            lines = reader.lines().toList();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read CSV file: " + e.getMessage(), e);
        }

        List<StudentResponse> created = new ArrayList<>();
        List<BulkImportResponse.RowError> errors = new ArrayList<>();

        for (int i = 1; i < lines.size(); i++) {
            String line = lines.get(i).trim();
            if (line.isEmpty()) continue;
            int rowNumber = i + 1;
            String[] cols = line.split(",", -1);
            if (cols.length < 6) {
                errors.add(
                        new BulkImportResponse.RowError(
                                rowNumber, "Expected 6 columns: name,nationalId,email,password,examType,teacherEmail"));
                continue;
            }

            try {
                String name = cols[0].trim();
                String nationalId = cols[1].trim();
                String email = cols[2].trim();
                String password = cols[3].trim();
                ExamType examType = ExamType.valueOf(cols[4].trim().toUpperCase());
                String teacherEmail = cols[5].trim();

                Teacher teacher =
                        teacherRepository
                                .findByEmail(teacherEmail)
                                .orElseThrow(() -> new NotFoundException("No teacher with email " + teacherEmail));
                if (!teacher.getCompany().getId().equals(companyId)) {
                    throw new ForbiddenActionException("Teacher " + teacherEmail + " does not belong to your company.");
                }
                if (!teacher.getCompany().isApproved()) {
                    throw new ForbiddenActionException("Company must be approved before registering students.");
                }
                if (userRepository.existsByEmail(email)) {
                    throw new ConflictException("An account with email " + email + " already exists.");
                }

                Student student = new Student();
                student.setName(name);
                student.setNationalId(nationalId);
                student.setEmail(email);
                student.setExamType(examType);
                student.setCompany(teacher.getCompany());
                student.setTeacher(teacher);
                student.setTrainingStatus(TrainingStatus.IN_TRAINING);
                student.setRegisteredAt(LocalDate.now());
                student = studentRepository.save(student);

                User user = new User();
                user.setEmail(email);
                user.setPasswordHash(passwordEncoder.encode(password));
                user.setRole(Role.STUDENT);
                user.setName(name);
                user.setCompany(teacher.getCompany());
                user.setStudent(student);
                userRepository.save(user);

                created.add(toResponse(student));
            } catch (IllegalArgumentException e) {
                errors.add(new BulkImportResponse.RowError(rowNumber, "Invalid examType (must be CAR, MOTORCYCLE, or TRUCK)"));
            } catch (RuntimeException e) {
                errors.add(new BulkImportResponse.RowError(rowNumber, e.getMessage()));
            }
        }

        return new BulkImportResponse(created, errors);
    }

    private List<Student> resolveForAuthority(Long companyId, Long teacherId) {
        if (companyId != null && teacherId != null) {
            return studentRepository.findByCompanyIdAndTeacherId(companyId, teacherId);
        }
        if (companyId != null) {
            return studentRepository.findByCompanyId(companyId);
        }
        if (teacherId != null) {
            return studentRepository.findByTeacherId(teacherId);
        }
        return studentRepository.findAll();
    }

    @Transactional
    public StudentResponse setTrainingStatus(
            Long studentId, TrainingStatus status, AppUserDetails principal) {
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new NotFoundException("Student not found."));
        if (principal.getRole() != Role.TEACHER || !student.getTeacher().getId().equals(principal.getTeacherId())) {
            throw new ForbiddenActionException("You do not have access to this student.");
        }
        student.setTrainingStatus(status);
        return toResponse(studentRepository.save(student));
    }

    private StudentResponse toResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getName(),
                student.getNationalId(),
                student.getEmail(),
                student.getExamType(),
                student.getCompany().getId(),
                student.getTeacher().getId(),
                student.getTrainingStatus(),
                student.getRegisteredAt(),
                student.getPhotoPath() != null ? "/files/" + student.getPhotoPath() : null);
    }
}
