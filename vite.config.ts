import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 개발 중 API를 어디로 보낼지. 기본값은 홈서버 노트북에서 돌고 있는 백엔드다.
// 서버 노트북이 아닌 컴퓨터에서 작업한다면 운영 API를 가리키면 된다:
//   WALLBOARD_API=https://api.moonsunezip.com npm run dev
const API_TARGET = process.env.WALLBOARD_API || 'http://127.0.0.1:3100'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 브라우저는 vite(같은 오리진)에만 요청하고, 실제 API 호출은 vite가 서버끼리 대신 한다.
    // 그래서 api.moonsunezip.com의 Origin 화이트리스트에 개발용 주소를 넣지 않아도 된다.
    proxy: {
      '/v1': {
        target: API_TARGET,
        changeOrigin: true,
        ws: true, // 실시간 동기화(WebSocket)도 같은 경로를 쓴다
      },
    },
  },
})
