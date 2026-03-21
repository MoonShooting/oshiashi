/**
 * @file SpotDirections.jsx
 * @description 루트 페이지 경로선 렌더러. selectedPlaces 2개 이상 시 도보 경로를 지도에 표시.
 * MapCore 의 children 으로 전달해야 <Map> 컨텍스트 안에서 동작함.
 */
import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useMapStore } from '@/stores/useMapStore';

export default function SpotDirections() {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [renderer, setRenderer] = useState(null);
  const { selectedPlaces } = useMapStore();

  // DirectionsRenderer 초기화 (1회)
  useEffect(() => {
    if (!routesLib || !map) return;
    const r = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#d81741', strokeWeight: 7, strokeOpacity: 0.9 },
    });
    setRenderer(r);
    return () => r.setMap(null);
  }, [routesLib, map]);

  // selectedPlaces 변경 시 경로 재계산
  useEffect(() => {
    if (!renderer) return;
    if (selectedPlaces.length < 2) {
      renderer.setDirections({ routes: [] });
      return;
    }
    const toLoc = (p) => ({ lat: Number(p.position.lat), lng: Number(p.position.lng) });
    const svc = new google.maps.DirectionsService();
    svc.route(
      {
        origin: toLoc(selectedPlaces[0]),
        destination: toLoc(selectedPlaces[selectedPlaces.length - 1]),
        waypoints: selectedPlaces.slice(1, -1).map((p) => ({ location: toLoc(p), stopover: true })),
        travelMode: google.maps.TravelMode.WALKING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === 'OK') renderer.setDirections(result);
      },
    );
  }, [renderer, selectedPlaces]);

  return null;
}
