# 1단계: 빌드 (Node 20 - react-router-dom 7.x 요구사항)
FROM node:20-alpine AS builder

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install --legacy-peer-deps

# 소스 코드 복사 (node_modules 제외)
COPY . .

# 빌드 실행
RUN npm run build

# 2단계: nginx로 정적파일 서빙
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

