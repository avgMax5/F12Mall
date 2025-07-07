package com.avgmax.global.filter;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.util.Set;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AuthFilter implements Filter {

    private static final Set<String> EXCLUDE_PATHS = Set.of(
        "/auth/login", "/auth/signup", "/auth/check-username", "/users/upload"
    );

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // log.info();
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String uri = request.getRequestURI();
        boolean isExcluded = EXCLUDE_PATHS.stream().anyMatch(uri::startsWith);

        if (isExcluded) {
            chain.doFilter(req, res); 
            return;
        }

        HttpSession session = request.getSession(false);
        boolean loggedIn = session != null && session.getAttribute("user") != null;

        if (loggedIn) {
            chain.doFilter(req, res); // 로그인 되어 있으면 통과
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED); // 아니면 401
        }
    }

    @Override
    public void destroy() {
        // log.info();
    }
}
