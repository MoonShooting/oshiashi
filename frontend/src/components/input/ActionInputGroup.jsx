import './FormControls.css';
import Button from '@/components/modal/Button.jsx';

// 입력창 오른쪽에 즉시 실행 버튼이 붙는 폼 패턴입니다.
// 아이디 중복 확인, 이메일 인증 요청, 인증번호 확인처럼 "입력 + 액션"이 한 세트인 화면에서 사용합니다.
const ActionInputGroup = ({
  label,
  btnText,
  onAction,
  error,
  successMsg,
  // 입력은 가능하지만 보조 액션 버튼만 잠가야 하는 경우가 있어 별도 prop으로 분리합니다.
  buttonDisabled = false,
  ...props
}) => (
  <div className="input-group">
    <label>{label}</label>
    <div className="input-row">
      <input {...props} />
      {/* 필드 내부 액션은 공통 Button의 fieldAction variant를 사용해
          인증 페이지 어디서든 같은 높이/상태값/disabled 반응을 유지합니다. */}
      <Button type="button" variant="fieldAction" size="sm" onClick={onAction} disabled={buttonDisabled}>
        {btnText}
      </Button>
    </div>
    {/* 성공 문구는 "인증 완료", "사용 가능"처럼 다음 단계로 넘어가도 되는 상태를 표시합니다. */}
    {successMsg && <span className="success-msg">{successMsg}</span>}
    {error && <span className="error-msg">{error}</span>}
  </div>
);
export default ActionInputGroup;
