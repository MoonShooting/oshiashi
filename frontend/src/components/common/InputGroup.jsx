// 라벨, 인풋, 에러 메시지를 하나로 묶은 컴포넌트입니다.
// 로그인, 아이디 찾기 등 모든 폼에서 사용됩니다.
const InputGroup = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <div className="input-group">
    <label>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    {error && <span className="error-msg">{error}</span>}
  </div>
);
export default InputGroup;
