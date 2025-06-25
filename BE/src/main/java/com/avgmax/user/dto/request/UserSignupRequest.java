package com.avgmax.user.dto.request;

import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.avgmax.user.domain.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSignupRequest {
    private String image;
    private String username;
    private String pwd;
    private String email;
    private String name;
    private String position;
    private String bio;
    private List<String> stack;
    private String resume;
    private List<CertificationRequest> certificateUrl;
    private String github;
    private String sns;
    private String blog;
    private String linkedin;
    private List<EducationRequest> education;
    private List<CareerRequest> career;

    public User toEntity(BCryptPasswordEncoder encoder) {
        return User.builder()
                .name(name)
                .email(email)
                .username(username)
                .password(encoder.encode(pwd))
                .imageUrl(image)
                .build();
    }

}
