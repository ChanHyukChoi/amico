# HID Amico 웹

HID Amico 생체인식 리더기(얼굴인식/카드/QR/PIN) 관리 웹 애플리케이션입니다.

## 기술 스택

| 구분          | 기술                                |
| ------------- | ----------------------------------- |
| 런타임        | React 19, TypeScript 5.9            |
| 빌드          | Vite 7                              |
| 스타일        | Tailwind CSS 4, MUI (Material UI) 7 |
| 데이터 그리드 | MUI X Data Grid                     |
| 폼            | React Hook Form, Zod                |
| 서버 상태     | TanStack Query                      |
| 전역 상태     | Zustand                             |
| 다국어        | i18next                             |
| 목업          | MSW                                 |

## 시작하기

```bash
npm install
npm run dev
```

개발 시 MSW 목업이 활성화됩니다. 로그인: `1` / `1`

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run preview` — 빌드 결과 미리보기
- `npm run lint` — ESLint 실행

## 프로젝트 구조

- `src/api` — API 클라이언트
- `src/components` — 공통 컴포넌트, 사용자 UI
- `src/pages` — 페이지 컴포넌트
- `src/store` — Zustand 스토어
- `src/mocks` — MSW 핸들러
- `docs/PROJECT_STRUCTURE.md` — 상세 구조 문서
