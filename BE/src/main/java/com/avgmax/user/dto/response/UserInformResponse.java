package com.avgmax.user.dto.response;

import java.util.List;
import java.util.stream.Collectors;

import com.avgmax.user.dto.data.LinkData;
import com.avgmax.user.dto.query.UserSkillWithSkillQuery;
import com.avgmax.user.domain.User;
import com.avgmax.user.domain.Career;
import com.avgmax.user.domain.Education;
import com.avgmax.user.domain.Profile;
import com.avgmax.user.domain.Certification;

import java.math.BigDecimal;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserInformResponse {
    private String userId;
    private String name;
    private String email;
    private String username;
    private String image;
    private BigDecimal money;
    private String position;
    private String bio;
    private LinkData link;
    private String resume;
    private List<String> stack;
    private List<EducationResponse> education;
    private List<CareerResponse> career;
    private List<String> certification;

    public static UserInformResponse from(
            User user,
            Profile profile,
            List<Career> careerList,
            List<Education> educationList,
            List<Certification> certificationList,
            List<UserSkillWithSkillQuery> userSkillList
    ){
        return UserInformResponse.builder()
            .userId(user.getUserId())
            .name(user.getName())
            .email(user.getEmail())
            .username(user.getUsername())
            .image(user.getImage())
            .money(user.getMoney())
            .position(profile.getPosition())
            .bio(profile.getBio())
            .link(LinkData.of(profile))
            .resume(profile.getResume())
            .stack(
                userSkillList.stream()
                    .map(UserSkillWithSkillQuery::getStack)
                    .collect(Collectors.toList())
            )
            .education(
                educationList.stream()
                    .map(EducationResponse::from)
                    .collect(Collectors.toList())
            )
            .career(
                careerList.stream()
                    .map(CareerResponse::from)
                    .collect(Collectors.toList())
            )
            .certification(
                certificationList.stream()
                    .map(Certification::getCertificateUrl)
                    .collect(Collectors.toList())
            )
            .build();
    }
}
