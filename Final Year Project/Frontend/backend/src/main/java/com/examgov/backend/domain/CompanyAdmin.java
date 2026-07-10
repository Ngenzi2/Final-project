package com.examgov.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyAdmin {

    @Column(name = "admin_full_name")
    private String fullName;

    @Column(name = "admin_national_id")
    private String nationalId;

    @Column(name = "admin_phone")
    private String phone;

    @Column(name = "admin_email")
    private String email;

    @Column(name = "admin_position")
    private String position;
}
