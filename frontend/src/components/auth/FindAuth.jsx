import React, { useState } from 'react';
import FindIdForm from './FindIdForm';
import ResetPwForm from './ResetPwForm';
import './FindAuth.css';

/** 
 * 아이디 찾기 / 비밀번호 재설정ResetPwForm.jsx 전환만 담당하는 부모 컴포넌트
 * @returns Form 화면 전환
 */

const FindAuth = () => {
  const [activeTab, setActiveTab] = useState('id'); // 'id' 또는 'pw'

  return (
    <div className="login-form-side">
      <h3>계정 찾기</h3>
      {/* 탭 메뉴 */}
      <div className="auth-tabs">
        <button className={activeTab === 'id' ? 'active' : ''} onClick={() => setActiveTab('id')}>
          아이디 찾기
        </button>
        <button className={activeTab === 'pw' ? 'active' : ''} onClick={() => setActiveTab('pw')}>
          비밀번호 재설정
        </button>
      </div>

      <div className="auth-form-container">
        {/* 탭에 따라 컴포넌트 교체 */}
        {activeTab === 'id' ? <FindIdForm /> : <ResetPwForm />}
      </div>
    </div>
  );
};

export default FindAuth;
