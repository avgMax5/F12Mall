package com.avgmax.user.controller;

import java.util.List;

import javax.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.avgmax.user.dto.request.UserProfileUpdateRequest;
import com.avgmax.user.dto.response.UserCoinResponse;
import com.avgmax.user.dto.response.UserInformResponse;
import com.avgmax.user.dto.response.UserProfileUpdateResponse;
import com.avgmax.user.service.UserService;
import com.avgmax.user.service.FileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
   private final UserService userService;
   private final FileService fileService;

   // 프로필 조회
   @GetMapping("/me/profile")
   public ResponseEntity<UserInformResponse> getUserInform(HttpSession session) {
         String userId = (String) session.getAttribute("user");
         UserInformResponse response = userService.getUserInform(userId);
         return ResponseEntity.ok(response);
   }

   // 사용자 파일 업로드
   @PostMapping("/me/uploads")
   public ResponseEntity<List<String>> uploadFiles(
         HttpSession session,
         @RequestParam("file") List<MultipartFile> files) {

      String userId = (String) session.getAttribute("user");
      List<String> urls = fileService.uploadForUser(userId, files);
      return ResponseEntity.ok(urls);
   }

   // 보유 코인 목록 조회
   @GetMapping("/me/coins")
   public ResponseEntity<List<UserCoinResponse>> getUserCoinList(HttpSession session){
      String userId = (String) session.getAttribute("user");
      log.info("GET 보유 코인 목록 조회 userId: {}", userId);
      List<UserCoinResponse> responses = userService.getUserCoinList(userId);
      return ResponseEntity.ok(responses);
   }

   // 프로필 수정
   @PutMapping("/me/profile")
   public ResponseEntity<UserProfileUpdateResponse> updateUserProfile(
         HttpSession session,
         @RequestBody UserProfileUpdateRequest request
      ){
         String userId = (String) session.getAttribute("user");
         UserProfileUpdateResponse response = userService.updateUserProfile(userId, request);
         return ResponseEntity.ok(response);
   }
}
