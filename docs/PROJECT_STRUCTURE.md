# HID Amico 웹 프로젝트 구조 문서

HID Amico 생체인식 리더기(얼굴인식/카드/QR/PIN) 관리 웹 애플리케이션의 현재 구조를 정리한 문서입니다.

---

## 1. 프로젝트 개요

- **목적**: HID Amico 리더기 관리 웹 프론트엔드
- **백엔드**: ASP.NET Core Minimal API (.NET 9) — 별도 프로젝트
  - 로그인: `POST https://localhost:7255/auth/login`
  - SignalR 허브: `https://localhost:7255/hub/amico` (연동 예정)
  - DB: PostgreSQL (EF Core)
- **프론트엔드 개발 서버**: Vite dev 서버에서 `/api/*` → `https://localhost:7255/*`로 프록시 (경로에서 `/api` prefix 제거)

---

## 2. 기술 스택

| 구분      | 기술                             | 버전          |
| --------- | -------------------------------- | ------------- |
| 런타임    | React                            | ^19.2.0       |
|           | React DOM                        | ^19.2.0       |
|           | TypeScript                       | ~5.9.3        |
| 빌드      | Vite                             | ^6.3.5        |
|           | @vitejs/plugin-react             | ^4.5.2        |
| 스타일    | Tailwind CSS v4                  | ^4.2.1        |
|           | @tailwindcss/vite                | ^4.2.1        |
|           | Inter Variable 폰트              | ^5.2.8        |
| UI        | @mui/material                    | ^7.3.9        |
|           | @mui/icons-material              | ^7.3.9        |
|           | @mui/x-data-grid                 | ^8.27.4       |
|           | @emotion/react + @emotion/styled | ^11.x         |
| 라우팅    | react-router-dom                 | ^7.6.1        |
| 서버 상태 | @tanstack/react-query            | ^5.90.21      |
| 전역 상태 | zustand                          | ^5.0.11       |
| 폼        | react-hook-form                  | ^7.71.2       |
|           | @hookform/resolvers + zod        | ^5.x / ^4.x   |
| 다국어    | i18next + react-i18next          | ^25.x / ^16.x |
| 유틸      | clsx + tailwind-merge + date-fns | -             |

> Tailwind v4: `tailwind.config.js` 없음. `@tailwindcss/vite` 플러그인 + `src/index.css`의 `@import "tailwindcss"` 방식 사용.

---

## 3. 디렉터리 및 파일 구조

```
hid-amico-web/
├── public/
│   └── vite.svg                         # 파비콘
├── src/
│   ├── api/                             # API 레이어
│   │   ├── client.ts                    # fetch 래퍼 (Bearer 헤더, 401 처리)
│   │   ├── auth.ts                      # login, logout
│   │   ├── users.ts                     # 사용자 CRUD
│   │   ├── access-logs.ts               # 출입 기록 조회/삭제
│   │   └── hid/                         # HID 장치 API (스텁 — 구현 예정)
│   │       ├── client.ts
│   │       ├── accessLogs.ts
│   │       └── index.ts
│   ├── components/
│   │   ├── common/                      # 공통 레이아웃·인증 컴포넌트
│   │   │   ├── Layout.tsx               # TopBar + Sidebar + Outlet
│   │   │   ├── TopBar.tsx               # 로고 + 로그아웃 버튼
│   │   │   ├── Sidebar.tsx              # NavLink 기반 좌측 네비게이션
│   │   │   └── ProtectedRoute.tsx       # 미인증 시 /login 리다이렉트
│   │   ├── users/
│   │   │   ├── UserListView.tsx         # MUI DataGrid 사용자 목록
│   │   │   └── UserFormView.tsx         # 사용자 등록/수정 폼
│   │   └── access-log/
│   │       └── AccessLogListView.tsx    # 출입 기록 목록 (구현 예정)
│   ├── i18n/
│   │   ├── index.ts                     # i18next 초기화 (기본 언어: ko)
│   │   ├── ko.json                      # 한국어 번역
│   │   └── en.json                      # 영어 번역
│   ├── lib/
│   │   └── utils.ts                     # cn() — clsx + tailwind-merge
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── UsersPage.tsx                # 목록/등록/수정 라우트 통합
│   │   ├── AccessLogPage.tsx
│   │   ├── DepartmentsPage.tsx
│   │   └── settings/
│   │       ├── SettingsAccessPage.tsx
│   │       ├── SettingsNetworkPage.tsx
│   │       └── SettingsSystemPage.tsx
│   ├── store/
│   │   └── authStore.ts                 # Zustand: JWT 토큰 (localStorage 영속)
│   ├── types/
│   │   ├── common.ts                    # ApiResponse, PaginatedResponse 등
│   │   ├── auth.ts                      # LoginRequest, LoginResponse
│   │   ├── user.ts                      # User, CreateUserRequest 등
│   │   └── access-log.ts               # AccessLog, AccessEvent, AccessLogListParams
│   ├── App.tsx                          # Provider 구성 + 라우트 정의
│   ├── main.tsx                         # i18n 로드 + React 마운트
│   └── index.css                        # @import "tailwindcss" + Inter 폰트
├── docs/
│   └── PROJECT_STRUCTURE.md            # 본 문서
├── index.html                           # SPA 진입점
├── vite.config.ts                       # Vite 설정
├── tsconfig.json                        # project references 루트
├── tsconfig.app.json                    # src/ 대상 TS 설정
├── tsconfig.node.json                   # vite.config.ts 대상 TS 설정
├── eslint.config.js                     # ESLint flat config
└── package.json
```

