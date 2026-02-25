import React, { useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";

/**
 * [비용 절감 핵심]
 * 지도를 새로 렌더링하지 않고 중심점만 부드럽게 이동시킴
 */
function MapHandler({ location }) {
  const map = useMap();
  useEffect(() => {
    if (map && location) {
      map.panTo(location); // API 호출 최소화 및 부드러운 이동
    }
  }, [map, location]);
  return null;
}

export default function MapDisplay({ location }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: "100%", height: "600px" }}
        defaultCenter={location}
        defaultZoom={15}
        mapId="YOUR_MAP_ID" // 구글 콘솔에서 생성한 Map ID (Advanced Marker용)
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      >
        {/* 현재 위치 마커 */}
        <AdvancedMarker position={location} />

        {/* 위치 변경 감지 및 지도 이동 처리 */}
        <MapHandler location={location} />
      </Map>
    </APIProvider>
  );
}
