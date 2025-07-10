package com.avgmax.user.dto.request;

import java.util.List;
import com.avgmax.user.dto.data.LinkData;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
// @NoArgsConstructor
// @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserProfileUpdateRequest {
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
    private LinkData link;
    private List<EducationRequest> education;
    private List<CareerRequest> career;

    @Override
    public String toString() {
        return "UserProfileUpdateRequest{" +
                "image='" + image + '\'' +
                ", username='" + username + '\'' +
                ", pwd='" + pwd + '\'' +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", position='" + position + '\'' +
                ", bio='" + bio + '\'' +
                ", stack=" + stack +
                ", resume='" + resume + '\'' +
                ", certificateUrl=" + certificateUrl +
                ", link=" + link +
                ", education=" + education +
                ", career=" + career +
                '}';
    }
}
