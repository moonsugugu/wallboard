> **made by 문수네집** — [🏠 문수네집](https://moonsunezipbrand.vercel.app) · [📷 인스타그램](https://www.instagram.com/moonsune.zip/) · [✨ moonsune.zip](https://moonsune-zip.vercel.app/)

# 담벼락 (wallboard)

우리 반 실시간 포스트잇 게시판. 패들렛(Padlet)처럼 담벼락형(자유 배치 포스트잇)과 테이블형(섹션별 컬럼)
두 가지 형태를 지원하고, 학급 전체가 동시에 글을 올려도 실시간으로 서로에게 반영됩니다.

## 스택

- 프론트엔드: Vite + React + TypeScript + Tailwind CSS v4
- 데이터: 문수네집 홈서버 범용 문서저장소(`https://api.moonsunezip.com`, Firestore 호환 어댑터 — `src/lib/postgres-firestore.ts`)
- 백엔드: `server/index.mjs` — 빌드된 정적 파일만 서빙하는 의존성 0개짜리 Node 서버. DB에 직접 접속하지 않음.

## 내 담벼락 폴더

홈의 "내 담벼락"은 폴더로 묶어서 볼 수 있습니다. 칩을 눌러 폴더별로 거르고,
카드에 마우스를 올리면 나오는 📁 버튼(터치 기기에서는 항상 보임)으로 담벼락을 옮깁니다.

**이 목록은 서버에 저장되지 않습니다.** 담벼락 자체는 홈서버에 있지만,
"내가 방문한 담벼락 목록"과 "폴더"는 이 앱에 계정이 없어서 브라우저 localStorage에만 남습니다
(`wallboard:recent`, `wallboard:folders`). 그래서 폴더 분류는 **그 브라우저에서만** 보입니다 —
다른 기기나 다른 브라우저에서 열면 폴더가 없습니다. 담벼락을 잃어버리는 건 아니고, 코드로 다시 들어가면 됩니다.
기기 간에 공유하려면 계정이 필요하고, 그건 아직 없습니다.

폴더를 지워도 **안에 있던 담벼락은 지워지지 않고** '미분류'로 돌아갑니다
(분류를 지우는 것과 담벼락을 목록에서 빼는 것은 다른 일이라서).

최근 목록은 미분류 담벼락만 12개로 자릅니다. 폴더에 직접 넣어둔 담벼락은
아무리 오래돼도 목록에서 밀려나지 않습니다 — 사용자가 손으로 정리해둔 걸 앱이 말없이 버리면 안 되니까요.

## 디자인 톤 — "조용한 무드보드"

따뜻한 크림 종이 위에 채도를 낮춘 파스텔 포스트잇을 올려둔 느낌으로 맞춰져 있습니다.
개별 화면을 손볼 때도 아래 규칙을 벗어나지 않게 합니다.

- **색은 토큰으로만 씁니다.** `src/index.css`의 `:root`에 배경·글자·액센트·파스텔(`--p-*`)·그림자가
  전부 정의돼 있습니다. 컴포넌트에 새 hex를 직접 박지 말고 토큰을 쓰세요.
- **액센트는 `#b96a58`(가라앉힌 테라코타).** 흰 글씨와의 대비가 4.6:1이라 버튼 안에서도 읽힙니다.
  쨍한 원색은 교실 화면에서 쉽게 피로해져 쓰지 않습니다.
- **제목은 세리프(`.font-display`), 본문은 산세리프.** 제목용 세리프는 Cormorant Garamond + Gowun Batang
  조합이고, 세리프 기본 숫자(올드스타일)가 베이스라인 아래로 내려가 오타처럼 보이는 걸 막으려고
  `font-variant-numeric: lining-nums`를 켜둡니다.
- **작은 머리글은 `.eyebrow`** — 자간 넓은 소문자 라벨. 섹션 제목 위에 한 줄씩 붙입니다.
- **그림자는 넓고 옅게** (`--shadow-paper` / `--shadow-card` / `--shadow-lift`).
  진한 그림자 대신 종이가 살짝 떠 있는 정도만 씁니다.
- **한글 줄바꿈은 어절 단위.** body에 `word-break: keep-all`이 걸려 있습니다
  (없으면 음절 중간에서 끊겨 읽기 나쁩니다).
- **큰 흐림(blur) 요소는 애니메이션하지 않습니다.** 화면 전체가 매 프레임 다시 그려져서 저사양 노트북에서
  스크롤이 끊깁니다. 움직이는 건 작은 쪽지(`.drift`)와 첫 진입 페이드(`.rise`)뿐이고,
  둘 다 `prefers-reduced-motion`에서 꺼집니다.

포스트잇 색을 한 번 바꿨기 때문에, 옛 색으로 저장된 글도 새 톤으로 보이도록
`normalizePostColor()`(`src/types.ts`)가 화면에 그릴 때 색을 갈아끼웁니다.
팔레트를 또 바꾸면 그 안의 `LEGACY_POST_COLORS` 표에 옛 값을 추가하세요.

## 로컬 개발

```bash
npm install
npm run dev
```

`npm run dev`는 홈서버 백엔드가 `127.0.0.1:3100`에 떠 있다고 가정합니다(실제 서버 노트북 기준).
이 저장소를 관리하는 컴퓨터가 서버 노트북이 아니라면, LAN IP(예: `http://<내PC IP>:5173`)로 접속해야
`src/lib/postgres-firestore.ts`가 자동으로 운영 API(`https://api.moonsunezip.com`)를 바라봅니다
(단, 아래 CORS 항목을 먼저 처리해야 합니다).

## 배포 전 꼭 확인할 것 — CORS 허용 목록

`api.moonsunezip.com`은 Origin을 **화이트리스트**로 관리합니다(와일드카드 아님, 실측 확인함).
이 앱을 새 서브도메인(예: `wallboard.moonsunezip.com`)에 배포하기 전에, 홈서버 backend의
CORS 허용 목록에 그 주소를 추가해야 합니다. 추가하지 않으면 브라우저 콘솔에 다음과 같은
오류가 뜨며 데이터를 전혀 읽고 쓰지 못합니다.

```
Access to fetch at 'https://api.moonsunezip.com/...' from origin 'https://wallboard.moonsunezip.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## 패들렛 가져오기 — 왜 URL만 붙여넣는 방식이 아닌가

패들렛은 Cloudflare 봇 차단을 쓰고 있어서, 서버(Node.js)가 패들렛 페이지에 직접 접속하면
`403 Forbidden` (`Cf-Mitigated: challenge`)으로 막힙니다. 그래서 이 앱은 **서버가 대신 가져오지 않습니다.**

대신 브라우저 북마클릿(`src/lib/padletBookmarklet.ts`)을 씁니다.

1. 홈 화면의 "📥 담벼락으로 가져오기" 버튼을 브라우저 즐겨찾기줄로 드래그해 등록
2. 본인 소유 패들렛 보드를 평소처럼 열고 그 북마클릿 클릭
   (이미 인증된 본인 브라우저에서 same-origin으로 `/api/10/wishes`, `/api/5/wall_sections`를 호출 — 정상적인 요청이라 막히지 않음)
3. `padlet-export.json` 파일이 다운로드됨
4. 담벼락 앱 홈 화면에서 그 파일을 업로드 → 글·이미지·섹션이 그대로 옮겨진 새 보드 생성

패들렛 이미지 첨부 URL 중 일부(서명된 링크)는 시간이 지나면 만료될 수 있습니다.

## 새 앱 배포 절차

문수네집 서버 노트북 기준 `새앱_추가절차`를 따릅니다 (`server-context.json` 참고):

1. `C:\homeserver\apps\wallboard`로 clone
2. `ecosystem.config.js`에 프로세스 추가 (포트 3003부터 비어있는 포트, `npm run build && node server/index.mjs`)
3. `cloudflared\config.yml` ingress에 `wallboard.moonsunezip.com` 추가 (마지막 404 규칙 위에)
4. `cloudflared tunnel route dns moonsunezip wallboard.moonsunezip.com`
5. **backend의 CORS 허용 목록에 `https://wallboard.moonsunezip.com` 추가** (위 항목 참고 — 빠뜨리기 쉬움)
6. `auto-deploy.ps1`, `watchdog.ps1`의 앱 목록에 추가
7. 이후 `main` 브랜치 push 시 3분 내 자동 배포
