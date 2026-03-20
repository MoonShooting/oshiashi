import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 절대 경로를 안전하게 추출하는 표준 로직
// CORS 에러 없기 위해 server.proxy 설정 필수
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // 기존 .env에 이미 REACT_APP_* 형식 변수가 있어도
  // 프론트 런타임(import.meta.env)에서 읽을 수 있도록 함께 노출합니다.
  envPrefix: ['VITE_', 'REACT_APP_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9933',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
