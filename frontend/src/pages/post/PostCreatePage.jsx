import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Camera, Hash, PlusCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostEditorFields from '@/components/post/create/PostEditorFields';
import PostRoutePicker from '@/components/post/create/PostRoutePicker';
import PostSceneEntryCard from '@/components/post/create/PostSceneEntryCard';
import { loadPostCreateRoutes, submitPostCreate } from '@/api/postCreateApi';
import { createCustomPlaceEntry, createRouteEntries } from '@/data/post/postCreateDraftUtils';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/PostCreatePage.module.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/*
[PostCreatePage]
- 루트 선택 -> 장소 카드 생성 -> 대표사진/감상 입력 -> JSON 생성 전송
- 업로드 정책: 장소별 대표사진 1장, jpg/png/webp, 10MB 이하
- 참고 이미지는 비교 UI 용도로만 관리(이번 범위 서버 전송 제외)
*/
const PostCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const objectUrlsRef = useRef(new Set());
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [title, setTitle] = useState('');
  const [artworkSearchInput, setArtworkSearchInput] = useState('');
  const [entries, setEntries] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [routeIssues, setRouteIssues] = useState([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [routeError, setRouteError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
  });

  // 작성 페이지는 입력 상태와 제출 흐름만 조립하고,
  // 카드 단위 UI는 components/post/create 아래 컴포넌트로 분리해 관리합니다.
  const currentUserId = user?.userId || user?.id || '';

  useEffect(() => {
    // 페이지 이탈 시 생성한 blob URL을 해제해 메모리 누수를 방지합니다.
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadRoutes = async () => {
      // 작성 진입 시 현재 사용자 기준 루트(내 루트 + 북마크 루트)를 먼저 준비합니다.
      setIsLoadingRoutes(true);
      setRouteError('');

      try {
        const response = await loadPostCreateRoutes(currentUserId);
        if (!alive) return;

        setRoutes(response.routes ?? []);
        setRouteIssues(response.issues ?? []);

        if ((response.routes ?? []).length === 0) {
          setRouteError('작성 가능한 루트가 없습니다. 루트를 먼저 생성하거나 북마크를 확인해 주세요.');
        }
      } catch (error) {
        if (!alive) return;

        setRoutes([]);
        setRouteIssues([]);
        setRouteError(error.message || '루트 목록을 불러오지 못했습니다.');
      } finally {
        if (alive) {
          setIsLoadingRoutes(false);
        }
      }
    };

    loadRoutes();

    return () => {
      alive = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedRouteId) return;

    // 루트 목록이 재로딩되어 기존 선택이 사라진 경우 입력 상태를 초기화합니다.
    const exists = routes.some((route) => route.id === selectedRouteId);
    if (!exists) {
      setSelectedRouteId('');
      setEntries([]);
    }
  }, [routes, selectedRouteId]);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? null,
    [routes, selectedRouteId],
  );

  const totalPhotos = entries.reduce((count, entry) => count + entry.experiencePhotos.length, 0);
  const filledEntries = entries.filter((entry) =>
    entry.experiencePhotos.some((photo) => photo.previewUrl || photo.note.trim().length > 0),
  ).length;
  const incompleteEntries = entries.filter((entry) => entry.experiencePhotos.length === 0).length;
  const canSubmit = Boolean(selectedRoute && title.trim() && totalPhotos > 0 && !isSubmitting);

  const registerObjectUrl = (url) => {
    if (url.startsWith('blob:')) {
      objectUrlsRef.current.add(url);
    }
    return url;
  };

  const revokeObjectUrl = (url) => {
    if (url?.startsWith('blob:') && objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
    }
  };

  const validateRepresentativePhoto = (file) => {
    // 정책 고정: 장소별 대표 사진 1장, jpg/png/webp, 10MB 이하
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return '대표 사진은 jpg, png, webp 형식만 업로드할 수 있습니다.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return '대표 사진 용량은 10MB 이하여야 합니다.';
    }

    return '';
  };

  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
    const nextRoute = routes.find((route) => route.id === routeId);
    setEntries(nextRoute ? createRouteEntries(nextRoute) : []);
    setSubmitState({ status: 'idle', message: '' });
  };

  const updateEntry = (entryId, updater) => {
    setEntries((prev) => prev.map((entry) => (entry.id === entryId ? updater(entry) : entry)));
  };

  const handleUpdateField = (entryId, field, value) => {
    updateEntry(entryId, (entry) => ({ ...entry, [field]: value }));
  };

  const buildPhoto = (file) => ({
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    previewUrl: registerObjectUrl(URL.createObjectURL(file)),
    note: '',
    file,
  });

  const handleAddPhotos = (entryId, files) => {
    const nextFile = files[0];
    if (!nextFile) return;

    const validationMessage = validateRepresentativePhoto(nextFile);
    if (validationMessage) {
      setSubmitState({
        status: 'error',
        message: validationMessage,
      });
      return;
    }

    const nextPhoto = buildPhoto(nextFile);
    updateEntry(entryId, (entry) => {
      // 장소별 대표사진 1장 정책이므로 기존 사진은 교체합니다.
      entry.experiencePhotos.forEach((photo) => revokeObjectUrl(photo.previewUrl));

      return {
        ...entry,
        experiencePhotos: [nextPhoto],
      };
    });

    setSubmitState({ status: 'idle', message: '' });
  };

  const handleRemovePhoto = (entryId, photoId) => {
    updateEntry(entryId, (entry) => {
      const target = entry.experiencePhotos.find((photo) => photo.id === photoId);
      if (target) {
        revokeObjectUrl(target.previewUrl);
      }

      return {
        ...entry,
        experiencePhotos: entry.experiencePhotos.filter((photo) => photo.id !== photoId),
      };
    });
  };

  const handleUpdatePhotoNote = (entryId, photoId, note) => {
    updateEntry(entryId, (entry) => ({
      ...entry,
      experiencePhotos: entry.experiencePhotos.map((photo) =>
        photo.id === photoId ? { ...photo, note } : photo,
      ),
    }));
  };

  const handleUploadReferenceImage = (entryId, file) => {
    updateEntry(entryId, (entry) => {
      if (entry.referenceImageUrl) {
        revokeObjectUrl(entry.referenceImageUrl);
      }

      // 참고 이미지는 UI 비교용 상태만 교체합니다.
      return {
        ...entry,
        referenceImageUrl: registerObjectUrl(URL.createObjectURL(file)),
      };
    });
  };

  const handleAddExtraPlace = () => {
    setEntries((prev) => [...prev, createCustomPlaceEntry(prev.length)]);
  };

  const handleRemoveEntry = (entryId) => {
    setEntries((prev) => {
      const target = prev.find((entry) => entry.id === entryId);
      if (target?.referenceImageUrl) {
        revokeObjectUrl(target.referenceImageUrl);
      }
      target?.experiencePhotos.forEach((photo) => revokeObjectUrl(photo.previewUrl));

      return prev.filter((entry) => entry.id !== entryId);
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selectedRoute || isSubmitting) return;

    // 등록 시 imageUrl 기반 JSON(routeId/title/content/status/images[])을 전송합니다.
    setSubmitState({ status: 'idle', message: '' });
    setIsSubmitting(true);

    try {
      const created = await submitPostCreate({
        selectedRoute,
        title,
        entries,
      });

      if (!created?.id) {
        throw new Error('생성된 게시글 ID를 확인하지 못했습니다.');
      }

      navigate(`/posts/${created.id}`);
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error.message || '게시글 등록에 실패했습니다.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout isMapPage={false} activeMenuKey="posts">
      <section className={styles.pageShell}>
        <header className={styles.pageHeader}>
          <span className={styles.pageEyebrow}>Post Creation</span>
          <h1 className={styles.pageTitle}>루트 기반 게시물 작성</h1>
          <p className={styles.pageDescription}>
            루트를 선택하면 장소 수만큼 기록 카드가 자동으로 생성됩니다. 각 장소마다 대표 사진 1장과
            감상을 남기고, 등록 시 이미지 URL JSON으로 한 번에 저장합니다.
          </p>
        </header>

        {routeError ? (
          <div className={styles.banner}>
            <AlertCircle size={16} />
            {routeError}
          </div>
        ) : null}

        {routeIssues.length > 0 ? (
          <div className={styles.banner}>
            <AlertCircle size={16} />
            {routeIssues[0]}
          </div>
        ) : null}

        {submitState.message ? (
          <div className={styles.banner}>
            {submitState.status === 'error' ? <AlertCircle size={16} /> : <Sparkles size={16} />}
            {submitState.message}
          </div>
        ) : null}

        <PostRoutePicker
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={handleSelectRoute}
          loading={isLoadingRoutes}
        />

        <PostEditorFields
          title={title}
          onChangeTitle={setTitle}
          titleLabel="제목"
          titlePlaceholder="예: 너의 이름은 루트를 따라 걸으며 남긴 실제 촬영 기록"
        />

        <section className={styles.formSection}>
          <label htmlFor="post-artwork-tag-input" className={styles.sectionLabel}>
            작품 태그 검색
          </label>
          <p className={styles.tagInputHint}>
            태그 추천/저장은 제외하고 검색 입력창만 유지했습니다.
          </p>

          <div className={styles.tagSearchWrap}>
            <div className={styles.tagSearchInputWrap}>
              <Hash className={styles.tagSearchIcon} strokeWidth={2} />
              <input
                id="post-artwork-tag-input"
                value={artworkSearchInput}
                onChange={(event) => setArtworkSearchInput(event.target.value)}
                className={styles.tagSearchInput}
                placeholder="예: 너의 이름은, 도쿄, 아키하바라"
              />
            </div>
          </div>
        </section>

        <section className={styles.overviewCard}>
          <div className={styles.overviewLead}>
            <Sparkles size={18} />
            <strong>현재 작성 진행 상태</strong>
          </div>
          <p className={styles.overviewText}>
            각 장소에서 대표 사진 1장과 감상을 입력하면, 등록 시 게시글 메타와 이미지 URL 목록을
            JSON으로 함께 전송합니다.
          </p>
          <div className={styles.overviewMetrics}>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>{selectedRoute ? selectedRoute.spots.length : 0}</span>
              <span className={styles.metricLabel}>루트 기본 장소</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>
                {entries.filter((entry) => entry.kind === 'custom-place').length}
              </span>
              <span className={styles.metricLabel}>추가 장소</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>{totalPhotos}</span>
              <span className={styles.metricLabel}>업로드 사진</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>{filledEntries}</span>
              <span className={styles.metricLabel}>기록 시작한 장소</span>
            </div>
          </div>
        </section>

        <div className={styles.sceneSectionHeader}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>장소별 촬영 기록</h2>
            <p className={styles.sectionCaption}>
              루트 내 장면 사진은 자동으로 채우고, 각 장소마다 직접 찍은 대표 사진 1장과 감상을 남깁니다.
            </p>
          </div>

          <div className={styles.sectionAction}>
            <button
              type="button"
              className={styles.addPlaceButton}
              onClick={handleAddExtraPlace}
              disabled={!selectedRoute}>
              <PlusCircle size={16} />
              추가 장소 넣기
            </button>
          </div>
        </div>

        {selectedRoute ? (
          <div className={styles.entryList}>
            {entries.map((entry, index) => (
              <PostSceneEntryCard
                key={entry.id}
                entry={entry}
                index={index}
                onUpdateField={handleUpdateField}
                onUploadReferenceImage={handleUploadReferenceImage}
                onAddPhotos={handleAddPhotos}
                onRemovePhoto={handleRemovePhoto}
                onUpdatePhotoNote={handleUpdatePhotoNote}
                onRemoveEntry={handleRemoveEntry}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Camera size={28} />
            <strong className={styles.emptyTitle}>루트를 선택하면 장면 카드가 생성됩니다</strong>
            <p className={styles.emptyText}>
              루트를 먼저 선택하면 해당 장소 수만큼 입력 카드가 자동 생성됩니다.
            </p>
          </div>
        )}
      </section>

      <div className={styles.bottomBar}>
        <div className={styles.bottomBarInner}>
          <div className={styles.bottomSummary}>
            <strong className={styles.bottomSummaryTitle}>게시 즉시 공개됩니다</strong>
            <p className={styles.bottomSummaryText}>
              총 {entries.length}개 장소 중 {incompleteEntries}개 장소가 아직 대표 사진을 기다리고 있습니다.
              장소별 대표 사진은 1장, 파일 용량은 10MB 이하(jpg/png/webp)로 제한됩니다.
            </p>
          </div>

          <div className={styles.bottomActions}>
            <button
              type="button"
              className={
                canSubmit
                  ? styles.primaryCtaButton
                  : `${styles.primaryCtaButton} ${styles.primaryCtaButtonDisabled}`
              }
              disabled={!canSubmit}
              onClick={handleSubmit}>
              {isSubmitting ? '등록 중...' : '게시글 등록'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostCreatePage;
