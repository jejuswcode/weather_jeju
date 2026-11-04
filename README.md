# 지금 제주 날씨는?

HTML, CSS, JavaScript로 만든 빌드 과정이 없는 웹앱입니다.

## 실행

`dist/index.html`을 브라우저에서 열고 WeatherAPI.com에서 발급한 API 키를 연결 설정에 입력하세요. 키는 현재 탭의 sessionStorage에 저장됩니다. 페이지를 다시 열 때 저장된 키가 있으면 자동 조회하며, 새로고침 버튼으로 다시 요청합니다.

개인용으로 키를 고정하려면 `dist/app.js`의 `API_KEY`를 설정할 수 있습니다. 클라이언트 코드와 네트워크 요청에서는 키가 노출되므로, 공유 서비스의 비밀 키는 서버 프록시로 관리해야 합니다.

로컬 미리보기 서버는 Node.js가 설치된 환경에서 `node preview.cjs`로 실행합니다. 브라우저에서 `http://127.0.0.1:4173`을 열면 됩니다. 동작 검증은 `node check.cjs`로 실행할 수 있습니다.

## API

- `https://api.weatherapi.com/v1/current.json`
- `q=33.4996,126.5312`: 제주 시내 좌표
- `lang=ko`: 한국어 날씨 설명
- 표시 필드: `current.temp_c`, `current.humidity`, `current.condition.text`, `current.last_updated`
- 제주도 전역의 날씨는 지역마다 다를 수 있으므로 제주시 기준임을 표시합니다.

공식 문서: https://www.weatherapi.com/docs/
