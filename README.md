# AI Agent Hub PoC 페이지

React 19 + TypeScript + Material-UI v7 + Vercel KV를 사용한 아웃링크 관리 시스템입니다.

## 주요 기능

- **사용자 페이지**: 등록된 아웃링크를 카드 형태로 표시
- **관리자 페이지**: 아웃링크 CRUD 관리 (생성, 읽기, 수정, 삭제)
- **서버 데이터베이스**: Vercel KV를 사용한 데이터 저장
- **실시간 동기화**: 모든 브라우저에서 동일한 데이터 공유

## 기술 스택

- **Frontend**: React 19, TypeScript, Material-UI v7, React Router v7
- **Backend**: Vercel Serverless Functions
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel

## 로컬 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`env.example` 파일을 참고하여 `.env.local` 파일을 생성하고 Vercel KV 환경 변수를 설정하세요.

```bash
# .env.local
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## Vercel 배포

### 1. Vercel CLI 설치 및 로그인
```bash
npm i -g vercel
vercel login
```

### 2. KV 데이터베이스 생성
Vercel 대시보드에서:
1. Storage 탭으이동
2. "Create Database" 클릭
3. "KV" 선택
4. 데이터베이스 이름 입력 후 생성

### 3. 환경 변수 설정
Vercel 대시보드의 프로젝트 설정에서 Environment Variables에 KV 환경 변수를 추가하세요.

### 4. 배포
```bash
vercel --prod
```

## 프로젝트 구조

```
outlink-manager/
├── pages/
│   └── api/
│       └── outlinks.ts          # API 엔드포인트
├── src/
│   ├── components/              # 재사용 가능한 컴포넌트
│   ├── context/
│   │   └── OutLinkContext.tsx   # 전역 상태 관리
│   ├── pages/
│   │   ├── UserPage.tsx         # 사용자 페이지
│   │   └── AdminPage.tsx        # 관리자 페이지
│   ├── services/
│   │   └── api.ts               # API 서비스 레이어
│   └── types/
│       └── index.ts             # TypeScript 타입 정의
├── vercel.json                  # Vercel 배포 설정
└── env.example                  # 환경 변수 예시
```

## API 엔드포인트

### GET /api/outlinks
모든 아웃링크 조회

### POST /api/outlinks
새 아웃링크 생성
```json
{
  "name": "서비스명",
  "description": "서비스 설명",
  "isApplied": true,
  "category": "카테고리",
  "userPageUrl": "https://example.com",
  "adminPageUrl": "https://admin.example.com"
}
```

### PUT /api/outlinks?id={id}
아웃링크 수정

### DELETE /api/outlinks?id={id}
아웃링크 삭제

## 데이터 구조

```typescript
interface OutLink {
  id: string;
  name: string;
  description: string;
  isApplied: boolean;
  category: string;
  userPageUrl: string;
  adminPageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 초기 데이터

시스템에는 다음과 같은 초기 데이터가 포함되어 있습니다:
- GPT 에이전트 (AI 서비스)
- 번역 서비스 (언어 서비스)
- 문서 관리 (생산성)

## 라이센스

MIT License
