package com.avgmax.config;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.TypeHandlerRegistry;
import org.apache.ibatis.type.EnumTypeHandler;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.context.annotation.PropertySource;
import org.springframework.beans.factory.annotation.Value;

import com.avgmax.trade.domain.enums.OrderType;
import com.zaxxer.hikari.HikariDataSource;

@Configuration
@PropertySource(value = "classpath:application.yml", factory = YamlPropertySourceFactory.class)
public class MyBatisConfig {
    
    @Value("${db.mariadb.driver}")
    private String driver;

    @Value("${db.mariadb.url}")
    private String url;

    @Value("${db.mariadb.username}")
    private String username;

    @Value("${db.mariadb.password}")
    private String password;

    @Value("${db.mariadb.mapper}")
    private String mapperPath;

    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();

        ds.setDriverClassName(driver);
        ds.setJdbcUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);

        return new HikariDataSource(ds);
    }

    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
        factory.setDataSource(dataSource);
        factory.setMapperLocations(
                new PathMatchingResourcePatternResolver().getResources(mapperPath));
        
        // MyBatis Configuration 설정
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setMapUnderscoreToCamelCase(true);
        factory.setConfiguration(configuration);
        
        SqlSessionFactory sqlSessionFactory = factory.getObject();
        
        registerEnumTypeHandlers(sqlSessionFactory.getConfiguration().getTypeHandlerRegistry());
        
        return sqlSessionFactory;
    }

    private void registerEnumTypeHandlers(TypeHandlerRegistry registry) {
        // 여기에 새로운 enum이 추가될 때마다 한 줄씩 추가
        registry.register(OrderType.class, new EnumTypeHandler<>(OrderType.class));
    }

    @Bean
    public SqlSessionTemplate sqlSession(SqlSessionFactory factory) {
        return new SqlSessionTemplate(factory);
    }
}