FROM openjdk:17-jdk-slim

WORKDIR /oci-microservice-a01254805

# Copy JAR (use your exact filename if needed)
COPY target/*.jar oci-microservice-a01254805.jar

# Copy Oracle Wallet
COPY src/main/resources/Wallet_javadev ./Wallet_javadev

# Verify this path matches your WORKDIR
ENV TNS_ADMIN=/oci-microservice-a01254805/Wallet_javadev

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=docker", "oci-microservice-a01254805.jar"]