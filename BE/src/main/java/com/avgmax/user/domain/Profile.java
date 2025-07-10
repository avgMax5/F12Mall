package com.avgmax.user.domain;

import java.util.Objects;

import com.avgmax.global.base.BaseTimeEntity;
import com.avgmax.user.dto.data.LinkData;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class Profile extends BaseTimeEntity {

    private String userId;

    private String position;

    private String bio;

    private String github;

    private String blog;

    private String sns;

    private String linkedin;
    
    private String resume;

    public void updateIfChanged(String position, String bio, LinkData link, String resume){
        if (!Objects.equals(this.bio, bio)) {
            this.bio = bio;
        }
        if (!Objects.equals(this.position, position)) {
            this.position = position;
        }
        if (link != null){
            if (!Objects.equals(this.github, link.getGithub())){
                this.github = link.getGithub();
            }
            if (!Objects.equals(this.blog, link.getBlog())){
                this.blog = link.getBlog();
            }
            if (!Objects.equals(this.sns, link.getSns())){
                this.sns = link.getSns();
            }
            if (!Objects.equals(this.linkedin, link.getLinkedin())){
                this.linkedin = link.getLinkedin();
            }
        }
        if (!Objects.equals(this.resume, resume)) {
            this.resume = resume;
        }
    }
}
