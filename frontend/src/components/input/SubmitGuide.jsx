import React from 'react';
import './FormControls.css';

const SubmitGuide = ({ message }) => {
  // 제출 조건이 모두 맞으면 안내 문구를 숨겨 시선을 CTA에만 집중시킵니다.
  if (!message) return null;

  // 이 컴포넌트는 "왜 버튼이 비활성화되어 있는지"를 짧게 설명하는 역할만 담당합니다.
  return <p className="submit-guide">{message}</p>;
};

export default SubmitGuide;
