import React, { useState, useCallback, useMemo } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

// [비용 절감 핵심] 지도를 새로 그리지 않고 위치만 이동시키는 컴포넌트
function MapHandler({ location }) {
  const map = useMap(); // 현재 로드된 지도 인스턴스 가져오기

  React.useEffect(() => {
    if (map && location) {
      // setCenter 대신 panTo를 쓰면 부드럽게 이동하며 타일 재사용률이 높음
      map.panTo(location);
    }
  }, [map, location]);

  return null;
}

export default function OptimizedMap() {
  const [currentLocation, setCurrentLocation] = useState({
    lat: 35.6895,
    lng: 139.6917,
  });

  // [비용 절감] 함수 재생성 방지로 자식 컴포넌트의 불필요한 리렌더링 차단
  const handleLocationChange = useCallback((newCoords) => {
    setCurrentLocation(newCoords);
  }, []);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        style={{ width: "100%", height: "500px" }}
        defaultCenter={currentLocation}
        defaultZoom={15}
        gestureHandling={"greedy"}
        disableDefaultUI={true} // UI 컨트롤을 꺼서 추가 API 호출 최소화
      >
        <MapHandler location={currentLocation} />
      </Map>
    </APIProvider>
  );
}
