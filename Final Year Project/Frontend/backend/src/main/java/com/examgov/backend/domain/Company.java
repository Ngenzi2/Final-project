package com.examgov.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "registration_number")
    private String registrationNumber;

    private String tin;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String address;

    private String district;

    @Column(name = "registration_certificate_path")
    private String registrationCertificatePath;

    @Column(name = "driving_school_license_path")
    private String drivingSchoolLicensePath;

    @Column(name = "tax_certificate_path")
    private String taxCertificatePath;

    @Column(name = "logo_path")
    private String logoPath;

    @Embedded
    private CompanyAdmin admin = new CompanyAdmin();

    @jakarta.persistence.OneToMany(mappedBy = "company", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private java.util.List<User> users = new java.util.ArrayList<>();

    @jakarta.persistence.OneToMany(mappedBy = "company", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Teacher> teachers = new java.util.ArrayList<>();

    @jakarta.persistence.OneToMany(mappedBy = "company", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Student> students = new java.util.ArrayList<>();

    @Column(nullable = false)
    private boolean approved = false;

    @Column(nullable = false)
    private boolean suspended = false;

    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate;

    @Column(name = "approval_date")
    private LocalDate approvalDate;

    @Column(name = "suspension_date")
    private LocalDate suspensionDate;
}
