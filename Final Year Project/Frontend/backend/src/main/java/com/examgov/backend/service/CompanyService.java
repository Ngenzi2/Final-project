package com.examgov.backend.service;

import com.examgov.backend.domain.Company;
import com.examgov.backend.domain.CompanyAdmin;
import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.User;
import com.examgov.backend.dto.request.CompanyRegisterRequest;
import com.examgov.backend.dto.request.CompanyUpdateRequest;
import com.examgov.backend.dto.response.CompanyResponse;
import com.examgov.backend.exception.ConflictException;
import com.examgov.backend.exception.ForbiddenActionException;
import com.examgov.backend.exception.NotFoundException;
import com.examgov.backend.repository.CompanyRepository;
import com.examgov.backend.repository.UserRepository;
import com.examgov.backend.security.AppUserDetails;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    public CompanyService(
            CompanyRepository companyRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            FileStorageService fileStorageService) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public CompanyResponse register(
            CompanyRegisterRequest request,
            MultipartFile registrationCertificate,
            MultipartFile drivingSchoolLicense,
            MultipartFile taxCertificate,
            MultipartFile logo) {
        if (userRepository.existsByEmail(request.adminEmail())) {
            throw new ConflictException("An account with email " + request.adminEmail() + " already exists.");
        }

        Company company = new Company();
        company.setName(request.name());
        company.setRegistrationNumber(request.registrationNumber());
        company.setTin(request.tin());
        company.setEmail(request.email());
        company.setPhone(request.phone());
        company.setAddress(request.address());
        company.setDistrict(request.district());
        company.setAdmin(
                new CompanyAdmin(
                        request.adminFullName(),
                        request.adminNationalId(),
                        request.adminPhone(),
                        request.adminEmail(),
                        request.adminPosition()));
        company.setApproved(false);
        company.setRegistrationDate(LocalDate.now());
        company = companyRepository.save(company);

        company.setRegistrationCertificatePath(
                fileStorageService.store("companies", company.getId(), registrationCertificate));
        company.setDrivingSchoolLicensePath(
                fileStorageService.store("companies", company.getId(), drivingSchoolLicense));
        company.setTaxCertificatePath(fileStorageService.store("companies", company.getId(), taxCertificate));
        company.setLogoPath(fileStorageService.store("companies", company.getId(), logo));
        company = companyRepository.save(company);

        User admin = new User();
        admin.setEmail(request.adminEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.adminPassword()));
        admin.setRole(Role.COMPANY);
        admin.setName(request.adminFullName());
        admin.setCompany(company);
        userRepository.save(admin);

        return toResponse(company);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> list(AppUserDetails principal) {
        List<Company> companies;
        if (principal.getRole() == Role.AUTHORITY || principal.getRole() == Role.EXAM_OFFICER) {
            companies = companyRepository.findAll();
        } else if (principal.getCompanyId() != null) {
            companies = companyRepository.findById(principal.getCompanyId()).map(List::of).orElse(List.of());
        } else {
            companies = List.of();
        }
        return companies.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse get(Long id, AppUserDetails principal) {
        Company company = companyRepository.findById(id).orElseThrow(() -> new NotFoundException("Company not found."));
        assertVisible(company, principal);
        return toResponse(company);
    }

    @Transactional
    public CompanyResponse approve(Long id) {
        Company company = companyRepository.findById(id).orElseThrow(() -> new NotFoundException("Company not found."));
        company.setApproved(true);
        company.setApprovalDate(LocalDate.now());
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse update(Long id, CompanyUpdateRequest request, AppUserDetails principal) {
        Company company = companyRepository.findById(id).orElseThrow(() -> new NotFoundException("Company not found."));
        assertVisible(company, principal);

        company.setEmail(request.email());
        company.setPhone(request.phone());
        company.setAddress(request.address());
        company.setDistrict(request.district());
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse updateDocuments(
            Long id,
            MultipartFile registrationCertificate,
            MultipartFile drivingSchoolLicense,
            MultipartFile taxCertificate,
            MultipartFile logo,
            AppUserDetails principal) {
        Company company = companyRepository.findById(id).orElseThrow(() -> new NotFoundException("Company not found."));
        assertVisible(company, principal);

        if (registrationCertificate != null && !registrationCertificate.isEmpty()) {
            company.setRegistrationCertificatePath(
                    fileStorageService.store("companies", company.getId(), registrationCertificate));
        }
        if (drivingSchoolLicense != null && !drivingSchoolLicense.isEmpty()) {
            company.setDrivingSchoolLicensePath(
                    fileStorageService.store("companies", company.getId(), drivingSchoolLicense));
        }
        if (taxCertificate != null && !taxCertificate.isEmpty()) {
            company.setTaxCertificatePath(fileStorageService.store("companies", company.getId(), taxCertificate));
        }
        if (logo != null && !logo.isEmpty()) {
            company.setLogoPath(fileStorageService.store("companies", company.getId(), logo));
        }
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse suspend(Long id) {
        Company company = companyRepository.findById(id).orElseThrow(() -> new NotFoundException("Company not found."));
        company.setSuspended(true);
        company.setSuspensionDate(java.time.LocalDate.now());
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse unsuspend(Long id) {
        Company company = companyRepository.findById(id).orElseThrow(() -> new NotFoundException("Company not found."));
        company.setSuspended(false);
        company.setSuspensionDate(null);
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public void delete(Long id) {
        Company company = companyRepository.findById(id).orElseThrow(() -> new NotFoundException("Company not found."));
        companyRepository.delete(company);
    }

    private void assertVisible(Company company, AppUserDetails principal) {
        if (principal.getRole() == Role.AUTHORITY || principal.getRole() == Role.EXAM_OFFICER) {
            return;
        }
        if (principal.getCompanyId() != null && principal.getCompanyId().equals(company.getId())) {
            return;
        }
        throw new ForbiddenActionException("You do not have access to this company.");
    }

    private CompanyResponse toResponse(Company company) {
        CompanyAdmin admin = company.getAdmin();
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getRegistrationNumber(),
                company.getTin(),
                company.getEmail(),
                company.getPhone(),
                company.getAddress(),
                company.getDistrict(),
                new CompanyResponse.Documents(
                        toUrl(company.getRegistrationCertificatePath()),
                        toUrl(company.getDrivingSchoolLicensePath()),
                        toUrl(company.getTaxCertificatePath()),
                        toUrl(company.getLogoPath())),
                new CompanyResponse.Admin(
                        admin.getFullName(), admin.getNationalId(), admin.getPhone(), admin.getEmail(),
                        admin.getPosition()),
                company.isApproved(),
                company.isSuspended(),
                company.getRegistrationDate(),
                company.getApprovalDate(),
                company.getSuspensionDate());
    }

    private String toUrl(String path) {
        return path != null ? "/files/" + path : null;
    }
}
