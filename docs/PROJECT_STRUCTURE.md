# 📋 HID Amico 웹 프로젝트 구조 문서

HID Amico 생체인식 리더기(얼굴인식/카드/QR/PIN) 관리 웹 애플리케이션의 현재 구조를 정리한 문서입니다.

---

## 1. 🎯 프로젝트 개요

- **📌 목적**: HID Amico 리더기 관리 웹 앱
- **🚀 배포**: 웹과 C# ASP.NET Core 백엔드가 동일 서버에 설치됨. API는 항상 상대 경로 `/api/...`만 사용 (baseURL 하드코딩 금지).
- **🛠️ 개발**: Vite dev 서버에서 `/api/*`를 백엔드로 프록시. 실제 서버 없이 개발 시 MSW + Vite API 목업 미들웨어 사용. `VITE_USE_REAL_API=true`일 때만 프록시 활성화.

---

## 2. 📦 기술 스택 및 버전

| 구분         | 기술                  | 버전                       |
| ------------ | --------------------- | -------------------------- |
| ⚛️ 런타임    | React                 | ^19.2.0                    |
|              | React DOM             | ^19.2.0                    |
|              | TypeScript            | ~5.9.3                     |
| ⚡ 빌드      | Vite                  | ^7.3.1                     |
| 🎨 스타일    | Tailwind CSS          | ^4.2.1                     |
|              | @tailwindcss/vite     | ^4.2.1                     |
| 📊 데이터 그리드 | MUI X Data Grid   | ^8.27.4                    |
|              | @mui/material         | ^7.3.9                     |
|              | @mui/icons-material   | ^7.3.9                     |
|              | @emotion/react        | ^11.14.0                   |
|              | @emotion/styled       | ^11.14.1                   |
| 🧭 라우팅    | react-router-dom      | ^7.13.1                    |
| 📡 서버 상태 | @tanstack/react-query | ^5.90.21                   |
| 🗃️ 전역 상태 | zustand               | ^5.0.11                    |
| 📝 폼        | react-hook-form       | ^7.71.2                    |
|              | @hookform/resolvers   | ^5.2.2                     |
|              | zod                   | ^4.3.6                     |
| 🌐 다국어    | i18next               | ^25.8.14                   |
|              | react-i18next         | ^16.5.5                    |
| 🎭 목업      | msw                   | ^2.12.10 (devDependencies) |
| 📅 기타      | date-fns              | ^4.1.0                     |

- **Tailwind**: `tailwind.config.js` 없이 `@tailwindcss/vite` 플러그인 + `src/index.css`의 `@import "tailwindcss"` 방식 사용.
- **UI**: 사용자 목록은 MUI Data Grid, 폼·버튼 등은 shadcn/ui(Button, Input, Label) 혼용.

---

## 3. 📁 디렉터리 및 파일 구조

