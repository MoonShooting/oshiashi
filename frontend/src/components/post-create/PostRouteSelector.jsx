import React, { useEffect, useRef } from "react";

function PostRouteSelector({
  routes,
  selectedRoute,
  selectedRouteData,
  routeDropdownOpen,
  setRouteDropdownOpen,
  setSelectedRoute,
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRouteDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [setRouteDropdownOpen]);

  return (
    <div className="route-selector card">
      <div className="route-left">
        <label>루트 선택</label>
        <div className="dropdown-wrap" ref={dropdownRef}>
          <button className="dropdown-btn" onClick={() => setRouteDropdownOpen((prev) => !prev)}>
            <span>{selectedRouteData?.title || "루트를 선택하세요"}</span>
            <span className={routeDropdownOpen ? "arrow up" : "arrow"}>⌄</span>
          </button>
          {routeDropdownOpen && (
            <div className="dropdown-list">
              {routes.map((route) => (
                <button
                  key={route.id}
                  className={selectedRoute === route.id ? "selected" : ""}
                  onClick={() => {
                    setSelectedRoute(route.id);
                    setRouteDropdownOpen(false);
                  }}
                >
                  <span>{route.title}</span>
                  <small>📍 {route.places}개 장소</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedRouteData ? (
        <div className="route-badge">총 {selectedRouteData.places}개 장소 포함</div>
      ) : (
        <div className="route-warning">
          <span>⚠</span>
          <span>게시글은 반드시 루트를 선택해야 합니다</span>
        </div>
      )}
    </div>
  );
}

export default PostRouteSelector;
