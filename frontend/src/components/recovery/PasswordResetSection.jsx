import React, { useState } from "react";

function PasswordResetSection({ onGoLogin }) {
  const [step, setStep] = useState("input");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSendCode = () => {
    if (!userId.trim() || !email.trim()) {
      setError("아이디와 이메일을 입력해주세요");
      return;
    }
    setCodeSent(true);
    setError("");
  };

  const handleVerify = (event) => {
    event.preventDefault();
    if (!code.trim()) {
      setError("인증 코드를 입력해주세요");
      return;
    }
    setStep("reset");
    setError("");
  };

  const handleReset = (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("비밀번호는 8~16자 영문, 숫자, 특수문자 조합이어야 합니다");
      return;
    }
    setStep("success");
    setError("");
  };

  if (step === "success") {
    return (
      <div className="recovery-result">
        <div className="recovery-result-card">
          <div className="recovery-success-icon">✓</div>
          <p>비밀번호가 성공적으로 변경되었습니다</p>
        </div>
        <div className="recovery-result-actions">
          <button className="primary-btn recovery-primary" onClick={onGoLogin}>
            로그인 페이지 이동
          </button>
        </div>
      </div>
    );
  }

  return step === "input" ? (
    <form className="recovery-form" onSubmit={handleVerify}>
      <label>아이디</label>
      <input
        type="text"
        placeholder="아이디를 입력하세요"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <label>이메일</label>
      <input
        type="email"
        placeholder="가입한 이메일을 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label>인증 코드</label>
      <div className="recovery-code-row">
        <input
          type="text"
          placeholder="이메일 인증 코드 입력"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="button" className="outline-btn" onClick={handleSendCode}>
          {codeSent ? "재전송" : "인증번호 받기"}
        </button>
      </div>
      {error ? <p className="recovery-error">{error}</p> : null}
      <button type="submit" className="primary-btn recovery-primary">
        다음 단계
      </button>
    </form>
  ) : (
    <form className="recovery-form" onSubmit={handleReset}>
      <label>새 비밀번호</label>
      <input
        type="password"
        placeholder="새 비밀번호를 입력하세요"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <label>비밀번호 확인</label>
      <input
        type="password"
        placeholder="비밀번호를 다시 입력하세요"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <small>8~16자 영문, 숫자, 특수문자 조합</small>
      {error ? <p className="recovery-error">{error}</p> : null}
      <button type="submit" className="primary-btn recovery-primary">
        비밀번호 변경
      </button>
    </form>
  );
}

export default PasswordResetSection;
