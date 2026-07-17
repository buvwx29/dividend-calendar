# 배당 캘린더 - 실행 방법

## 1. 사전 준비
- Node.js 18 이상 설치 필요 (https://nodejs.org 에서 LTS 버전 다운로드)
- 터미널(명령 프롬프트)에서 아래 명령으로 설치 확인
  ```
  node -v
  ```

## 2. 압축 해제 후 폴더로 이동
```
cd dividend-calendar
```

## 3. 패키지 설치 (최초 1회만)
```
npm install
```

## 4. 개발 서버 실행
```
npm run dev
```
실행 후 브라우저에서 http://localhost:3000 접속하면 화면을 볼 수 있습니다.

## 5. 코드 구조
- `app/page.tsx` : 메인 페이지 진입점
- `components/DividendCalendar.tsx` : 배당 캘린더 화면 (필터, 정렬, 리스트 전부 여기 있음)
- `lib/dividends.ts` : 배당 데이터 (지금은 목업 데이터, 나중에 실제 API 데이터로 교체)

## 6. 다음에 할 일
- `lib/dividends.ts`의 목업 데이터를 실제 API(공공데이터포털, Finnhub 등)에서 가져온 데이터로 교체
- 관심종목(즐겨찾기) 상태를 브라우저에 저장하거나 로그인 기능과 연결
- 종목 클릭 시 상세 페이지로 이동하는 기능 추가

## 7. 배포 (나중에)
Vercel(https://vercel.com)에 GitHub 저장소를 연결하면 무료로 배포할 수 있습니다.
