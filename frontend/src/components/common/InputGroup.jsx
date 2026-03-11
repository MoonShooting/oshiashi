// 라벨, 인풋, 에러 메시지를 하나로 묶은 공통 컴포넌트입니다.
// 인증 폼 전반에서 재사용할 수 있도록 기본 속성 외 확장 props도 함께 받습니다.
const InputGroup = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  wrapperClassName = '',
  inputClassName = '',
  ...inputProps
}) => (
  <div className={`input-group ${wrapperClassName}`.trim()}>
    <label htmlFor={id || name}>{label}</label>
    <input
      id={id || name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={inputClassName}
      {...inputProps}
    />
    {error && <span className="error-msg">{error}</span>}
  </div>
);
export default InputGroup;
