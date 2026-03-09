import React from 'react';

const SubmitGuide = ({ message }) => {
  if (!message) return null; // 메시지가 없으면 아무것도 렌더링하지 않음

  return (
    <p
      className="submit-guide"
      style={{
        display: 'block',
        color: '#ff4d4d',
        fontSize: '12px',
        fontWeight: '500',
        marginBottom: '10px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-in-out',
      }}>
      {message}
    </p>
  );
};

export default SubmitGuide;
