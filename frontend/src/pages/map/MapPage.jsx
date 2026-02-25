import React, { useState, useCallback } from "react";
import Search from "../map/Search.jsx";
import MapDisplay from "../map/MapDisplay";
import {
  DUMMY_PILGRIMAGE_SITES,
  DEFAULT_LOCATION,
} from "../../constants/dummyData.js";
import styles from "./MapPage.module.css";

export default function MapPage() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const isDev = import.meta.env.DEV;

  // [통합 핸들러] 모든 위치 변경은 이 함수를 거치도록 설계
  // useCallback을 써서 자식 컴포넌트(Search 등)가 불필요하게 리렌더링되지 않게 보호합니다.
  const handleLocationChange = useCallback((newLocation) => {
    if (!newLocation) return;
    setLocation(newLocation);
  }, []);

  return (
    <div className={styles.container}>
      {/* 1. 테스트 패널: 더미 데이터를 handleLocationChange에 전달 */}
      {isDev && (
        <div className={styles.testPanel}>
          {DUMMY_PILGRIMAGE_SITES.map((site) => (
            <button
              key={site.id}
              onClick={() => handleLocationChange(site.position)}
            >
              {site.title}
            </button>
          ))}
        </div>
      )}

      {/* 2. 검색 컴포넌트: 실제 검색 결과를 handleLocationChange에 전달 */}
      <Search onSearchResult={handleLocationChange} />

      {/* 3. 지도 표시: 최적화된 location 상태 반영 */}
      <div className={styles.mapWrapper}>
        <MapDisplay location={location} />
      </div>
    </div>
  );
}
