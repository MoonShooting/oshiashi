import React, { useState } from "react";

function FindIdSection({ onGoLogin }) {
  const [step, setStep] = useState("input");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const [foundId, setFoundId] = useState("");

  const handleSendCode = () => {
    if (!email.trim()) {
      setError("이메일을 입력해주세요");
      return;
    }
    setCodeSent(true);
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!code.trim()) {
      setError("인증 코드를 입력해주세요");
      return;
    }
    setFoundId("moon****123");
    setStep("result");
    setError("");
  };

  return step === "input" ? (
    <form className="recovery-form" onSubmit={handleSubmit}>
      <label>이메일</label>
      <input
        type="email"
        placeholder="가입 시 사용한 이메일을 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>인증 코드</label>
      <div className="recovery-code-row">
        <input
          type="text"
          placeholder="인증 코드 입력"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="button" className="outline-btn" onClick={handleSendCode}>
          {codeSent ? "재전송" : "인증번호 받기"}
        </button>
      </div>
      <small>이메일로 인증 코드가 발송됩니다</small>
      {error ? <p className="recovery-error">{error}</p> : null}

      <button type="submit" className="primary-btn recovery-primary">
        아이디 찾기
      </button>
    </form>
  ) : (
    <div className="recovery-result">
      <div className="recovery-result-card">
        <div className="recovery-success-icon">✓</div>
        <p>회원님의 아이디는 다음과 같습니다</p>
        <h3>{foundId}</h3>
      </div>
      <div className="recovery-result-actions">
        <button className="primary-btn recovery-primary" onClick={onGoLogin}>
          로그인하기
        </button>
      </div>
    </div>
  );
}

export default FindIdSection;
