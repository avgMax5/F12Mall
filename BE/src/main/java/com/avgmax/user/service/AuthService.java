package com.avgmax.user.service;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

import com.avgmax.trade.mapper.ClosingPriceMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.avgmax.trade.domain.ClosingPrice;
import com.avgmax.trade.domain.Coin;
import com.avgmax.trade.domain.UserCoin;
import com.avgmax.user.domain.User;
import com.avgmax.user.domain.UserSkill;
import com.avgmax.user.dto.request.UserSignupRequest;
import com.avgmax.user.dto.response.UserLoginResponse;
import com.avgmax.user.dto.response.UserSignupResponse;
import com.avgmax.user.dto.response.UsernameCheckResponse;
import com.avgmax.user.exception.UserException;
import com.avgmax.user.mapper.CareerMapper;
import com.avgmax.user.mapper.CertificationMapper;
import com.avgmax.user.mapper.EducationMapper;
import com.avgmax.user.mapper.UserMapper;
import com.avgmax.user.mapper.UserSkillMapper;
import com.avgmax.user.mapper.ProfileMapper;
import com.avgmax.trade.mapper.CoinMapper;
import com.avgmax.trade.mapper.UserCoinMapper;
import com.avgmax.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserSkillMapper userSkillMapper;
    private final CareerMapper careerMapper;
    private final ProfileMapper profileMapper;
    private final EducationMapper educationMapper;
    private final CertificationMapper certificationMapper;
    private final CoinMapper coinMapper;
    private final UserCoinMapper userCoinMapper;
    private final ClosingPriceMapper closingPriceMapper;

    @Transactional
    public UserSignupResponse createUser(UserSignupRequest request) {
        try {
            // 사용자 기본 정보 저장
            User user = request.toUser(passwordEncoder);
            userMapper.insert(user);
            String userId = user.getUserId();

            // 프로필 정보 저장
            profileMapper.insert(request.toProfile(userId));

            // 스킬 정보 저장
            List<String> stack = request.getStack();
            List<String> skillIds = (stack == null || stack.isEmpty())
                ? new ArrayList<>()
                : userSkillMapper.selectByStack(stack);
            List<UserSkill> userSkills = skillIds.stream()
                .map(skillId -> UserSkill.of(
                    userId, 
                    skillId))
                .collect(Collectors.toList());
            for (UserSkill userSkill : userSkills) {userSkillMapper.insert(userSkill);}

            // 경력 정보 저장
            request.getCareer().forEach(career -> 
                careerMapper.insert(career.toEntity(userId)));

            // 학력 정보 저장
            request.getEducation().forEach(education -> 
                educationMapper.insert(education.toEntity(userId)));

            // 자격증 정보 저장
            request.getCertificateUrl().forEach(certification -> 
                certificationMapper.insert(certification.toEntity(userId)));

            // 코인 정보 저장
            Coin coin = request.toCoin(userId);
            coinMapper.insert(coin);

            // 사용자 코인 정보 저장
            UserCoin userCoin = request.toUserCoin(userId, coin.getCoinId());
            userCoinMapper.insert(userCoin);

            // 종가 정보 초기화
            ClosingPrice closingPrice = ClosingPrice.init(coin.getCoinId());
            closingPriceMapper.insert(closingPrice);
            
            return UserSignupResponse.of(true, "회원가입 성공", userId);
        } catch (Exception e) {
            throw UserException.of(ErrorCode.USER_SIGNUP_FAILED);
        }
    }

    @Transactional(readOnly = true)
    public UserLoginResponse login(String username, String rawPassword) {
        User user = userMapper.selectByUsername(username)
                .orElseThrow(() -> UserException.of(ErrorCode.USER_NOT_FOUND));
        user.validatePassword(rawPassword, passwordEncoder);
        return UserLoginResponse.of(true, user.getUserId());
    }

    @Transactional(readOnly = true)
    public UsernameCheckResponse isUsernameDuplicate(String username) {
        Optional<User> existingUser = userMapper.selectByUsername(username);
        return UsernameCheckResponse.of(existingUser.isPresent());
    }

}