# 🔧 Build Stage
FROM maven:3.8.7-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package

FROM tomcat:9.0.106-jre17

RUN rm -rf /usr/local/tomcat/webapps/ROOT
COPY --from=build /app/target/f12mall.war /usr/local/tomcat/webapps/ROOT.war

# COPY context.xml /usr/local/tomcat/conf/context.xml

EXPOSE 8080

CMD ["catalina.sh", "run"]