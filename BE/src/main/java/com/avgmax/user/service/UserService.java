package com.avgmax.user.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// import com.avgmax.trade.domain.Trade;
import com.avgmax.trade.domain.Order;
import com.avgmax.trade.domain.enums.OrderType;
import com.avgmax.trade.mapper.OrderMapper;
import com.avgmax.trade.dto.query.UserCoinWithCoinWithCreatorQuery;
import com.avgmax.user.domain.Career;
import com.avgmax.user.domain.Certification;
import com.avgmax.user.domain.Education;
import com.avgmax.user.domain.Profile;
import com.avgmax.user.domain.UserSkill;
import com.avgmax.user.domain.User;

import com.avgmax.user.mapper.UserMapper;
import com.avgmax.user.mapper.CareerMapper;
import com.avgmax.user.mapper.EducationMapper;
import com.avgmax.user.mapper.ProfileMapper;
import com.avgmax.user.mapper.UserSkillMapper;
import com.avgmax.trade.mapper.UserCoinMapper;
import com.avgmax.user.mapper.CertificationMapper;
import com.avgmax.user.dto.data.LinkData;
import com.avgmax.user.dto.query.UserSkillWithSkillQuery;
import com.avgmax.user.dto.request.CareerRequest;
import com.avgmax.user.dto.request.CertificationRequest;
import com.avgmax.user.dto.request.EducationRequest;
import com.avgmax.user.dto.request.UserProfileUpdateRequest;
import com.avgmax.user.dto.response.UserCoinResponse;
import com.avgmax.user.dto.response.UserInformResponse;
import com.avgmax.user.dto.response.UserProfileUpdateResponse;

import lombok.RequiredArgsConstructor;
import com.avgmax.global.exception.ErrorCode;
import com.avgmax.user.exception.UserException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    private final ProfileMapper profileMapper;
    private final CareerMapper careerMapper;
    private final EducationMapper educationMapper;
    private final CertificationMapper certificationMapper;
    private final UserSkillMapper userSkillMapper;
    private final UserCoinMapper userCoinMapper;
    private final OrderMapper orderMapper;

    @Transactional(readOnly = true)
    public UserInformResponse getUserInform(String userId){
        User user = userMapper.selectByUserId(userId)
            .orElseThrow(() -> UserException.of(ErrorCode.USER_NOT_FOUND));
        Profile profile = profileMapper.selectByUserId(userId);
        List<Career> careerList = careerMapper.selectByUserId(userId);
        List<Education> educationList = educationMapper.selectByUserId(userId);
        List<Certification> certificationList = certificationMapper.selectByUserId(userId);
        List<UserSkillWithSkillQuery> userSkillList = userSkillMapper.selectByUserId(userId);
        
         return UserInformResponse.from(user, profile, careerList, educationList, certificationList, userSkillList);
    }

    @Transactional
    public UserProfileUpdateResponse updateUserProfile(String userId, UserProfileUpdateRequest request){
        User user = updateUser(userId, request.getName(), request.getEmail(), request.getUsername(), request.getPwd(), request.getImage());
        userMapper.update(user);
        
        Profile profile = updateProfile(userId, request.getBio(), request.getPosition(), request.getLink(), request.getResume());
        profileMapper.update(profile);
        
        List<CareerRequest> careerRequests = request.getCareer();
        careerMapper.deleteByUserId(userId);
        careerRequests.stream()
            .map(careerRequest -> careerRequest.toEntity(userId))
            .forEach(career -> careerMapper.insert(career));
        
        List<CertificationRequest> certificationRequests = request.getCertificateUrl();
        careerMapper.deleteByUserId(userId);
        certificationRequests.stream()
            .map(certificationRequest -> certificationRequest.toEntity(userId))
            .forEach(certification -> certificationMapper.insert(certification));
        
        List<EducationRequest> educationnRequests = request.getEducation();
        educationMapper.deleteByUserId(userId);
        educationnRequests.stream()
            .map(educationRequest -> educationRequest.toEntity(userId))
            .forEach(education -> educationMapper.insert(education));
        
        List<String> stackList = request.getStack();
        List<String> skillIds = userSkillMapper.selectByStack(stackList);
        List<UserSkill> userSkills = skillIds.stream()
            .map(skillId -> UserSkill.of(userId, skillId))
            .collect(Collectors.toList());
        
        userSkillMapper.deleteByUserId(userId);
        userSkills.forEach(userSkillMapper::insert);

        return UserProfileUpdateResponse.of(true);
    }

    private User updateUser(String userId, String name, String email, String username, String pwd, String image) {
        User user = userMapper.selectByUserId(userId)
            .orElseThrow(() -> UserException.of(ErrorCode.USER_NOT_FOUND));
        user.updateIfChanged(name, email, username, pwd, image);
        userMapper.update(user);
        return user;
    }

    private Profile updateProfile(String userId, String bio, String position, LinkData link, String resume){
        Profile profile = profileMapper.selectByUserId(userId);
        profile.updateIfChanged(position, bio, link, resume);
        return profile;
    }

    @Transactional(readOnly = true)
    public List<UserCoinResponse> getUserCoinList(String userId) {
        List<UserCoinWithCoinWithCreatorQuery> userCoins = userCoinMapper.selectAllByHolderId(userId);

        return userCoins.stream()
                .map(userCoin -> {
                    String coinId = userCoin.getCoinId();
                    List<Order> orders = orderMapper.selectAllByUserIdAndCoinId(userId, coinId);
                    BigDecimal sellingQuantity = calculateSellingQuantity(orders);
                    return UserCoinResponse.from(userCoin, sellingQuantity);
                })
                .collect(Collectors.toList());
    }

    private BigDecimal calculateSellingQuantity(List<Order> orders){
        return orders.stream()
                .filter(order -> order.getOrderType() == OrderType.SELL)
                .map(Order::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
