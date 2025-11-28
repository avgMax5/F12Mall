package com.avgmax.user.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import javax.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
   @GetMapping("/{userId}/profile")
   public ResponseEntity<UserInformResponse> getUserInform(@PathVariable String userId) {
         UserInformResponse response = userService.getUserInform(userId);
         return ResponseEntity.ok(response);
   }

   // 내 프로필 조회
   @GetMapping("/me/profile")
   public ResponseEntity<UserInformResponse> getMyProfile(HttpSession session) {
         String userId = (String) session.getAttribute("user");
         UserInformResponse response = userService.getUserInform(userId);
         return ResponseEntity.ok(response);
   }
   
   // 사용자 파일 업로드
   @PostMapping("/upload")
   public ResponseEntity<Map<String, List<String>>> uploadFiles(
         @RequestParam(value = "profile", required = false) List<MultipartFile> profile,
         @RequestParam(value = "resume", required = false) List<MultipartFile> resume,
         @RequestParam(value = "certification", required = false) List<MultipartFile> certification,
         @RequestParam(value = "education", required = false) List<MultipartFile> education,
         @RequestParam(value = "career", required = false) List<MultipartFile> career
   ) {
      Map<String, List<String>> result = new HashMap<>();

      if (profile != null && !profile.isEmpty()) {
         result.put("profile", fileService.uploadForUser(profile));
         log.info("프로필 업로드 완료");
      }
      if (resume != null && !resume.isEmpty()) {
         result.put("resume", fileService.uploadForUser(resume));
         log.info("이력서 업로드 완료");
      }
      if (certification != null && !certification.isEmpty()) {
         result.put("certification", fileService.uploadForUser(certification));
         log.info("자격증 업로드 완료");
      }
      if (education != null && !education.isEmpty()) {
         result.put("education", fileService.uploadForUser(education));
         log.info("학력 업로드 완료");
      }
      if (career != null && !career.isEmpty()) {
         result.put("career", fileService.uploadForUser(career));
         log.info("커리어 업로드 완료");
      }

      return ResponseEntity.ok(result);
   }

   // 보유 코인 목록 조회
   @GetMapping("/me/coins")
   public ResponseEntity<List<UserCoinResponse>> getUserCoinList(HttpSession session){
      String userId = (String) session.getAttribute("user");
      log.debug("GET 보유 코인 목록 조회 userId: {}", userId);
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
         log.info("프로필 정보 수정 userId: {}", userId);
         UserProfileUpdateResponse response = userService.updateUserProfile(userId, request);
         return ResponseEntity.ok(response);
   }
}
