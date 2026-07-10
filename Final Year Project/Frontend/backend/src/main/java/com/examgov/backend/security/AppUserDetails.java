package com.examgov.backend.security;

import com.examgov.backend.domain.Role;
import java.util.Collection;
import java.util.List;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class AppUserDetails implements UserDetails {

    private final Long id;
    private final String email;
    private final String passwordHash;
    private final Role role;
    private final String name;
    private final Long companyId;
    private final Long teacherId;
    private final Long studentId;

    public AppUserDetails(
            Long id,
            String email,
            String passwordHash,
            Role role,
            String name,
            Long companyId,
            Long teacherId,
            Long studentId) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.name = name;
        this.companyId = companyId;
        this.teacherId = teacherId;
        this.studentId = studentId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
