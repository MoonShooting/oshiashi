import React, { useMemo, useState } from 'react';
import { AlertTriangle, LoaderCircle, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import AccountActionLayout from '@/components/account/AccountActionLayout';
import InputGroup from '@/components/input/InputGroup';
import SubmitGuide from '@/components/input/SubmitGuide';
import MainLayout from '@/components/layout/MainLayout';
import { withdrawAPI } from '@/api/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/WithdrawPage.module.css';

const WITHDRAWAL_CHECKLIST = [
  '탈퇴 즉시 현재 계정으로 로그인할 수 없으며, 같은 계정 상태로 되돌릴 수 없습니다.',
  '내가 작성한 게시글, 루트, 북마크 등 계정에 연결된 정보가 함께 삭제될 수 있습니다.',
  '본인 확인을 위해 현재 비밀번호와 확인 문구 입력이 모두 필요합니다.',
];

const WITHDRAW_CONFIRMATION_TEXT = '회원탈퇴';

const WithdrawPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [agreedToWarning, setAgreedToWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profile = useMemo(
    () => ({
      displayName: user?.nickname || user?.userId || '회원',
      userId: user?.userId || '-',
      email: user?.email || '-',
    }),
    [user],
  );

  const isConfirmationMatched = confirmationText.trim() === WITHDRAW_CONFIRMATION_TEXT;
  const isSubmitDisabled = isSubmitting || !password.trim() || !agreedToWarning || !isConfirmationMatched;
  const submitGuide =
    !password.trim()
      ? '현재 비밀번호를 입력해주세요.'
      : !isConfirmationMatched
        ? `확인 문구를 '${WITHDRAW_CONFIRMATION_TEXT}'로 정확히 입력해주세요.`
        : !agreedToWarning
          ? '안내 사항 확인 및 동의가 필요합니다.'
          : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!password.trim()) {
      setErrorMessage('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!agreedToWarning) {
      setErrorMessage('안내 사항을 확인하고 동의해주세요.');
      return;
    }

    if (!isConfirmationMatched) {
      setErrorMessage(`확인 문구를 정확히 '${WITHDRAW_CONFIRMATION_TEXT}'로 입력해주세요.`);
      return;
    }

    const shouldProceed = window.confirm('정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!shouldProceed) {
      return;
    }

    try {
      setIsSubmitting(true);
      await withdrawAPI(password.trim());
      logout();
      alert('회원 탈퇴가 완료되었습니다.');
      navigate('/login', { replace: true });
    } catch (error) {
      setErrorMessage(error.message || '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout isMapPage={false} activeMenuKey="mypage">
      <AccountActionLayout
        badgeIcon={ShieldAlert}
        badgeLabel="위험 작업"
        title={`${profile.displayName}님의 회원탈퇴`}
        description="계정 삭제 전에 아래 안내를 꼭 확인해주세요. 탈퇴가 완료되면 동일한 계정 상태로는 복구되지 않습니다."
        summaryItems={[
          { label: '아이디', value: profile.userId },
          { label: '이메일', value: profile.email },
        ]}
        warningIcon={AlertTriangle}
        warningTitle="탈퇴 전 확인해주세요"
        warningDescription="실수로 진행되지 않도록 주요 안내를 한 번 더 정리했습니다."
        warnings={WITHDRAWAL_CHECKLIST}
        formIcon={ShieldAlert}
        formTitle="본인 확인 후 탈퇴 진행"
        formDescription="현재 비밀번호와 확인 문구 입력이 완료되어야 탈퇴 요청을 보낼 수 있습니다."
        backLabel="마이페이지로 돌아가기"
        onBack={() => navigate('/mypage')}>
        <form className={styles.withdrawForm} onSubmit={handleSubmit}>
          <InputGroup
            label="현재 비밀번호"
            type="password"
            name="currentPassword"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="현재 비밀번호를 입력해주세요"
            autoComplete="current-password"
          />

          <InputGroup
            label="확인 문구 입력"
            name="confirmationText"
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
            placeholder={WITHDRAW_CONFIRMATION_TEXT}
            helperText={`오탈자 방지를 위해 '${WITHDRAW_CONFIRMATION_TEXT}'를 그대로 입력해주세요.`}
          />

          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={agreedToWarning} onChange={(event) => setAgreedToWarning(event.target.checked)} />
            <span>안내 사항을 모두 확인했으며, 탈퇴 후 복구가 어렵다는 점에 동의합니다.</span>
          </label>

          {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
          <SubmitGuide message={!errorMessage ? submitGuide : null} />

          <div className={styles.actionRow}>
            <Button type="button" variant="secondary" size="md" onClick={() => navigate('/mypage')}>
              취소
            </Button>

            <Button type="submit" variant="danger" size="md" disabled={isSubmitDisabled}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className={styles.loaderIcon} strokeWidth={2.1} />
                  <span>탈퇴 처리 중...</span>
                </>
              ) : (
                <span>회원탈퇴 확정</span>
              )}
            </Button>
          </div>
        </form>
      </AccountActionLayout>
    </MainLayout>
  );
};

export default WithdrawPage;
