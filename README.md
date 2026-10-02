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

<!-- HOMESERVER:START -->
## 🏠 홈서버 배포 정보 (moonsunezip 노트북 서버)

> **다른 세션·다른 AI 에서 이 앱을 고치기 전에 이 섹션을 먼저 읽으세요.**
> 서버 관리자가 관리하는 섹션입니다(마지막 갱신 2026-09-27). 앱 설명은 위쪽 본문을 보세요.

### 담벼락 — 운영 정보

| 항목 | 값 |
|---|---|
| 주소 | https://wallboard.moonsunezip.com |
| 서버 포트 | 3101 (PM2 이름 `wallboard`) |
| 배포 브랜치 | `main` |
| 배포 방식 | 범용 배포 → `npm ci` → `npm run build` → `server/index.mjs` 재시작 |
| 서버 위치 | `C:\homeserver\apps\wallboard` |

### 이 앱만의 주의점

- 자체 Node 서버(`server/index.mjs`)가 `dist/` 를 제공하고 `127.0.0.1` 에만 엽니다. 서버 코드를 바꿀 때도 이 바인딩을 유지하세요.
- 데이터는 `src/postgres-firestore.ts` 어댑터가 `https://api.moonsunezip.com` 문서 저장소(`/v1/documents`)를 Firestore 와 비슷한 사용법으로 감싸서 씁니다. 개발 중(`DEV`)에는 같은 오리진, 로컬 실행 시 `http://127.0.0.1:3100` 을 봅니다.
- 패들렛 가져오기는 외부 `api.padlet.dev` 를 부릅니다(홈서버 API 아님).
- 서버 포트는 3101 입니다(Cloudflare 설정과 감시 목록에 이 번호로 등록돼 있어 바꾸면 접속이 끊깁니다).

### 이 서버는 어떤 곳인가

