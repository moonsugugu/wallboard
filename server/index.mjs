// 담벼락(wallboard) 정적 프론트 서빙.
// 의존성 없음(Node 내장 fs만 사용). 요청 경로에 동기 fs 함수를 쓰지 않는다.
//
// 패들렛 가져오기는 이 서버가 아니라 브라우저 북마클릿(src/lib/padletBookmarklet.ts)이 처리한다.
// 패들렛은 Cloudflare 봇 차단을 쓰고 있어 서버가 대신 접속하면 403으로 막히기 때문에,
// 선생님 본인의 이미 인증된 브라우저에서 same-origin으로 데이터를 받아온다.
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT) || 3101
const HOST = '127.0.0.1' // 외부 노출은 Cloudflare Tunnel이 전담

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

async function serveStatic(res, pathname) {
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '')
  const filePath = path.join(DIST_DIR, safePath === '/' ? 'index.html' : safePath)
  try {
    const data = await readFile(filePath)
    res.writeHead(200, { 'content-type': MIME[path.extname(filePath)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    try {
      const data = await readFile(path.join(DIST_DIR, 'index.html'))
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      res.end(data)
    } catch {
      res.writeHead(404)
      res.end('not found')
    }
  }
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`)

  if (reqUrl.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
    return
  }

  await serveStatic(res, reqUrl.pathname)
})

server.listen(PORT, HOST, () => {
  console.log(`wallboard listening on http://${HOST}:${PORT}`)
})