```
hid-amico-web/
├── 📂 public/
│   ├── vite.svg
│   └── mockServiceWorker.js          # MSW: npx msw init ./public --save 로 생성
├── 📂 src/
│   ├── 📂 api/                          # API 레이어
│   │   ├── client.ts                 # fetch 래퍼 (상대경로 /api, Bearer, 401 처리)
│   │   ├── auth.ts                   # login, logout
│   │   └── users.ts                  # 사용자 CRUD (목록, 단건, 생성, 수정, 삭제)
│   ├── 📂 components/
│   │   ├── 📂 common/                   # 공통 UI
│   │   │   ├── Layout.tsx            # TopBar + Sidebar + Outlet
│   │   │   ├── TopBar.tsx            # 상단바 (로고, 로그아웃)
│   │   │   ├── Sidebar.tsx           # 좌측 네비게이션
│   │   │   └── ProtectedRoute.tsx    # 인증 가드 (비로그인 시 /login)
│   │   ├── 📂 ui/                       # shadcn/ui (button, input, label)
│   │   └── 📂 users/                    # 사용자 관련
│   │       ├── UserListView.tsx         # MUI DataGrid 목록
│   │       └── UserFormView.tsx         # 등록/수정 폼
│   ├── 📂 i18n/
│   │   ├── index.ts                  # i18next 초기화
│   │   ├── ko.json                   # 한국어 번역
│   │   └── en.json                   # 영어 번역
│   ├── 📂 mocks/
│   │   ├── handlers.ts              # MSW 핸들러 (auth, users CRUD) + MOCK_LOGIN
│   │   └── browser.ts               # setupWorker
│   ├── 📂 pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── AccessLogPage.tsx
│   │   ├── DepartmentsPage.tsx
│   │   └── 📂 settings/
│   │       ├── SettingsAccessPage.tsx
│   │       ├── SettingsNetworkPage.tsx
│   │       └── SettingsSystemPage.tsx
│   ├── 📂 store/
│   │   └── authStore.ts              # Zustand: accessToken, setAccessToken, clearAuth, isAuthenticated
│   ├── 📂 types/
│   │   ├── common.ts                 # API 공통 타입, 페이지네이션
│   │   ├── auth.ts                   # LoginRequest, LoginResponse
│   │   └── user.ts                   # User, UserListParams, CreateUserRequest, UpdateUserRequest
│   ├── App.tsx                       # ThemeProvider, QueryClientProvider, Router, Routes
│   ├── main.tsx                     # i18n 로드, MSW 개발 시 활성화, React 마운트
│   └── index.css                    # @import "tailwindcss"
├── 📂 docs/
│   └── PROJECT_STRUCTURE.md         # 본 문서
├── 📂 vite/
│   └── mockApi.ts                   # Vite API 목업 미들웨어 (백엔드 없을 때 ECONNREFUSED 방지)
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

---

## 4. 📖 영역별 상세

### 4.1 🔤 타입 (`src/types`)

**역할**: API·폼·공통 도메인 타입 정의. 다른 모듈에서 import하여 사용.

| 파일        | 내용                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `common.ts` | `ApiSuccessResponse<T>`, `ApiErrorResponse`, `ApiResponse<T>`, `PaginationParams`, `PaginatedResponse<T>`. 제네릭 `T = unknown`은 미정의 시 기본 타입. |
| `auth.ts`   | `LoginRequest` (username, password), `LoginResponse` (accessToken). refreshToken은 httpOnly 쿠키로만 전달되므로 타입에 없음.                           |
| `user.ts`   | `User` (id, userId, name, department, email, createdAt), `UserListParams`, `CreateUserRequest` (userId, password, name, ...), `UpdateUserRequest`. 로그인 ID·비밀번호 지원. |

- API 스펙이 정해지면 `ApiResponse<실제타입>` 형태로 사용. 공통 뼈대는 유지.

---

### 4.2 🌐 다국어 (`src/i18n`)

**역할**: 한국어(기본)·영어. UI 텍스트는 하드코딩 금지, `useTranslation()`의 `t('키')` 사용.

- **초기화**: `index.ts`에서 `i18n.use(initReactI18next).init({ resources, lng: 'ko', fallbackLng: 'en' })`.
- **로드 시점**: `main.tsx` 최상단 `import '@/i18n'`.
- **키 구조**: `common.*`, `login.*`, `dashboard.*`, `layout.*`, `layout.nav.*` 등 네임스페이스 형태.

**주요 키 예시** (ko/en 동일 키):

- `common`: submit, cancel, confirm, save, delete, edit, loading
- `login`: title, username, password, submit, error
- `dashboard`: title, welcome
- `users`: title, list, addUser, editUser, userId, password, passwordConfirm, name, department, email, noData, notFound, search, actions, createSuccess, updateSuccess, deleteSuccess, deleteConfirm, required, invalidEmail, passwordMismatch, passwordChangeOptional, backToList
- `layout`: logout
- `layout.nav`: dashboard, users, accessLog, departments, settings, settingsAccess, settingsNetwork, settingsSystem

---

### 4.3 🗃️ 전역 상태 (`src/store`)

**역할**: 인증 상태만 Zustand로 관리. HID Amico 세션은 백엔드 전담, 프론트는 관여하지 않음.

**authStore** (`authStore.ts`):

| 항목                    | 타입/의미                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `accessToken`           | `string \| null` — sessionStorage에 영속 (개발 편의용, 운영 시 Refresh Token 방식으로 전환 권장) |
| `setAccessToken(token)` | 토큰 설정 + sessionStorage 동기화                                                                |
| `clearAuth()`           | 토큰 제거 (로그아웃·401 시) + sessionStorage 삭제                                                |
| `isAuthenticated()`     | `!!accessToken` 반환                                                                             |

- 초기값: `getStoredToken()`으로 sessionStorage에서 복원 → 새로고침 시에도 로그인 유지.
- `ProtectedRoute`에서는 `useAuthStore((s) => s.isAuthenticated())`로 boolean을 받아 사용 (함수 호출 결과를 구독).

---

### 4.4 📡 API 레이어 (`src/api`)

**규칙**: baseURL 사용 금지. 모든 요청은 상대 경로 `/api/...`만 사용.

**client.ts**:

- `apiFetch(path, options)`: `path`는 예: `/api/auth/login`.
- `Authorization: Bearer <accessToken>` 헤더 자동 부여 (authStore에서 조회).
- `credentials: 'include'`는 호출하는 쪽에서 지정 (auth에서는 `auth.ts`에서 지정).
- 응답 401 시 `clearAuth()` 호출. 실제 /login 리다이렉트는 라우터/ProtectedRoute에서 처리.

**auth.ts**:

- `login(body: LoginRequest)`: `POST /api/auth/login`, 성공 시 응답의 `data.accessToken`을 `setAccessToken`으로 저장. 반환 타입 `ApiResponse<LoginResponse>`.
- `logout()`: `POST /api/auth/logout` + `clearAuth()`.

**users.ts**:

- `fetchUsers(params?)`: `GET /api/users`, 페이지네이션·검색 지원. 반환 `ApiResponse<PaginatedResponse<User>>`.
- `fetchUser(id)`: `GET /api/users/:id`.
- `createUser(body)`: `POST /api/users`.
- `updateUser(id, body)`: `PUT /api/users/:id`.
- `deleteUser(id)`: `DELETE /api/users/:id`.

---

### 4.5 🎭 MSW 목업 (`src/mocks`)

**역할**: 개발 시 실제 백엔드 없이 로그인/로그아웃 동작 확인.

- **활성화**: `main.tsx`에서 `import.meta.env.PROD`가 아니면 `worker.start()` 후 앱 렌더.
- **워커 스크립트**: `public/mockServiceWorker.js` (패키지의 `msw.workerDirectory`에 `public` 지정됨).

**handlers.ts**:

- `MOCK_LOGIN`: `{ username: '1', password: '1' }` — mockUsers의 userId/비밀번호와 연동. 등록된 사용자로 로그인 가능.
- `POST /api/auth/login`: body가 `MOCK_LOGIN`과 일치하면 `{ success: true, data: { accessToken: 'mock-access-token' } }`, 아니면 401.
- `POST /api/auth/logout`: 200 빈 응답.
- `GET /api/users`: 목록 조회 (page, pageSize, search 쿼리 지원).
- `GET /api/users/:id`: 단건 조회.
- `POST /api/users`: 사용자 생성 (userId, password, name, department, email). userId 중복 검사.
- `PUT /api/users/:id`: 사용자 수정.
- `DELETE /api/users/:id`: 사용자 삭제.

**browser.ts**: `setupWorker(...handlers)`로 워커 내보냄.

---

### 4.6 🧩 공통 컴포넌트 (`src/components/common`)

| 컴포넌트           | 역할                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **ProtectedRoute** | 자식 렌더 전에 `isAuthenticated()` 확인. 비로그인 시 `<Navigate to="/login" state={{ from: location }} replace />`. |
| **Layout**         | 상단 `TopBar` + 하단 좌측 `Sidebar` + 우측 `main`(Outlet). 로그인 후 모든 보호된 페이지의 공통 껍데기.              |
| **TopBar**         | 상단 바: 왼쪽 "HID Amico", 오른쪽 로그아웃 버튼 (i18n `layout.logout`).                                             |
| **Sidebar**        | `NavLink`로 대시보드, 사용자, 출입 기록, 부서, 설정(출입/네트워크/시스템) 링크. 활성 경로는 Tailwind로 강조.        |

- 스타일: Tailwind 유틸리티만 사용 (인라인 style 금지).

---

### 4.7 📄 페이지 (`src/pages`)

| 경로                                 | 컴포넌트            | 비고                                                                                                          |
| ------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `/login`                             | LoginPage           | 인증 불필요. RHF + Zod, 로그인 성공 시 `from` 또는 `/`로 replace.                                             |
| `/`                                  | DashboardPage       | 대시보드 제목·환영 문구 (i18n).                                                                               |
| `/users`, `/users/new`, `/users/:id` | UsersPage           | 목록(MUI DataGrid, 서버 사이드 페이징·검색), 등록/수정 폼(로그인 ID·비밀번호·이름·부서·이메일). TanStack Query, RHF+Zod. 저장 성공 시 목록으로 이동. |
| `/access-log`                        | AccessLogPage       | placeholder.                                                                                                  |
| `/departments`                       | DepartmentsPage     | placeholder.                                                                                                  |
| `/settings/access`                   | SettingsAccessPage  | placeholder.                                                                                                  |
| `/settings/network`                  | SettingsNetworkPage | placeholder.                                                                                                  |
| `/settings/system`                   | SettingsSystemPage  | placeholder.                                                                                                  |

- 페이지는 UI 위주, 비즈니스 로직은 커스텀 훅으로 분리하는 규칙 (현재 일부 페이지만 구현됨).

---

## 5. 🧭 라우팅 및 인증 흐름

### 5.1 라우트 트리

```
QueryClientProvider
└── BrowserRouter
    └── Routes
        ├── /login          → LoginPage (공개)
        ├── /               → ProtectedRoute → Layout
        │   ├── index       → DashboardPage
        │   ├── users       → UsersPage
        │   ├── users/new   → UsersPage
        │   ├── users/:id   → UsersPage
        │   ├── access-log  → AccessLogPage
        │   ├── departments → DepartmentsPage
        │   ├── settings/access  → SettingsAccessPage
        │   ├── settings/network → SettingsNetworkPage
        │   └── settings/system  → SettingsSystemPage
        └── *               → Navigate to "/"
