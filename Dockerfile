# Multi-stage Dockerfile
# Stage 1: Build frontend (Vite)
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
RUN npm run build

# Stage 2: Build backend with Maven, copying frontend build into resources
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
# Copy built frontend into Spring Boot static resources so backend sirve la SPA
COPY --from=frontend-build /frontend/dist ./src/main/resources/static/app
RUN mvn -DskipTests package --no-transfer-progress

# Stage 3: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copy jar from build stage (artifactId=parqueadero, version=0.0.1-SNAPSHOT)
COPY --from=build /workspace/target/parqueadero-0.0.1-SNAPSHOT.jar ./app.jar
# Copy wait-for helper and make it executable
COPY scripts/wait-for.sh /app/wait-for.sh
RUN chmod +x /app/wait-for.sh
EXPOSE 8081
ENTRYPOINT ["/app/wait-for.sh", "db:3306", "--", "java", "-jar", "/app/app.jar"]
