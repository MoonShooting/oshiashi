import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import MapPage from './pages/map/MapPage';
import PinPage from './pages/pin/PinPage';

function App() {
  return (
    <Router>
      <div className="App">
        {/* 공통 네비게이션 바 (임시) */}
        <nav
          style={{
            padding: '1rem',
            backgroundColor: '#282c34',
            color: 'white',
            display: 'flex',
            gap: '20px',
          }}
        >
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            홈
          </Link>
          <Link
            to="/map"
            style={{
              color: '#61dafb',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            📍 성지 지도 (테스트)
          </Link>
          <Link
            to="/pin"
            style={{
              color: '#ca61fb',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            📍 내 경로 만들기 (테스트)
          </Link>
        </nav>

        {/* 페이지 전환 구역 */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/pin" element={<PinPage />} />
            {/* 다중 핀 & 경로 편집 테스트 */}
          </Routes>
        </main>

        {/* 나중에 푸터를 여기에 추가 */}
      </div>
    </Router>
  );
}

export default App;
