/**
 * @file SpotDirections.jsx
 * @description 루트 경로선 렌더러 + 지하철/버스 분리 소요시간 계산
 */
import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useMapStore } from '@/stores/useMapStore';

// 요청 모드 분리 (대중교통을 SUBWAY와 BUS로 세분화)
const REQUEST_PROFILES = [
  { key: 'WALKING', mode: 'WALKING' },
  { key: 'DRIVING', mode: 'DRIVING' },
  { key: 'TRANSIT_SUBWAY', mode: 'TRANSIT', transitMode: 'SUBWAY' },
  { key: 'TRANSIT_BUS', mode: 'TRANSIT', transitMode: 'BUS' },
];

export default function SpotDirections({ onDurationsChange }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [renderer, setRenderer] = useState(null);
  const { selectedPlaces } = useMapStore();

  useEffect(() => {
    if (!routesLib || !map) return;
    const r = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#d846ef', strokeWeight: 7, strokeOpacity: 0.9, clickable: false },
    });
    setRenderer(r);
    return () => r.setMap(null);
  }, [routesLib, map]);

  useEffect(() => {
    if (!renderer) return;
    if (selectedPlaces.length < 2) {
      renderer.setDirections({ routes: [] });
      onDurationsChange?.(null);
      return;
    }

    const toLoc = (p) => ({ lat: Number(p.position.lat), lng: Number(p.position.lng) });
    const origin = toLoc(selectedPlaces[0]);
    const destination = toLoc(selectedPlaces[selectedPlaces.length - 1]);
    const waypoints = selectedPlaces.slice(1, -1).map((p) => ({ location: toLoc(p), stopover: true }));
    const svc = new google.maps.DirectionsService();

    // 도보 경로선 렌더링
    svc.route({ origin, destination, waypoints, travelMode: google.maps.TravelMode.WALKING, optimizeWaypoints: false }, (result, status) => {
      if (status === 'OK') renderer.setDirections(result);
    });

    // 전체 소요시간 = 각 구간 합산
    const totalSec = (r) => r.routes[0]?.legs.reduce((s, leg) => s + (leg.duration?.value ?? 0), 0) ?? null;

    // 버스/지하철을 구분하여 각각 호출
    Promise.allSettled(
      REQUEST_PROFILES.map(({ mode, transitMode }) => {
        const request = {
          origin,
          destination,
          waypoints,
          travelMode: google.maps.TravelMode[mode],
          optimizeWaypoints: false,
        };
        // 지하철, 버스 필터 추가
        if (transitMode && google.maps.TransitMode) {
          request.transitOptions = {
            modes: [google.maps.TransitMode[transitMode]],
          };
        }
        return svc.route(request);
      }),
    ).then((results) => {
      const durations = {};
      REQUEST_PROFILES.forEach(({ key }, i) => {
        durations[key] = results[i].status === 'fulfilled' ? totalSec(results[i].value) : null;
      });
      onDurationsChange?.(durations);
    });
  }, [renderer, selectedPlaces]);

  return null;
}