---

## 4. 영역별 상세

### 4.1 타입 (`src/types`)

| 파일            | 내용                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common.ts`     | `ApiSuccessResponse<T>`, `ApiErrorResponse`, `ApiResponse<T>`, `PaginationParams`, `PaginatedResponse<T>`                                         |
| `auth.ts`       | `LoginRequest` (username, password), `LoginResponse` (token)                                                                                      |
| `user.ts`       | `User`, `UserListParams`, `CreateUserRequest` (userId, password, name, ...), `UpdateUserRequest`                                                  |
| `access-log.ts` | `AccessEvent` (const enum 13종), `AccessLog` (id, time, event, device_id 등), `AccessLogListParams` (startTime, endTime, event, userId, deviceId) |

---

### 4.2 다국어 (`src/i18n`)

- 기본 언어: `ko`, fallback: `en`
- UI 텍스트는 하드코딩 금지 — `useTranslation()`의 `t('키')` 사용

**현재 키 구조:**

```
common:   submit, cancel, confirm, save, delete, edit, loading, comingSoon
login:    title, username, password, submit, error
dashboard: title, welcome
users:    title, list, addUser, editUser, userId, password, passwordConfirm,
          name, department, email, noData, notFound, search, actions,
          createSuccess, updateSuccess, deleteSuccess, deleteConfirm,
          required, invalidEmail, passwordMismatch, passwordChangeOptional,
          backToList, userIdExists
layout:   logout
layout.nav: dashboard, users, accessLog, departments, settings,
            settingsAccess, settingsNetwork, settingsSystem
```

---

### 4.3 전역 상태 (`src/store/authStore.ts`)

| 항목                    | 설명                                                                     |
| ----------------------- | ------------------------------------------------------------------------ |
| `accessToken`           | `string \| null` — **localStorage**에 영속 (`hid-amico-access-token` 키) |
| `setAccessToken(token)` | 토큰 저장 + localStorage 동기화                                          |
| `clearAuth()`           | 토큰 제거 (로그아웃·401 시) + localStorage 삭제                          |
| `isAuthenticated()`     | `!!accessToken` 반환                                                     |

- 초기값: `localStorage.getItem()`으로 복원 → 새로고침·탭 재오픈 시에도 로그인 유지

---

### 4.4 API 레이어 (`src/api`)

**규칙**: 모든 요청은 상대 경로 `/api/...` 사용. Vite 프록시가 `https://localhost:7255/...`로 전달.

#### `client.ts`

- `apiFetch(path, options)`: `Authorization: Bearer <token>` 자동 부여
- 401 수신 시 `clearAuth()` 호출 (ProtectedRoute가 재렌더 시 `/login`으로 이동)

#### `auth.ts`

- `login(body)`: `POST /api/auth/login` → 응답 `{ token }` 파싱 → `setAccessToken` 저장 → `ApiResponse<LoginResponse>` 반환
- `logout()`: 동기 함수. `clearAuth()`만 호출 (백엔드 logout 엔드포인트 없음)

#### `users.ts`

- `fetchUsers(params?)`: `GET /api/users` (page, pageSize, search)
- `fetchUser(id)`: `GET /api/users/:id`
- `createUser(body)`: `POST /api/users`
- `updateUser(id, body)`: `PUT /api/users/:id`
- `deleteUser(id)`: `DELETE /api/users/:id`

#### `access-logs.ts`

- `fetchAccessLogs(params?)`: `GET /api/hid/access-logs` (startTime, endTime, event, userId, deviceId)
- `deleteAccessLog(id)`: `DELETE /api/hid/access-logs/:id`

#### `hid/` (스텁)

- `client.ts`, `accessLogs.ts`, `index.ts` — HID 장치 직접 통신용 클라이언트 (구현 예정)

---

### 4.5 공통 컴포넌트 (`src/components/common`)

| 컴포넌트         | 역할                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `ProtectedRoute` | `isAuthenticated()` 확인 → false면 `<Navigate to="/login" state={{ from: location }} />` |
| `Layout`         | `TopBar` + `Sidebar` + `<main><Outlet /></main>`                                         |
| `TopBar`         | 로고("HID Amico") + 로그아웃 버튼                                                        |
| `Sidebar`        | `NavLink`로 7개 메뉴 렌더. `end` prop으로 `/` 정확히 매칭. 활성 시 Tailwind 강조         |

