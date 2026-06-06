# 🛒 쇼핑 리스트 앱

바닐라 JavaScript로 만든 간단한 쇼핑 리스트 웹 앱입니다. 별도의 빌드나 서버 없이 `index.html` 파일 하나로 동작하며, 데이터는 브라우저의 `localStorage`에 저장됩니다.

## 기능

- ➕ 항목 추가 (버튼 클릭 또는 Enter 키)
- ✅ 항목 완료 토글 (체크 원 또는 이름 클릭)
- ✕ 개별 항목 삭제
- 🧹 완료된 항목 일괄 비우기
- 💾 새로고침 후에도 유지되는 영속성 (localStorage)
- 📊 전체 / 남은 항목 개수 표시

## 실행 방법

`index.html` 파일을 브라우저에서 열기만 하면 됩니다.

```bash
# 예시 (운영체제별 기본 브라우저로 열기)
start index.html      # Windows
open index.html       # macOS
xdg-open index.html   # Linux
```

## 테스트

[Playwright](https://playwright.dev/)로 작성된 E2E 테스트가 포함되어 있습니다.

```bash
npm install
npx playwright install
npm test
```

## 기술 스택

- HTML / CSS / Vanilla JavaScript
- localStorage (데이터 영속성)
- Playwright (E2E 테스트)
