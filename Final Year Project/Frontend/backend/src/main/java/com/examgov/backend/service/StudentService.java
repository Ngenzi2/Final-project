package com.examgov.backend.service;

import com.examgov.backend.domain.ApprovalStatus;
import com.examgov.backend.domain.ExamType;
import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.Student;
import com.examgov.backend.domain.Teacher;
import com.examgov.backend.domain.TrainingStatus;
import com.examgov.backend.domain.User;
import com.examgov.backend.dto.request.StudentCreateRequest;
import com.examgov.backend.dto.response.BulkImportResponse;
import com.examgov.backend.dto.response.StudentResponse;
import com.examgov.backend.dto.response.StudentVerifyResponse;
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
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final MailService mailService;
    private final com.examgov.backend.repository.ExamRegistrationRepository examRegistrationRepository;
    private final com.examgov.backend.repository.QrScanLogRepository qrScanLogRepository;
    private final NotificationService notificationService;

    public StudentService(
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            FileStorageService fileStorageService,
            MailService mailService,
            com.examgov.backend.repository.ExamRegistrationRepository examRegistrationRepository,
            com.examgov.backend.repository.QrScanLogRepository qrScanLogRepository,
            NotificationService notificationService) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
        this.mailService = mailService;
        this.examRegistrationRepository = examRegistrationRepository;
        this.qrScanLogRepository = qrScanLogRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public StudentResponse create(StudentCreateRequest request, MultipartFile photo, AppUserDetails principal) {
        if (principal.getTeacherId() == null) {
            throw new ForbiddenActionException("Only a teacher account can register students.");
        }
        Teacher teacher = teacherRepository.findById(principal.getTeacherId())
                .orElseThrow(() -> new NotFoundException("Teacher not found."));
        if (!teacher.getCompany().isApproved() || teacher.getCompany().isSuspended()) {
            throw new ForbiddenActionException(
                    "Company must be approved and not suspended before registering students.");
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
        student.setApprovalStatus(ApprovalStatus.PENDING);
        student.setEmailVerified(false);
        student = studentRepository.save(student);

        if (photo != null && !photo.isEmpty()) {
            student.setPhotoPath(fileStorageService.store("students", student.getId(), photo));
            student = studentRepository.save(student);
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
        user.setRole(Role.STUDENT);
        user.setName(request.name());
        user.setCompany(teacher.getCompany());
        user.setStudent(student);
        user.setEnabled(false);
        userRepository.save(user);

        return toResponse(student);
    }

    @Transactional
    public StudentResponse approve(Long studentId, AppUserDetails principal) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found."));
        assertCanManageRegistration(student, principal);

        if (student.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new ConflictException("This student registration has already been "
                    + student.getApprovalStatus().name().toLowerCase() + ".");
        }

        student.setApprovalStatus(ApprovalStatus.APPROVED);
        student.setApprovedAt(LocalDate.now());
        student.setEmailVerified(true);
        student = studentRepository.save(student);

        String otp = String.format("%06d", RANDOM.nextInt(900000) + 100000);
        User user = userRepository.findByStudentId(student.getId())
                .orElseThrow(() -> new NotFoundException("User account not found."));
        user.setEnabled(true);
        user.setOtpCode(otp);
        user.setOtpExpiry(Instant.now().plus(15, ChronoUnit.MINUTES));
        userRepository.save(user);

        mailService.sendStudentVerificationOtp(student.getEmail(), student.getName(), otp);

        return toResponse(student);
    }

    @Transactional
    public StudentResponse resendVerificationOtp(Long studentId, AppUserDetails principal) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found."));
        assertCanManageRegistration(student, principal);

        if (student.getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw new ConflictException("This student must be approved before a verification code can be sent.");
        }

        String otp = String.format("%06d", RANDOM.nextInt(900000) + 100000);
        User user = userRepository.findByStudentId(student.getId())
                .orElseThrow(() -> new NotFoundException("User account not found."));
        user.setEnabled(true);
        user.setOtpCode(otp);
        user.setOtpExpiry(Instant.now().plus(15, ChronoUnit.MINUTES));
        userRepository.save(user);

        mailService.sendStudentVerificationOtp(student.getEmail(), student.getName(), otp);

        return toResponse(student);
    }

    @Transactional
    public StudentResponse reject(Long studentId, AppUserDetails principal) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found."));
        assertCanManageRegistration(student, principal);

        if (student.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new ConflictException("This student registration has already been "
                    + student.getApprovalStatus().name().toLowerCase() + ".");
        }

        student.setApprovalStatus(ApprovalStatus.REJECTED);
        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentVerifyResponse verifyEmail(String email, String otp) {
        Student student = studentRepository
                .findByEmail(email)
                .orElseThrow(() -> new NotFoundException("No pending verification found for this email."));

        if (student.isEmailVerified()) {
            throw new ConflictException("This email is already verified. You can sign in.");
        }

        if (student.getVerificationToken() == null || !student.getVerificationToken().equals(otp)) {
            throw new ConflictException("Incorrect verification code.");
        }

        if (student.getVerificationTokenExpiresAt() == null
                || student.getVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ConflictException("This code has expired. Ask your company to resend a new code.");
        }

        student.setEmailVerified(true);
        student.setVerificationToken(null);
        student.setVerificationTokenExpiresAt(null);
        studentRepository.save(student);

        userRepository
                .findByStudentId(student.getId())
                .ifPresent(
                        user -> {
                            user.setEnabled(true);
                            userRepository.save(user);
                        });

        return new StudentVerifyResponse(true, "Email verified. You can now sign in.", student.getName());
    }

    private void assertCanManageRegistration(Student student, AppUserDetails principal) {
        if (principal.getRole() == Role.COMPANY && student.getCompany().getId().equals(principal.getCompanyId())) {
            return;
        }
        if (principal.getRole() == Role.AUTHORITY) {
            return;
        }
        throw new ForbiddenActionException("You do not have access to this student registration.");
    }

    private String generateOtp() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> list(AppUserDetails principal, Long companyId, Long teacherId, String search) {
        List<Student> students = switch (principal.getRole()) {
            case AUTHORITY, EXAM_OFFICER -> resolveForAuthority(companyId, teacherId);
            case COMPANY -> studentRepository.findByCompanyId(principal.getCompanyId());
            case TEACHER -> studentRepository.findByTeacherId(principal.getTeacherId());
            case STUDENT ->
                principal.getStudentId() != null
                        ? studentRepository.findById(principal.getStudentId()).map(List::of).orElse(List.of())
                        : List.of();
        };

        if (search != null && !search.isBlank()) {
            String needle = search.trim().toLowerCase();
            students = students.stream()
                    .filter(
                            s -> s.getName().toLowerCase().contains(needle)
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
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            lines = reader.lines().toList();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read CSV file: " + e.getMessage(), e);
        }

        List<StudentResponse> created = new ArrayList<>();
        List<BulkImportResponse.RowError> errors = new ArrayList<>();

        for (int i = 1; i < lines.size(); i++) {
            String line = lines.get(i).trim();
            if (line.isEmpty())
                continue;
            int rowNumber = i + 1;
            String[] cols = line.split(",", -1);
            if (cols.length < 5) {
                errors.add(
                        new BulkImportResponse.RowError(
                                rowNumber, "Expected 5 columns: name,nationalId,email,examType,teacherEmail"));
                continue;
            }

            try {
                String name = cols[0].trim();
                String nationalId = cols[1].trim();
                String email = cols[2].trim();
                ExamType examType = ExamType.valueOf(cols[3].trim().toUpperCase());
                String teacherEmail = cols[4].trim();

                Teacher teacher = teacherRepository
                        .findByEmail(teacherEmail)
                        .orElseThrow(() -> new NotFoundException("No teacher with email " + teacherEmail));
                if (!teacher.getCompany().getId().equals(companyId)) {
                    throw new ForbiddenActionException("Teacher " + teacherEmail + " does not belong to your company.");
                }
                if (!teacher.getCompany().isApproved() || teacher.getCompany().isSuspended()) {
                    throw new ForbiddenActionException(
                            "Company must be approved and not suspended before registering students.");
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
                user.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                user.setRole(Role.STUDENT);
                user.setName(name);
                user.setCompany(teacher.getCompany());
                user.setStudent(student);
                userRepository.save(user);

                created.add(toResponse(student));
            } catch (IllegalArgumentException e) {
                errors.add(new BulkImportResponse.RowError(rowNumber,
                        "Invalid examType (must be CAR, MOTORCYCLE, or TRUCK)"));
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
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found."));
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
                student.getPhotoPath() != null ? "/files/" + student.getPhotoPath() : null,
                student.getApprovalStatus(),
                student.isEmailVerified());
    }

    @Transactional
    public void delete(Long studentId, AppUserDetails principal) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found."));

        if (principal.getRole() == Role.TEACHER && !student.getTeacher().getId().equals(principal.getTeacherId())) {
            throw new ForbiddenActionException("You can only delete your own students.");
        } else if (principal.getRole() == Role.COMPANY
                && !student.getCompany().getId().equals(principal.getCompanyId())) {
            throw new ForbiddenActionException("You can only delete students belonging to your company.");
        } else if (principal.getRole() != Role.AUTHORITY && principal.getRole() != Role.COMPANY
                && principal.getRole() != Role.TEACHER) {
            throw new ForbiddenActionException("You do not have permission to delete students.");
        }

        String deleterName = principal.getName() + " (" + principal.getRole().name() + ")";
        String msg = "The student " + student.getName() + " (ID: " + student.getNationalId() + ") was deleted by "
                + deleterName + ".";
        notificationService.notifyUsers("Student Registration Deleted", msg, student.getCompany().getId(),
                student.getTeacher().getId());

        userRepository.findByStudentId(studentId).ifPresent(userRepository::delete);

        List<com.examgov.backend.domain.ExamRegistration> regs = examRegistrationRepository.findByStudentId(studentId);
        for (com.examgov.backend.domain.ExamRegistration reg : regs) {
            qrScanLogRepository.deleteByExamRegistrationId(reg.getId());
        }
        examRegistrationRepository.deleteAll(regs);

        studentRepository.delete(student);
    }
}
