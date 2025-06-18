# 로컬 설치 가이드

## 빠른 시작 (Docker 사용)

### 1. 파일 압축 해제
```bash
tar -xzf label-management-local.tar.gz
cd label-management-local
```

### 2. Docker로 실행
```bash
# PostgreSQL과 애플리케이션을 함께 실행
docker-compose up -d

# 브라우저에서 접속
# http://localhost:5000
```

## 수동 설치

### 1. 필수 프로그램 설치
- Node.js 18 이상
- PostgreSQL 데이터베이스

### 2. 파일 압축 해제 및 의존성 설치
```bash
tar -xzf label-management-local.tar.gz
cd label-management-local
npm install
```

### 3. 데이터베이스 설정
PostgreSQL에서 데이터베이스 생성:
```sql
CREATE DATABASE label_management;
CREATE USER admin WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE label_management TO admin;
```

### 4. 환경 변수 설정
`.env` 파일 생성 (`.env.example` 참고):
```bash
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 정보 입력
```

### 5. 데이터베이스 스키마 생성
```bash
npm run db:push
```

### 6. 애플리케이션 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5000` 접속

## 주요 기능

### 라벨 라이브러리
- 다크모드 디자인
- 체크박스로 다중 선택
- 신규발주/재발주/수정발주 기능

### 주문 관리
- **주문 접수**: 고객 주문 최초 접수 및 검토
- **발주 관리**: 승인된 주문의 제작부터 배송까지 관리

### 기타 기능
- 자재 라이브러리 관리
- 공급업체 관리
- 고객 관리
- 생산 관리
- 보고서 기능

## 문제 해결

### 데이터베이스 연결 오류
1. PostgreSQL 서비스가 실행 중인지 확인
2. `.env` 파일의 데이터베이스 연결 정보 확인
3. 방화벽 설정 확인

### 포트 충돌
기본 포트 5000이 사용 중인 경우:
```bash
PORT=3000 npm run dev
```

### Docker 실행 문제
```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs

# 재시작
docker-compose restart
```