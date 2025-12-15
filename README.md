# SCA - 통합 학습 관리 시스템
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

학생과 교사를 위한 게이미피케이션 기반 통합 학습 관리 플랫폼입니다.

## 프로젝트 개요

SCA(Smart Community Academy)는 학생의 학습 동기를 부여하고 교사의 학습 관리를 효율화하기 위해 개발된 웹 애플리케이션입니다. 게이미피케이션 요소(퀘스트, 가챠, 레이드)를 활용하여 학습 과정을 재미있고 체계적으로 관리할 수 있습니다.

## 주요 기능

### 학생 기능
- **퀘스트 시스템**: 교사가 제시한 과제를 수행하고 보상(코랄, 탐사 데이터) 획득
- **가챠 시스템**: 획득한 코랄로 물고기 가챠를 뽑아 컬렉션 수집
- **레이드 시스템**: 반 전체가 협력하여 보스 레이드에 참여하고 보상 획득
- **도감 시스템**: 수집한 물고기를 확인하고 관리
- **대시보드**: 개인 진도, 성취도, 보유 재화 확인

### 교사 기능
- **클래스 관리**: 학급 생성, 학생 초대 및 관리
- **퀘스트 관리**: 과제 생성, 난이도 설정, 제출물 승인/반려
- **레이드 관리**: 반 단위 레이드 생성 및 모니터링
- **학생 모니터링**: 학생별 진도, 성적, 활동 내역 조회
- **성적 분석**: 반체 및 개별 학생 성적 통계 및 분석

## 기술 스택
| 분류 | 기술 | 비고 |
| :--- | :--- | :--- |
| **Framework** | React 18 | 컴포넌트 기반 UI 아키텍처 |
| **Language** | TypeScript | 정적 타입 시스템 |
| **Build Tool** | Vite | 고성능 HMR 및 빌드 최적화 |
| **Styling** | Tailwind CSS | 유틸리티 퍼스트 CSS 프레임워크 |
| **UI Library** | Radix UI | 웹 접근성(A11y) 준수 컴포넌트 |
| **Deployment** | Nginx, Docker | 정적 파일 서빙 및 컨테이너화 |

## 폴더 구조
```
SCA-FE/                 # React 프론트엔드
├── src/
│   ├── components/    # 컴포넌트
│   │   ├── student/   # 학생용 컴포넌트
│   │   ├── teacher/   # 교사용 컴포넌트
│   │   └── ui/        # 공통 UI 컴포넌트
│   ├── contexts/      # React Context
│   ├── routes/        # 라우팅 설정
│   └── utils/         # 유틸리티 함수
├── Dockerfile
└── package.json
```
