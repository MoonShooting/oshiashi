import React, { useState } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';

export default function LegacyPlaceSearch({ onSearchResult, onPreviewLocation }) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const places = useMapsLibrary('places');
  const map = useMap();

  const handleSearch = () => {
    if (!places || !keyword) return;

    const svc = new google.maps.places.PlacesService(
      document.createElement('div'),
    );

    // 현재 지도가 일본(도쿄 등)을 보고 있다면 그 주변을 우선 검색
    const request = {
      query: keyword,
      location: map ? map.getCenter() : { lat: 35.6812, lng: 139.7671 },
      radius: '10000', // 10km 반경 우선
    };

    svc.textSearch(request, (res, status) => {
      if (status === 'OK') {
        if (res.length === 1) {
          selectPlace(res[0]); // 1개면 즉시 반영
        } else {
          setResults(res); // 2개 이상이면 목록 표시
        }
      } else {
        alert('검색 결과가 없습니다.');
      }
    });
  };

  const selectPlace = (item) => {
    onSearchResult({
      lat: item.geometry.location.lat(),
      lng: item.geometry.location.lng(),
      name: item.name,
    });
    setResults([]);
    setKeyword('');
  };

  return (
    <div style={{ position: 'relative', zIndex: 1000 }}>
      <div style={{ display: 'flex', gap: '5px' }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="성지 이름 검색..."
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      {results.length > 1 && (
        <ul
          style={{
            position: 'absolute',
            top: '40px',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #ccc',
            maxHeight: '250px',
            overflowY: 'auto',
            padding: 0,
            listStyle: 'none',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }}
        >
          {results.map((item, i) => (
            <li
              key={i}
              onClick={() =>
                onPreviewLocation({
                  lat: item.geometry.location.lat(),
                  lng: item.geometry.location.lng(),
                })
              }
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '12px' }}>
                <strong>{item.name}</strong>
                <br />
                <small style={{ color: '#888' }}>
                  {item.formatted_address.substring(0, 20)}...
                </small>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectPlace(item);
                }}
              >
                선택
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
