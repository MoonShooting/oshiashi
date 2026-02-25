import React, { useState } from "react";

export default function Search({ onSearchResult }) {
  // 부모가 준 이름으로 받기
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    // 3. 버튼 클릭 시 부모에게 데이터를 던져줌 (지금은 테스트용 좌표)
    onSearchResult({ lat: 35.7013, lng: 139.7725 });
  };

  return (
    <div>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <button onClick={handleSearch}>검색</button>
    </div>
  );
}
