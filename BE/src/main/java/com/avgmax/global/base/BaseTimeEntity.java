package com.avgmax.global.base;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class BaseTimeEntity {
    protected LocalDateTime createdAt;
    protected LocalDateTime updatedAt;

    public BaseTimeEntity() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }
}