```

### 5.2 인증 흐름 요약

1. **🚫 비로그인 사용자가 보호된 경로 접근**  
   `ProtectedRoute`가 `isAuthenticated()`를 확인 → false면 `/login`으로 리다이렉트, `state.from`에 이전 location 전달.

2. **🔐 로그인**  
   LoginPage에서 ID/PW 제출 → `login()` 호출 → `POST /api/auth/login` (MSW 또는 실제 백엔드) → 성공 시 `setAccessToken(data.data.accessToken)` → `navigate(from ?? '/', { replace: true })`.

3. **🚪 로그아웃**  
   TopBar 등에서 `logout()` 호출 → `POST /api/auth/logout` + `clearAuth()` → 클라이언트에서 `window.location.href = '/login'` 등으로 이동.

4. **⚠️ API 401**  
   `apiFetch` 내부에서 401 수신 시 `clearAuth()` 호출. 이후 앱이 인증 상태를 잃으므로 ProtectedRoute가 재렌더 시 `/login`으로 보냄.

---

## 6. ⚙️ 설정 파일 요약

### 6.1 vite.config.ts

- **plugins**: react, tailwindcss (@tailwindcss/vite), api-mock (개발 시 `/api` 목업).
- **resolve.alias**: `@` → `./src`.
- **server.proxy**: `VITE_USE_REAL_API=true`일 때만 `/api` → `http://localhost:45123`. 기본값은 목업 미들웨어 사용.

