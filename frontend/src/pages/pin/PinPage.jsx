import React, { useState, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps'; // ❗ 필수 임포트
import Search from '../map/Search.jsx';
import PinMapDisplay from './PinMapDisplay';
import styles from './PinPage.module.css';

export default function PinPage() {
  const [pins, setPins] = useState([]);
  const [focusLocation, setFocusLocation] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // 장소 확정 선택 시
  const handleSelect = (data) => {
    const newPin = { ...data, id: Date.now() };
    setPins((prev) => [...prev, newPin]); // 순서대로 1, 2, 3...
    setFocusLocation(newPin);
  };

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'routes']}>
      <div className={styles.container}>
        <div className={styles.sidePanel}>
          {/* 검색 및 목록 선택 */}
          <Search
            onSearchResult={handleSelect}
            onPreviewLocation={setFocusLocation}
          />

          {/* 찍힌 핀 목록 (순서대로 1, 2, 3) */}
          <div className={styles.pinList}>
            {pins.map((pin, i) => (
              <div
                key={pin.id}
                className={styles.pinItem}
                onClick={() => setFocusLocation(pin)}
              >
                <span>
                  {i + 1}. {pin.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPins(pins.filter((p) => p.id !== pin.id));
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.mapWrapper}>
          <PinMapDisplay pins={pins} focusLocation={focusLocation} />
        </div>
      </div>
    </APIProvider>
  );
}
