import React from "react";

function SharedHeader({
  onMenuClick,
  brand = "推し足 (Oshiashi)",
  searchPlaceholder = "작품명, 장소, 태그 검색...",
  searchValue,
  onSearchChange,
  searchReadOnly = true,
  showSearch = true,
  rightSlot,
  helpText,
}) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <button className="app-header-menu" onClick={onMenuClick} aria-label="menu">
          ☰
        </button>
        <h1>{brand}</h1>
      </div>

      {showSearch ? (
        <label className="app-header-search">
          <span>⌕</span>
          <input
            placeholder={searchPlaceholder}
            value={searchValue}
            readOnly={searchReadOnly}
            onChange={onSearchChange}
          />
        </label>
      ) : (
        <div className="app-header-spacer" />
      )}

      <div className="app-header-right">
        {rightSlot}
        {!rightSlot && helpText ? <button className="app-header-help">{helpText}</button> : null}
      </div>
    </header>
  );
}

export default SharedHeader;