### 6.2 tsconfig.app.json

- **include**: `src`.
- **compilerOptions**: `baseUrl: "."`, `paths: { "@/*": ["./src/*"] }`, `resolveJsonModule: true` (i18n JSON import용).

### 6.3 main.tsx 실행 순서

1. `import '@/i18n'` — i18n 초기화.
2. `enableMocking()` — 개발 시 MSW worker.start().
3. `createRoot(...).render(<StrictMode><App /></StrictMode>)`.

### 6.4 App.tsx

- `ThemeProvider` (MUI)로 앱 전체 감싸기.
- `QueryClientProvider`, `BrowserRouter`, `Routes` 구성.

---

## 7. 📌 코드 규칙 (프로젝트 컨벤션)

1. **컴포넌트**: 함수형 + TypeScript. props는 interface로 타입 정의.
2. **스타일**: Tailwind 유틸리티만 사용. 인라인 style 금지.
3. **페이지**: UI 위주, 로직은 가능한 한 커스텀 훅으로 분리.
4. **서버 데이터**: TanStack Query 사용.
5. **폼**: React Hook Form + Zod (스키마·resolver).
6. **UI 텍스트**: 하드코딩 금지, `useTranslation()` 및 `t('키')` 사용.
7. **API**: 상대 경로 `/api/...`만 사용. baseURL 하드코딩 금지.

