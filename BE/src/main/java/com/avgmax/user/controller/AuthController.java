package com.avgmax.user.controller;

import javax.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.avgmax.user.domain.User;
import com.avgmax.user.dto.request.UserLoginRequest;
import com.avgmax.user.dto.request.UserSignupRequest;
import com.avgmax.user.dto.response.UserLoginResponse;
import com.avgmax.user.dto.response.UserLogoutResponse;
import com.avgmax.user.dto.response.UserSignupResponse;
import com.avgmax.user.service.AuthService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@RequestBody UserLoginRequest request, HttpSession session) {
        log.info("로그인 시도: {}", request.getUsername());

        User user = authService.login(request.getUsername(), request.getPassword());
        session.setAttribute("user", user);

        return ResponseEntity.status(HttpStatus.OK)
            .body(UserLoginResponse.of(true, session.getId()));
    }

    @PostMapping("/signup")
    public ResponseEntity<UserSignupResponse> signup(@RequestBody UserSignupRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(authService.createUser(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<UserLogoutResponse>  logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.status(HttpStatus.OK).body(UserLogoutResponse.of(true));
    }

}
