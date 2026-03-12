// 라벨, 인풋, 에러 메시지를 하나로 묶은 컴포넌트입니다.
// 로그인, 아이디 찾기 등 모든 폼에서 사용됩니다.
const InputGroup = ({
  label,
  id,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  // 브라우저 자동완성 규칙을 페이지에서 제어할 수 있게 열어둡니다.
  // 로그인 폼에서는 username/current-password 같은 접근성 속성이 필요합니다.
  autoComplete,
  // 회원가입/이메일 인증처럼 특정 단계에서 입력창을 잠가야 하는 화면이 있어 공통 prop으로 받습니다.
  disabled = false,
  // 공통 구조는 유지하되, 로그인 페이지처럼 화면별 padding/아이콘 정렬이 필요할 수 있어
  // 페이지 전용 input class를 추가로 주입할 수 있게 열어둡니다.
  inputClassName = '',
}) => (
  <div className="input-group">
    <label htmlFor={id ?? name}>{label}</label>
    <input
      id={id ?? name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      className={inputClassName}
    />
    {error && <span className="error-msg">{error}</span>}
  </div>
);
export default InputGroup;