---

## 8. 💡 개발 시 참고

- **🎭 목업 로그인**: MSW/Vite 목업 사용 시 `1` / `1`. 등록된 사용자의 userId/비밀번호로도 로그인 가능.
- **🔌 실제 백엔드 연동**: `VITE_USE_REAL_API=true`로 실행 시 프록시 활성화. 같은 서버 배포 시 `/api`는 그대로 사용.
- **➕ 추가 MSW 핸들러**: `handlers.ts`에 핸들러 추가. Vite 목업(`vite/mockApi.ts`)도 동일 로직 추가 필요.

---

## 9. 📝 작업 이력

| 일자 | 작업 내용                                                                                                                           |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| -    | **사용자 페이지 구현**: UsersPage 목록/등록/수정/삭제, TanStack Query, RHF+Zod, i18n, API·타입·MSW 핸들러 추가                      |
| -    | **인증 영속화**: accessToken을 sessionStorage에 저장해 새로고침 시에도 로그인 유지 (개발 편의용)                                    |
| -    | **Vite API 목업 미들웨어**: `vite/mockApi.ts` 추가. 백엔드 없을 때 `ECONNREFUSED` 방지. `VITE_USE_REAL_API=true`일 때만 프록시 사용 |
| -    | **UsersPage UX 개선**: 저장 성공 시 목록으로 이동, 에러·로딩 피드백 추가                                                            |
| -    | **사용자 로그인 필드**: User에 userId(로그인 ID) 추가. 등록 시 비밀번호·비밀번호 확인 필수. 수정 시 비밀번호 변경 선택               |
| -    | **MUI Data Grid 도입**: TanStack Table → MUI X Data Grid로 교체. 서버 사이드 페이징, 검색, 행 작업 메뉴 유지                        |
| -    | **미사용 제거**: @tanstack/react-table, table.tsx, dropdown-menu.tsx, checkbox.tsx 제거                                             |

---

이 문서는 위 구조가 유지되는 한, 수정·확장 시 함께 갱신하는 것을 권장합니다. ✨
