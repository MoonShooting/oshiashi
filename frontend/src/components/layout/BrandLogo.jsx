import React from 'react';
import brandLogoUrl from '@/assets/brand-logo-tight.png';

/**
 * 메인 브랜드 로고 자산 래퍼
 *
 * 사용자가 전달한 벡터 SVG는 흰 배경이 흰 글자/링과 같은 path에 합쳐져 있어
 * SVG 내부만 편집해서 투명 배경으로 바꾸기 어려웠다.
 * 그래서 원본 SVG를 렌더링한 뒤 흰 배경을 투명 처리하고,
 * 실제 로고 영역만 남기도록 타이트하게 crop한 PNG 자산을 사용한다.
 * 이 자산을 쓰면 보이는 로고보다 훨씬 넓게 잡히던 클릭 영역도 함께 줄어든다.
 */
const BrandLogo = ({ className = '', title = '推し足!' }) => (
  <img src={brandLogoUrl} className={className} alt={title} draggable="false" />
);

export default BrandLogo;
