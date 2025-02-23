# Build stage
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:17-jdk-slim
WORKDIR /oci-microservice-a01254805
COPY --from=build /app/target/*.jar oci-microservice-a01254805.jar
COPY src/main/resources/Wallet_javadev ./Wallet_javadev
ENV TNS_ADMIN=/oci-microservice-a01254805/Wallet_javadev
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=docker", "oci-microservice-a01254805.jar"]