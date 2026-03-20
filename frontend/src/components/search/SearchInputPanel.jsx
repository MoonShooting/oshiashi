import React from 'react';
import { Hash, RotateCcw, Search, X } from 'lucide-react';
import styles from '@/styles/SearchInputPanel.module.css';

// 세 페이지(작품 탐색 / 게시글 작성 / 게시글 조회)가 같은 검색 입력 UI를 공유하도록 만든 패널입니다.
// 각 페이지는 "입력값, 제출 시 동작, 선택된 칩 목록"만 주입하고,
// 실제 필드/버튼/칩 레이아웃은 이 컴포넌트에서 통일해 중복을 줄입니다.
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
}) => {
  const resolvedFormatter = formatItemLabel ?? ((item) => `#${item}`);
  const resolvedKeyGetter = getItemKey ?? ((item) => String(item));

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedValue = value.trim();
    if (!normalizedValue || disabled) return;

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
