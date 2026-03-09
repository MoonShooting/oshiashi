//버튼이 붙어 있는 형태로 아이디 중복 확인, 이메일 인증번호 발송 등에 재사용합니다.
const ActionInputGroup = ({
  label,
  btnText,
  onAction,
  error,
  successMsg,
  ...props
}) => (
  <div className="input-group">
    <label>{label}</label>
    <div className="input-row">
      <input {...props} />
      <button type="button" className="btn-check" onClick={onAction}>
        {btnText}
      </button>
    </div>
    {successMsg && (
      <span
        className="success-msg"
        style={{ color: '#4caf50', fontSize: '12px' }}
      >
        {successMsg}
      </span>
    )}
    {error && <span className="error-msg">{error}</span>}
  </div>
);
export default ActionInputGroup;
