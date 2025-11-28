package com.avgmax.user.dto.request;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.avgmax.trade.domain.Coin;
import com.avgmax.trade.domain.UserCoin;
import com.avgmax.user.domain.User;
import com.avgmax.user.domain.Profile;
import com.avgmax.user.dto.data.LinkData;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
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
    private LinkData link;
    private List<EducationRequest> education;
    private List<CareerRequest> career;

    public User toUser(PasswordEncoder encoder) {
        return User.builder()
                .name(name)
                .email(email)
                .username(username)
                .pwd(encoder.encode(pwd))
                .image(image)
                .build();
    }

    public Profile toProfile(String userId){
        return Profile.builder()
                .userId(userId)
                .position(position)
                .github(link.getGithub())
                .sns(link.getSns())
                .blog(link.getBlog())
                .linkedin(link.getLinkedin())
                .bio(bio)
                .resume(resume)
                .build();
    } 

    public Coin toCoin(String userId) {
        return Coin.builder()
                .creatorId(userId)
                .build();
    }

    public UserCoin toUserCoin(String userId, String coinId) {
        return UserCoin.builder()
                .holderId(userId)
                .coinId(coinId)
                .build();
    }
}