- **집 노트북 1대**(Lenovo IdeaPad L340 · i5-9300H 4코어 8스레드 · RAM 8GB · Windows 11)가 moonsunezip.com 의 앱 전부를 서비스합니다.
- 모든 앱은 `127.0.0.1` 에만 열리고, 외부 접속은 **Cloudflare Tunnel** 이 전담합니다(집 IP·포트 비노출, HTTPS 자동).
- 프로세스는 **PM2** 가 관리하고, **5분마다 감시(watchdog)** 가 죽은 앱을 되살립니다.
- 데이터 저장은 **PostgreSQL 17 + 공용 API(https://api.moonsunezip.com)** 입니다. Firebase·PocketBase 는 새로 쓰지 않습니다.
- 여유 자원: RAM 여유 약 0.8GB(넉넉하지 않음), 집 인터넷 업로드 약 170Mbps(Wi-Fi).

### 배포 흐름 — 반드시 이해하고 수정하세요

1. 배포 브랜치에 push 하면 서버가 **3분 안에** 감지합니다.
2. 서버는 `git reset --hard origin/<브랜치>` 로 코드를 **통째로 덮어쓰고** → `npm ci` → `npm run build` → PM2 재시작 순서로 배포합니다.
3. 빌드나 헬스체크가 실패하면 **이전 버전으로 자동 롤백**되고 사이트는 이전 상태로 유지됩니다.

따라서:
- **서버 폴더를 직접 고치지 마세요.** 다음 배포 때 사라지거나, "커밋 안 된 수정"으로 판단돼 배포가 멈춥니다.
- `package-lock.json` 을 반드시 커밋하세요(`npm ci` 는 lock 파일이 없으면 실패합니다).
- **게임 서버가 있는 앱은 배포 = 서버 재시작 = 진행 중인 방이 전부 사라짐** 입니다. push 하기 전에 서버 관리자에게 물어보세요(`.md` 문서만 바꾼 push는 재시작 없음).

### 실시간·게임 코드를 짤 때 지킬 것 (실제로 겪은 문제들)

| 규칙 | 이유 |
|---|---|
| 서버는 `HOST`, `PORT` 환경변수를 읽고 기본값을 `127.0.0.1` 로 | 주소를 `0.0.0.0` 으로 코드에 고정하면 서버 설정으로 바꿀 수 없음 |
| **IP 당 제한을 걸지 마세요** | 학교는 전교생이 **공인 IP 하나**로 나갑니다. 윷놀이의 "IP당 방 6개" 제한이 학교 전체를 막았습니다 |
| 방 상태 전송 시각·타이머는 **방마다 따로** | 전역 변수 하나로 두면 한 반의 활동이 다른 반 갱신을 밀어냅니다(줄다리기에서 최장 4초 멈춤) |
| 큰 상태를 자주 보내면 WebSocket 압축(`perMessageDeflate`) | 줄다리기 20개 반 기준 161Mbps → 3Mbps |
| 끊긴 학생이 **60초 안에 같은 자리로 재접속**할 수 있게 | 교실 와이파이는 자주 끊깁니다. 빈 방도 60초는 유지하세요 |
| 요청 처리 중 동기 파일 I/O·느린 OS 호출 금지 | Windows 에서 `os.networkInterfaces()` 1회 25ms → 30명 방에서 서버가 멈췄습니다 |
| 요청마다 목록 전체를 훑는 코드 금지 | 사용자가 늘수록 느려집니다(backend 처리량이 4분의 1이던 원인) |
| 비밀값(키·비밀번호)은 저장소에 넣지 않기 | 서버의 비밀값은 `C:\homeserver\secrets` 에 따로 있습니다 |

**부하 목표: 한 학교 20개 반 동시 사용(약 600명).** 전국 배포라 한글날처럼 특정 날에 몰립니다.

### 공용 서버 주소

| 용도 | 주소 |
|---|---|
| 데이터 API (PostgreSQL) | `https://api.moonsunezip.com` — `/v1/documents/doc`·`/query`·`/commit`, `/health` |
| 데이터 실시간 알림 (서버→화면 단방향) | `wss://api.moonsunezip.com/v1/realtime?room=방코드` · `/v1/documents/realtime?scope=범위` |
| 공용 게임 서버 (메모리, 양방향) | `wss://game.moonsunezip.com/v1/game?room=방코드&game=게임이름&name=이름` |

새 주소(서브도메인)나 새 포트가 필요하면 서버 쪽에서 Cloudflare 설정과 PM2 등록을 해야 합니다. 코드만 올려서는 열리지 않습니다.

<!-- HOMESERVER:END -->

<!-- CODERULE:START -->
## 📏 코드 규칙 (coderule)

> 이 저장소를 고치기 전에 **[moonsugugu/coderule](https://github.com/moonsugugu/coderule)** 을 먼저 읽으세요. 사람과 AI 모두 지킵니다.

**핵심 다섯 가지**

1. **30명 반 하나의 전송량은 1Mbps 이하.** `메시지 크기(바이트) × 초당 횟수 × 받는 사람 수 × 8 ÷ 1,000,000` 으로 완료 전에 잰다.
   2026-10-02 고조선이 30명 방 하나에 22Mbps를 써서, 20개 반이 몰리자 집 업로드(약 170Mbps)가 막혀 모든 앱이 끊겼다.
2. **바뀐 것만 보내고, WebSocket 압축(`perMessageDeflate`)을 켜고,** 위치처럼 계속 바뀌는 값은 초당 5~7회 + 화면 보간. 입력마다 즉시 방송하지 말고 50~150ms 모아서 보낸다.
3. **인원 제한에 선생님을 세지 않는다. IP당 제한을 걸지 않는다**(학교는 전교생이 공인 IP 하나).
4. **방마다 타이머 따로, 끊긴 학생은 60초 이상 같은 자리 유지,** 서버는 `HOST`·`PORT` 환경변수(기본 `127.0.0.1`), 요청 경로에 동기 I/O 금지.
5. **배포·앱 재시작·터널 재시작은 서버 관리자에게 물어보고 한다.** 배포 = 서버 재시작 = 진행 중인 방이 전부 사라진다. (README 같은 `.md` 문서만 바꾼 push는 재시작 없이 반영된다)

**이 저장소 점검(2026-10-02):** 빌드 파일에 캐시 헤더가 없어 학생이 들어올 때마다 집 서버가 JS·CSS를 보냈습니다. `/assets/`는 1년 캐시(Cloudflare가 대신 보냄), html은 no-cache로 바꿨습니다.
<!-- CODERULE:END -->
