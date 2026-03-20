#!/bin/bash
# 本機預覽伺服器 — 使用 Python 內建 HTTP server
# 使用方式：bash scripts/Preview-Web.sh [port]

set -e

PORT="${1:-8080}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# 確認 Python3 可用
if ! command -v python3 &>/dev/null; then
  echo "❌ 找不到 python3，請先安裝 Python 3"
  exit 1
fi

LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "（無法取得）")

echo "================================================"
echo " spigot-md 本機預覽"
echo "================================================"
echo " 根目錄：$ROOT_DIR"
echo " 本機  ：http://localhost:$PORT"
echo " 區域網路：http://$LAN_IP:$PORT"
echo " 停止  ：Ctrl+C"
echo "================================================"
echo ""

# 自動開啟瀏覽器（macOS）
if [[ "$OSTYPE" == "darwin"* ]]; then
  (sleep 0.8 && open "http://localhost:$PORT") &
fi

cd "$ROOT_DIR"
python3 - <<PYEOF
import http.server
import socketserver
import sys

PORT = $PORT

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        code = args[1] if len(args) > 1 else '-'
        print(f"  {args[0]}  [{code}]")

class QuietServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def handle_error(self, request, client_address):
        # 忽略瀏覽器斷線產生的 socket 雜訊
        pass

with QuietServer(("", PORT), QuietHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n 伺服器已停止")
        sys.exit(0)
PYEOF
