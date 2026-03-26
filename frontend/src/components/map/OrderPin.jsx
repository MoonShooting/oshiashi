import React from 'react';

import pin1Url from '@/assets/route-pins/pin-1.png';
import pin2Url from '@/assets/route-pins/pin-2.png';
import pin3Url from '@/assets/route-pins/pin-3.png';
import pin4Url from '@/assets/route-pins/pin-4.png';
import pin5Url from '@/assets/route-pins/pin-5.png';
import styles from '@/styles/OrderPin.module.css';

const ORDER_PIN_IMAGES = {
  1: pin1Url,
  2: pin2Url,
  3: pin3Url,
  4: pin4Url,
  5: pin5Url,
};

/**
 * SpotPage에서 선택한 장소 순서를 보여주는 핀.
 *
 * 1~5번은 디자인 시안에 맞춘 전용 이미지 핀을 사용하고,
 * 그 이후 순서가 생기면 기존 숫자 원형 마커로 자연스럽게 fallback 한다.
 * 이렇게 두면 현재 요구사항은 충족하면서도 최대 개수 정책이 바뀌었을 때
 * 마커가 아예 사라지는 상황을 막을 수 있다.
 */
export default function OrderPin({ num, colors, isSelected }) {
  const imageSrc = ORDER_PIN_IMAGES[num];

  if (imageSrc) {
    return (
      <div
        className={`${styles.imagePin} ${isSelected ? styles.selected : ''}`}
        aria-label={`${num}번 경유지 핀`}>
        <img src={imageSrc} alt="" className={styles.image} draggable="false" />
        <span className={styles.imagePinNumber}>{num}</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.fallbackPin} ${isSelected ? styles.selected : ''}`}
      style={{
        background: colors?.background || '#333',
        borderColor: colors?.border || '#fff',
      }}>
      {num}
    </div>
  );
}
