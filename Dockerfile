FROM openjdk:17-jdk-slim

# Use consistent student ID in all paths
WORKDIR /oci-microservice-a01254805

# Copy JAR file (relative path, no leading slash)
COPY target/*.jar oci-microservice-a01254805.jar

# Copy Oracle Wallet (relative path)
COPY src/main/resources/Wallet_javadev ./Wallet_javadev

# Fix TNS_ADMIN path to match WORKDIR
ENV TNS_ADMIN=/oci-microservice-a01254805/Wallet_javadev

EXPOSE 8080

# Match the JAR filename from COPY command
ENTRYPOINT ["java", "-jar", "oci-microservice-a01254805.jar"]