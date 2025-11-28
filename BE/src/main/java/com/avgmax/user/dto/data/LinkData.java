package com.avgmax.user.dto.data;

import com.avgmax.user.domain.Profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkData {
    private String github;
    private String sns;
    private String blog;
    private String linkedin;

    public static LinkData of(Profile profile){
        return LinkData.builder()
                .github(profile.getGithub())
                .sns(profile.getSns())
                .blog(profile.getBlog())
                .linkedin(profile.getLinkedin())
                .build();
    } 
}
