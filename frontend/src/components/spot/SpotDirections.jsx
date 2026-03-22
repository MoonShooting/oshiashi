/**
 * @file SpotDirections.jsx
 * @description 루트 경로선 렌더러 + 이동수단별 소요시간 계산
 * - selectedPlaces 2개 이상: 도보 경로선 표시
 * - WALKING / DRIVING / TRANSIT 소요시간을 onDurationsChange로 올려보냄
 * - MapCore innerContent 슬롯으로 전달해야 useMap() 동작
 */
import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useMapStore } from '@/stores/useMapStore';

const MODES = ['WALKING', 'DRIVING', 'TRANSIT'];

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

    // Promise.allSettled: 일부 모드 실패(TRANSIT 미지원 지역 등)해도 나머지 표시
    Promise.allSettled(
      MODES.map((mode) => svc.route({ origin, destination, waypoints, travelMode: google.maps.TravelMode[mode], optimizeWaypoints: false })),
    ).then((results) => {
      const durations = {};
      MODES.forEach((key, i) => {
        durations[key] = results[i].status === 'fulfilled' ? totalSec(results[i].value) : null;
      });
      onDurationsChange?.(durations);
    });
  }, [renderer, selectedPlaces]);

  return null;
}
