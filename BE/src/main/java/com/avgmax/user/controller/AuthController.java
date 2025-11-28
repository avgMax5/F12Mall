package com.avgmax.user.controller;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.avgmax.user.dto.request.UserLoginRequest;
import com.avgmax.user.dto.request.UserSignupRequest;
import com.avgmax.user.dto.request.UsernameCheckRequest;
import com.avgmax.user.dto.response.UserLoginResponse;
import com.avgmax.user.dto.response.UserLogoutResponse;
import com.avgmax.user.dto.response.UserSignupResponse;
import com.avgmax.user.dto.response.UsernameCheckResponse;
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
        UserLoginResponse response = authService.login(request.getUsername(), request.getPassword());
        session.setAttribute("user", response.getUserId());
        return ResponseEntity.status(HttpStatus.OK)
            .body(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<UserSignupResponse> signup(@RequestBody UserSignupRequest request) {
        log.info("회원가입 시도: {}", request.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(authService.createUser(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<UserLogoutResponse> logout(HttpSession session, HttpServletResponse response) {
        log.info("로그아웃 시도: {}", session.getAttribute("user"));      
        session.invalidate();
        
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
        
        log.info("로그아웃 완료");
        
        return ResponseEntity.status(HttpStatus.OK).body(UserLogoutResponse.of(true));
    }

    @PostMapping("/check-username")
    public ResponseEntity<UsernameCheckResponse> checkUsernameDuplicate(@RequestBody UsernameCheckRequest request) {
        log.info("Username 중복 확인 요청: {}", request.getUsername());
        UsernameCheckResponse response = authService.isUsernameDuplicate(request.getUsername());
        return ResponseEntity.ok(response);
    }

}