package com.examgov.backend.seed;

import com.examgov.backend.domain.Company;
import com.examgov.backend.domain.CompanyAdmin;
import com.examgov.backend.domain.ExamRegistration;
import com.examgov.backend.domain.ExamSlot;
import com.examgov.backend.domain.ExamType;
import com.examgov.backend.domain.RegistrationStatus;
import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.Student;
import com.examgov.backend.domain.Teacher;
import com.examgov.backend.domain.TimetableSlot;
import com.examgov.backend.domain.TrainingStatus;
import com.examgov.backend.domain.User;
import com.examgov.backend.domain.WeekDay;
import com.examgov.backend.repository.CompanyRepository;
import com.examgov.backend.repository.ExamRegistrationRepository;
import com.examgov.backend.repository.ExamSlotRepository;
import com.examgov.backend.repository.StudentRepository;
import com.examgov.backend.repository.TeacherRepository;
import com.examgov.backend.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ExamSlotRepository examSlotRepository;
    private final ExamRegistrationRepository examRegistrationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            CompanyRepository companyRepository,
            TeacherRepository teacherRepository,
            StudentRepository studentRepository,
            ExamSlotRepository examSlotRepository,
            ExamRegistrationRepository examRegistrationRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.examSlotRepository = examSlotRepository;
        this.examRegistrationRepository = examRegistrationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        Company safeDrive = new Company();
        safeDrive.setName("SafeDrive Academy");
        safeDrive.setRegistrationNumber("RDB-2019-00456");
        safeDrive.setTin("123456789");
        safeDrive.setEmail("info@safedrive.rw");
        safeDrive.setPhone("+250 788 111 222");
        safeDrive.setAddress("KG 7 Ave, Kacyiru");
        safeDrive.setDistrict("Gasabo");
        safeDrive.setAdmin(
                new CompanyAdmin(
                        "Jean Claude Habimana", "1198780123456789", "+250 788 111 223", "jc.habimana@safedrive.rw", "General Manager"));
        safeDrive.setApproved(true);
        safeDrive.setRegistrationDate(LocalDate.of(2024, 3, 10));
        safeDrive.setApprovalDate(LocalDate.of(2024, 3, 15));
        safeDrive = companyRepository.save(safeDrive);

        Company cityRoad = new Company();
        cityRoad.setName("City Road Training");
        cityRoad.setRegistrationNumber("RDB-2025-00812");
        cityRoad.setTin("987654321");
        cityRoad.setEmail("contact@cityroad.rw");
        cityRoad.setPhone("+250 788 999 000");
        cityRoad.setAddress("KN 4 Rd, Nyarugenge");
        cityRoad.setDistrict("Nyarugenge");
        cityRoad.setAdmin(
                new CompanyAdmin("Alice Uwase", "1198790234567890", "+250 788 999 001", "alice@cityroad.rw", "Director"));
        cityRoad.setApproved(false);
        cityRoad.setRegistrationDate(LocalDate.of(2026, 6, 28));
        companyRepository.save(cityRoad);

        User authority = new User();
        authority.setEmail("authority@examgov.rw");
        authority.setPasswordHash(passwordEncoder.encode("authority123"));
        authority.setRole(Role.AUTHORITY);
        authority.setName("Ministry Authority");
        authority = userRepository.save(authority);

        User companyUser = new User();
        companyUser.setEmail("company@examgov.rw");
        companyUser.setPasswordHash(passwordEncoder.encode("company123"));
        companyUser.setRole(Role.COMPANY);
        companyUser.setName("SafeDrive Academy");
        companyUser.setCompany(safeDrive);
        userRepository.save(companyUser);

        Teacher emmanuel = new Teacher();
        emmanuel.setName("Emmanuel N.");
        emmanuel.setEmail("emmanuel@safedrive.rw");
        emmanuel.setCompany(safeDrive);
        emmanuel.setRegisteredAt(LocalDate.of(2026, 2, 14));
        emmanuel = teacherRepository.save(emmanuel);

        emmanuel.getTimetableSlots().add(slot(emmanuel, WeekDay.MON, 9, 0, 11, 0, "Theory"));
        emmanuel.getTimetableSlots().add(slot(emmanuel, WeekDay.WED, 14, 0, 16, 0, "Practical"));
        emmanuel.getTimetableSlots().add(slot(emmanuel, WeekDay.FRI, 9, 0, 11, 0, "Practical"));
        emmanuel = teacherRepository.save(emmanuel);

        User teacherUser = new User();
        teacherUser.setEmail("teacher@examgov.rw");
        teacherUser.setPasswordHash(passwordEncoder.encode("teacher123"));
        teacherUser.setRole(Role.TEACHER);
        teacherUser.setName("Emmanuel N.");
        teacherUser.setCompany(safeDrive);
        teacherUser.setTeacher(emmanuel);
        userRepository.save(teacherUser);

        Student patrick = new Student();
        patrick.setName("Patrick Mukamanzi");
        patrick.setNationalId("123456789012");
        patrick.setEmail("patrick.mukamanzi@examgov.rw");
        patrick.setExamType(ExamType.CAR);
        patrick.setCompany(safeDrive);
        patrick.setTeacher(emmanuel);
        patrick.setTrainingStatus(TrainingStatus.READY_FOR_EXAM);
        patrick.setRegisteredAt(LocalDate.of(2026, 5, 20));
        patrick = studentRepository.save(patrick);

        User studentUser = new User();
        studentUser.setEmail("student@examgov.rw");
        studentUser.setPasswordHash(passwordEncoder.encode("student123"));
        studentUser.setRole(Role.STUDENT);
        studentUser.setName("Patrick Mukamanzi");
        studentUser.setCompany(safeDrive);
        studentUser.setStudent(patrick);
        userRepository.save(studentUser);

        ExamSlot kigaliCentral = new ExamSlot();
        kigaliCentral.setName("Kigali Central Exam Site");
        kigaliCentral.setLocation("Kigali");
        kigaliCentral.setExamDate(LocalDate.of(2026, 7, 20));
        kigaliCentral.setStartTime(LocalTime.of(8, 0));
        kigaliCentral.setCapacity(30);
        kigaliCentral.setCreatedBy(authority);
        kigaliCentral = examSlotRepository.save(kigaliCentral);

        ExamRegistration registration = new ExamRegistration();
        registration.setStudent(patrick);
        registration.setExamSlot(kigaliCentral);
        registration.setRegisteredBy(teacherUser);
        registration.setRegisteredAt(Instant.now());
        registration.setPaid(true);
        registration.setPaymentDate(LocalDate.of(2026, 7, 1));
        registration.setQrCode("QR-C1-T1-001");
        registration.setStatus(RegistrationStatus.BOOKED);
        examRegistrationRepository.save(registration);
    }

    private TimetableSlot slot(
            Teacher teacher, WeekDay day, int startHour, int startMinute, int endHour, int endMinute, String activity) {
        TimetableSlot slot = new TimetableSlot();
        slot.setTeacher(teacher);
        slot.setDay(day);
        slot.setStartTime(LocalTime.of(startHour, startMinute));
        slot.setEndTime(LocalTime.of(endHour, endMinute));
        slot.setActivity(activity);
        return slot;
    }
}
