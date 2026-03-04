import React, { useEffect, useState } from 'react';
import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';

// 🛣️ 경로를 그려주는 내부 컴포넌트
function Directions({ pins }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  // 초기화: DirectionsRenderer 생성
  useEffect(() => {
    if (!routesLib || !map) return;
    const renderer = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true, // 구글 기본 마커 숨김 (우리가 만든 숫자 마커 사용)
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5,
      },
    });
    setDirectionsRenderer(renderer);
  }, [routesLib, map]);

  // pins 데이터가 변경될 때마다 경로 다시 계산
  useEffect(() => {
    if (!directionsRenderer || pins.length < 2) {
      if (directionsRenderer) directionsRenderer.setDirections({ routes: [] });
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: pins[0].lat, lng: pins[0].lng }, // 시작점 (1번)
        destination: {
          lat: pins[pins.length - 1].lat,
          lng: pins[pins.length - 1].lng,
        }, // 끝점 (마지막 번호)
        waypoints: pins.slice(1, -1).map((p) => ({
          location: { lat: p.lat, lng: p.lng },
          stopover: true,
        })), // 중간 지점들 (2번, 3번...)
        travelMode: google.maps.TravelMode.WALKING, // 성지순례니까 도보 모드
        optimizeWaypoints: false, // ❗ 입력한 순서 그대로 경로 유지
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        } else {
          console.error('경로 검색 실패:', status);
        }
      },
    );
  }, [directionsRenderer, pins]);

  return null;
}

export default function PinMapDisplay({ pins, focusLocation }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAP_ID;
  return (
    <Map
      style={{ width: '100%', height: '100%' }}
      defaultCenter={{ lat: 35.6812, lng: 139.7671 }}
      defaultZoom={13}
      mapId={mapId} // 👈 변수로 넣기
      gestureHandling={'greedy'}
      disableDefaultUI={false}
    >
      {/* 1. 경로 그리기 컴포넌트 */}
      <Directions pins={pins} />

      {/* 2. 지도 중심 이동 핸들러 */}
      <MapHandler focusLocation={focusLocation} />

      {/* 3. 숫자 마커 표시 */}
      {pins.map((pin, i) => (
        <AdvancedMarker key={pin.id} position={{ lat: pin.lat, lng: pin.lng }}>
          <div
            style={{
              background: '#4285F4',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {i + 1}
          </div>
        </AdvancedMarker>
      ))}
    </Map>
  );
}

// 지도 중심 이동용 내부 컴포넌트
function MapHandler({ focusLocation }) {
  const map = useMap();
  useEffect(() => {
    if (map && focusLocation) {
      map.panTo({ lat: focusLocation.lat, lng: focusLocation.lng });
    }
  }, [map, focusLocation]);
  return null;
}
