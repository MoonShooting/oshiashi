import React from 'react';
import styles from '@/styles/Button.module.css';

/**
 * 공통 버튼 컴포넌트입니다.
 * - variant로 버튼의 역할(주요 CTA / 보조 액션 / 필드 내부 액션)을 구분합니다.
 * - size로 높이/패딩/라운드 값을 통일해 페이지마다 버튼 규격이 갈라지지 않게 합니다.
 * - fullWidth는 로그인/회원가입처럼 버튼이 가로 폭을 꽉 채워야 하는 폼 화면에서 사용합니다.
 * - 페이지는 색/hover/disabled 같은 기본 표현을 다시 만들지 않고, 간격과 배치만 보완합니다.
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  // 공통 버튼은 "기본 클래스 + 역할 variant + 크기 size + 화면별 보조 className" 순서로 조합합니다.
  // 이렇게 두면 기본 동작은 유지하면서도 페이지는 margin 같은 배치 속성만 가볍게 덧입힐 수 있습니다.
  const classes = [
    styles.button,
    styles[variant],
    size === 'lg' ? styles.sizeLg : size === 'sm' ? styles.sizeSm : styles.sizeMd,
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
