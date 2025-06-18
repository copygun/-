# 라벨 OEM/ODM 관리 시스템 로컬 실행 가이드

## 시스템 요구사항
- Node.js 18 이상
- PostgreSQL 데이터베이스
- npm 또는 yarn

## 설치 및 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=your_database_name
NODE_ENV=development
```

### 3. 데이터베이스 스키마 생성
```bash
npm run db:push
```

### 4. 애플리케이션 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5000` 접속

## 주요 기능
- 다크모드 디자인
- 라벨 라이브러리 관리 (체크박스 선택, 발주 기능)
- 주문 접수 및 발주 관리
- 자재 라이브러리 관리
- 공급업체 관리
- 고객 관리
- 생산 관리
- 보고서 기능

## 시스템 구조
- **주문 접수**: 고객 주문을 최초 받아들이고 검토하는 단계
- **발주 관리**: 승인된 주문의 실제 제작부터 배송까지 전체 프로세스 관리

## 문제 해결
데이터베이스 연결 문제가 있을 경우:
1. PostgreSQL이 설치되어 실행 중인지 확인
2. `.env` 파일의 데이터베이스 연결 정보 확인
3. 데이터베이스가 존재하는지 확인