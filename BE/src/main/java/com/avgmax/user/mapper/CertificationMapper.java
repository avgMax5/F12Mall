package com.avgmax.user.mapper;

import com.avgmax.user.domain.Certification;
import java.util.List;

public interface CertificationMapper {
    public int insert(Certification certification);
    public List<Certification> selectByUserId(String userId);
    public void deleteByUserId(String userId);
}
