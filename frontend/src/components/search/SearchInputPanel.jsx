import React from 'react';
import { Hash, RotateCcw, Search, X } from 'lucide-react';
import styles from '@/styles/SearchInputPanel.module.css';

/*
[SearchInputPanel]
- 작품 탐색, 게시글 검색 등 여러 페이지가 같은 입력 패턴을 공유하도록 만든 공통 UI입니다.
- 이 컴포넌트는 "입력창 + 제출 버튼 + 선택된 칩 + 추천 목록"까지만 책임집니다.
- 어떤 데이터를 검색할지, 추천 항목을 어떻게 가져올지, 선택 후 무엇을 할지는
  모두 상위 페이지가 주입합니다.

[즉]
- 이 컴포넌트는 상태를 소유하지 않습니다.
- 화면 구조만 공통화하고, 도메인 규칙은 페이지가 소유합니다.
*/
const SearchInputPanel = ({
  inputId,
  value,
  onChange,
  onSubmit,
  placeholder = '검색어를 입력하세요',
  helperText = '',
  errorText = '',
  submitLabel = '추가',
  selectedItems = [],
  onRemoveItem,
  onReset,
  disabled = false,
  leadingIcon: LeadingIcon = Hash,
  submitIcon: SubmitIcon = Search,
  formatItemLabel,
  getItemKey,
  suggestionItems = [],
  onSelectSuggestion,
  formatSuggestionLabel,
  getSuggestionKey,
  getSuggestionMeta,
  onInputCompositionStart,
  onInputCompositionEnd,
}) => {
  const resolvedFormatter = formatItemLabel ?? ((item) => `#${item}`);
  const resolvedKeyGetter = getItemKey ?? ((item) => String(item));
  const resolvedSuggestionFormatter =
    formatSuggestionLabel ?? ((item) => String(item?.label ?? item?.title ?? item?.tagName ?? item ?? ''));
  const resolvedSuggestionKeyGetter =
    getSuggestionKey ?? ((item, index) => String(item?.id ?? item?.tagId ?? item?.artworkId ?? item?.title ?? index));

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedValue = value.trim();
    if (!normalizedValue || disabled) return;

    // 제출 시 실제 해석(태그 추가, 작품 검색, 필터 적용 등)은
    // 상위 페이지의 onSubmit이 담당합니다.
    onSubmit?.(normalizedValue);
  };

  return (
    <div className={styles.root}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputShell}>
          <LeadingIcon className={styles.leadingIcon} strokeWidth={2} />
          <input
            id={inputId}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            onCompositionStart={onInputCompositionStart}
            onCompositionEnd={onInputCompositionEnd}
            className={styles.input}
            placeholder={placeholder}
            disabled={disabled}
          />
          <button type="submit" className={styles.submitButton} disabled={disabled || !value.trim()}>
            <SubmitIcon className={styles.submitIcon} strokeWidth={2} />
            <span>{submitLabel}</span>
          </button>
        </div>
      </form>

      {helperText ? <p className={styles.helperText}>{helperText}</p> : null}
      {errorText ? <p className={styles.errorText}>{errorText}</p> : null}

      {suggestionItems.length > 0 ? (
        <div className={styles.suggestionList}>
          {suggestionItems.map((item, index) => (
            <button
              key={resolvedSuggestionKeyGetter(item, index)}
              type="button"
              className={styles.suggestionButton}
              // 추천 항목 클릭 처리도 UI 컴포넌트가 직접 판단하지 않고
              // 상위 페이지의 도메인 로직에 위임합니다.
              onClick={() => onSelectSuggestion?.(item)}
              disabled={!onSelectSuggestion}>
              <span className={styles.suggestionLabel}>{resolvedSuggestionFormatter(item)}</span>
              {getSuggestionMeta ? <span className={styles.suggestionMeta}>{getSuggestionMeta(item)}</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      {selectedItems.length > 0 ? (
        <div className={styles.chipRow}>
          {selectedItems.map((item) => {
            const key = resolvedKeyGetter(item);
            return (
              <button
                key={key}
                type="button"
                className={styles.chip}
                onClick={() => onRemoveItem?.(item)}
                disabled={!onRemoveItem}>
                <span>{resolvedFormatter(item)}</span>
                {onRemoveItem ? <X className={styles.chipIcon} strokeWidth={2} /> : null}
              </button>
            );
          })}

          {onReset ? (
            <button type="button" className={styles.resetButton} onClick={onReset}>
              <RotateCcw className={styles.resetIcon} strokeWidth={2} />
              <span>초기화</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SearchInputPanel;
