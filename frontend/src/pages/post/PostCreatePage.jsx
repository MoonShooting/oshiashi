import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, PlusCircle, Sparkles } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import PostRoutePicker from '@/components/post-create/PostRoutePicker';
import PostSceneEntryCard from '@/components/post-create/PostSceneEntryCard';
import {
  MOCK_POST_CREATE_ROUTES,
  createCustomPlaceEntry,
  createRouteEntries,
} from '@/components/post-create/postCreateData';
import styles from '@/styles/PostCreatePage.module.css';

const PostCreatePage = () => {
  const objectUrlsRef = useRef(new Set());
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [title, setTitle] = useState('');
  const [entries, setEntries] = useState([]);
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
  });

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const selectedRoute =
    MOCK_POST_CREATE_ROUTES.find((route) => route.id === selectedRouteId) ?? null;

  const totalPhotos = entries.reduce(
    (count, entry) => count + entry.experiencePhotos.length,
    0,
  );
  const filledEntries = entries.filter((entry) =>
    entry.experiencePhotos.some(
      (photo) => photo.previewUrl || photo.note.trim().length > 0,
    ),
  ).length;
  const incompleteEntries = entries.filter(
    (entry) => entry.experiencePhotos.length === 0,
  ).length;
  const canSubmit = Boolean(selectedRoute && title.trim() && totalPhotos > 0);

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

  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
    const nextRoute = MOCK_POST_CREATE_ROUTES.find((route) => route.id === routeId);
    setEntries(nextRoute ? createRouteEntries(nextRoute) : []);
    setSubmitState({ status: 'idle', message: '' });
  };

  const updateEntry = (entryId, updater) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? updater(entry) : entry)),
    );
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

    const nextPhoto = buildPhoto(nextFile);
    updateEntry(entryId, (entry) => {
      entry.experiencePhotos.forEach((photo) => revokeObjectUrl(photo.previewUrl));

      return {
        ...entry,
        experiencePhotos: [nextPhoto],
      };
    });
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
    if (!canSubmit || !selectedRoute) return;

    setSubmitState({
      status: 'success',
      message:
        '현재는 저장 없이 화면 검토용 목업으로 동작합니다. 실제 저장 연결은 문서에 정리한 백엔드 계약이 확정되면 붙이면 됩니다.',
    });
  };

  return (
    <MainLayout isMapPage={false} activeMenuKey="community">
      <section className={styles.pageShell}>
        <header className={styles.pageHeader}>
          <span className={styles.pageEyebrow}>Post Creation</span>
          <h1 className={styles.pageTitle}>루트 기반 게시물 작성</h1>
          <p className={styles.pageDescription}>
            북마크한 루트를 불러오면, 루트 안의 장소 수만큼 사진 기록 칸이 자동으로 만들어집니다.
            각 장소의 원본 장면과 직접 찍은 대표 사진 1장을 나란히 놓고, 그 사진마다 따로 감상을 남길 수 있도록
            구성했습니다.
          </p>
        </header>

        <div className={styles.banner}>
          <AlertCircle size={16} />
          이 페이지는 실제 API를 호출하지 않는 목업 화면입니다. 루트, 핀, 사진 기록 흐름은
          `POST_CREATE_PAGE_ANALYSIS.md`에 정리한 데이터 계약을 기준으로 설계했습니다.
        </div>

        {submitState.message ? (
          <div className={styles.banner}>
            <Sparkles size={16} />
            {submitState.message}
          </div>
        ) : null}

        <PostRoutePicker
          routes={MOCK_POST_CREATE_ROUTES}
          selectedRouteId={selectedRouteId}
          onSelectRoute={handleSelectRoute}
          loading={false}
        />

        <section className={styles.formSection}>
          <label htmlFor="post-create-title" className={styles.sectionLabel}>
            제목
          </label>
          <input
            id="post-create-title"
            className={styles.titleInput}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 너의 이름은 루트를 따라 걸으며 남긴 실제 촬영 기록"
          />
        </section>

        <section className={styles.overviewCard}>
          <div className={styles.overviewLead}>
            <Sparkles size={18} />
            <strong>이 페이지가 처리하는 기록 단위</strong>
          </div>
          <p className={styles.overviewText}>
            게시물 본문 하나에 사진을 묶는 대신, 각 장소와 각 사진이 하나의 기록 단위가 됩니다. 그래서
            선택된 루트의 핀 정보는 카드 단위로 풀리고, 카드 안에서 대표 사진 1장과 감상 텍스트가 함께 관리됩니다.
          </p>
          <div className={styles.overviewMetrics}>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>
                {selectedRoute ? selectedRoute.spots.length : 0}
              </span>
              <span className={styles.metricLabel}>루트 기본 장소</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>{entries.filter((entry) => entry.kind === 'custom-place').length}</span>
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
              현재 루트 선택 전이라 카드가 비어 있습니다. 북마크한 루트를 먼저 고르면 그 안의 핀 수만큼
              사진 기록 영역이 자동으로 열립니다.
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
              필요한 경우 추가 장소를 더 넣고, 각 spot마다 사진 1장과 감상을 채운 뒤 게시할 수 있습니다.
            </p>
          </div>

          <div className={styles.bottomActions}>
            <button
              type="button"
              className={canSubmit ? styles.primaryCtaButton : `${styles.primaryCtaButton} ${styles.primaryCtaButtonDisabled}`}
              disabled={!canSubmit}
              onClick={handleSubmit}>
              게시글 등록
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostCreatePage;