---

### 4.6 페이지 (`src/pages`)

| 경로                | 컴포넌트                              | 상태                                                             |
| ------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| `/login`            | `LoginPage`                           | 완료 — RHF+Zod, `POST /auth/login`, 성공 시 `from` 또는 `/` 이동 |
| `/`                 | `DashboardPage`                       | 플레이스홀더                                                     |
| `/users`            | `UsersPage` → `UserListView`          | 완료 — MUI DataGrid, 서버 페이징·검색, 삭제                      |
| `/users/new`        | `UsersPage` → `UserFormView(create)`  | 완료 — userId·비밀번호·이름·부서·이메일                          |
| `/users/:id`        | `UsersPage` → `UserFormView(edit)`    | 완료 — 비밀번호 변경 선택                                        |
| `/access-log`       | `AccessLogPage` → `AccessLogListView` | 구현 예정                                                        |
| `/departments`      | `DepartmentsPage`                     | 구현 예정                                                        |
| `/settings/access`  | `SettingsAccessPage`                  | 구현 예정                                                        |
| `/settings/network` | `SettingsNetworkPage`                 | 구현 예정                                                        |
| `/settings/system`  | `SettingsSystemPage`                  | 구현 예정                                                        |

---

### 4.7 유틸 (`src/lib/utils.ts`)

- `cn(...inputs)`: `clsx` + `tailwind-merge` 조합. 조건부 Tailwind 클래스 병합 시 사용

---

## 5. 라우팅 및 인증 흐름

### 5.1 라우트 트리

```
ThemeProvider (MUI)
└── QueryClientProvider
    └── BrowserRouter
        └── Routes
            ├── /login           → LoginPage          (공개)
            ├── /                → ProtectedRoute → Layout (Outlet)
            │   ├── index        → DashboardPage
            │   ├── users        → UsersPage (목록)
            │   ├── users/new    → UsersPage (등록)
            │   ├── users/:id    → UsersPage (수정)
            │   ├── access-log   → AccessLogPage
            │   ├── departments  → DepartmentsPage
            │   ├── settings/access  → SettingsAccessPage
            │   ├── settings/network → SettingsNetworkPage
            │   └── settings/system  → SettingsSystemPage
            └── *                → Navigate to "/"
```

### 5.2 인증 흐름

1. **미인증 접근**: `ProtectedRoute` → `isAuthenticated() === false` → `/login` 리다이렉트 (`state.from` 저장)
2. **로그인**: `POST /api/auth/login` → `{ token }` 수신 → `localStorage` 저장 → `from` 또는 `/` 이동
3. **로그아웃**: TopBar → `logout()` → `localStorage` 클리어 → `/login` 이동
4. **API 401**: `apiFetch` → `clearAuth()` → ProtectedRoute 재렌더 → `/login` 이동

---

## 6. 설정 파일

### vite.config.ts

```
plugins:        react(), tailwindcss()
resolve.alias:  "@" → "./src"
server.proxy:   /api/* → https://localhost:7255/*
                (rewrite: /api/foo → /foo)
                secure: false  (로컬 자체 서명 인증서 허용)
```

### tsconfig 구성

| 파일                 | 대상                      | 주요 설정                                      |
| -------------------- | ------------------------- | ---------------------------------------------- |
| `tsconfig.json`      | 루트 (project references) | `references`: app, node                        |
| `tsconfig.app.json`  | `src/`                    | target ES2022, jsx react-jsx, strict, noUnused |
| `tsconfig.node.json` | `vite.config.ts`          | target ES2023, types: node                     |

### main.tsx 실행 순서

1. `import '@/i18n'` — i18n 초기화 (동기)
2. `createRoot(...).render(<StrictMode><App /></StrictMode>)`

---

## 7. 코드 컨벤션

1. **컴포넌트**: 함수형 + TypeScript. props는 `interface`로 정의
2. **스타일**: Tailwind 유틸리티 + MUI sx prop. 인라인 `style` 지양
3. **서버 데이터**: TanStack Query (`useQuery`, `useMutation`)
4. **폼**: React Hook Form + Zod
5. **UI 텍스트**: `useTranslation()`의 `t('키')` 사용. 하드코딩 금지
6. **API 경로**: 상대 경로 `/api/...`만 사용. baseURL 하드코딩 금지

---

## 8. 작업 이력

| 날짜       | 내용                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-03-19 | Next.js → Vite + React + TypeScript 롤백. Next.js 파일 전체 제거, MSW 제거                                                                 |
| 2026-03-19 | 실제 ASP.NET 백엔드 연동 설정. 프록시 `https://localhost:7255`, `/api` rewrite. `localStorage` 전환. 로그인 응답 `{ token }` 파싱으로 수정 |

---

이 문서는 구조 변경 시 함께 갱신하는 것을 권장합니다.
