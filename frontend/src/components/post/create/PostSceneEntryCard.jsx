import React, { useRef } from 'react';
import {
  Camera,
  ImagePlus,
  Link2,
  MapPin,
  Music4,
  PlusCircle,
  Upload,
  X,
} from 'lucide-react';
import styles from '@/styles/PostCreatePage.module.css';

const PostSceneEntryCard = ({
  entry,
  index,
  onUpdateField,
  onUploadReferenceImage,
  onAddPhotos,
  onRemovePhoto,
  onUpdatePhotoNote,
  onRemoveEntry,
}) => {
  const photoInputRef = useRef(null);
  const referenceInputRef = useRef(null);

  const referenceImageUrl =
    entry.referenceImagePreviewUrl ?? entry.referenceImageUrl ?? entry.sceneImageUrl ?? null;
  const referenceLabel = entry.kind === 'custom-place' ? '비교용 참고 이미지' : '원본 장면';
  const uploadedPhoto = entry.experiencePhotos[0] ?? null;

  // 업로드 상태 문구는 이 카드에서만 가공해,
  // 부모 페이지는 "상태 값"만 관리하도록 역할을 분리합니다.
  const referenceUploadMessage =
    entry.referenceImageUploadStatus === 'uploading'
      ? '참고 이미지를 업로드하는 중입니다.'
      : entry.referenceImageUploadStatus === 'error'
        ? entry.referenceImageUploadError || '참고 이미지 업로드에 실패했습니다.'
        : entry.referenceImageUploadStatus === 'uploaded'
          ? `${entry.referenceImageFileName || '참고 이미지'} 업로드가 완료되었습니다.`
          : '';
  const photoUploadMessage =
    uploadedPhoto?.uploadStatus === 'uploading'
      ? '대표 사진을 업로드하는 중입니다.'
      : uploadedPhoto?.uploadStatus === 'error'
        ? uploadedPhoto.uploadError || '대표 사진 업로드에 실패했습니다.'
        : uploadedPhoto?.uploadStatus === 'uploaded'
          ? `${uploadedPhoto.name} 업로드가 완료되었습니다.`
          : '';
  const photoPromptPresets = [
    '이 장면이 특히 좋았던 이유는 ',
    '이 사진을 찍을 때 들은 음악은 ',
    '직접 와보니 작중 분위기와 달랐던 점은 ',
  ];

  return (
    <article
      className={
        entry.kind === 'custom-place'
          ? `${styles.entryCard} ${styles.entryCardCustom}`
          : styles.entryCard
      }>
      <div className={styles.entryHeader}>
        <div className={styles.entryHeaderMain}>
          <span className={styles.entryIndex}>{index + 1}</span>
          <div className={styles.entryTitleBlock}>
            <h3 className={styles.entryTitle}>
              {entry.name || (entry.kind === 'custom-place' ? '추가 장소 이름을 입력하세요' : '장소 이름 없음')}
            </h3>
            <p className={styles.entryMeta}>
              {entry.artworkTitle || '작품 정보 없음'}
              {entry.address ? ` · ${entry.address}` : ''}
            </p>
          </div>
        </div>

        <div className={styles.entryPillRow}>
          <span className={styles.entryPill}>
            <Camera size={13} />
            {uploadedPhoto ? '대표 사진 등록 완료' : '대표 사진 없음'}
          </span>
          <span className={styles.entryPill}>
            <MapPin size={13} />
            {entry.kind === 'custom-place' ? '추가 장소' : '루트 장소'}
          </span>
          {entry.kind === 'custom-place' ? (
            <button
              type="button"
              className={styles.entryRemoveButton}
              onClick={() => onRemoveEntry(entry.id)}>
              <X size={14} />
              삭제
            </button>
          ) : null}
        </div>
      </div>

      {entry.kind === 'custom-place' ? (
        <div className={styles.customFields}>
          <div className={styles.customFieldGrid}>
            <label className={styles.customField}>
              <span>장소 이름</span>
              <input
                className={styles.customFieldInput}
                value={entry.name}
                onChange={(event) => onUpdateField(entry.id, 'name', event.target.value)}
                placeholder="예: 도쿄 타워 전망대"
              />
            </label>
            <label className={styles.customField}>
              <span>작품 또는 메모</span>
              <input
                className={styles.customFieldInput}
                value={entry.artworkTitle}
                onChange={(event) => onUpdateField(entry.id, 'artworkTitle', event.target.value)}
                placeholder="예: 자유 일정 / 추가 방문지"
              />
            </label>
          </div>
          <label className={styles.customField}>
            <span>주소 또는 위치 설명</span>
            <input
              className={styles.customFieldInput}
              value={entry.address}
              onChange={(event) => onUpdateField(entry.id, 'address', event.target.value)}
              placeholder="검색에 사용할 주소나 위치 설명을 적어주세요"
            />
          </label>
        </div>
      ) : null}

      <div className={styles.compareGrid}>
        <div className={styles.compareColumn}>
          <span className={styles.columnLabel}>{referenceLabel}</span>
          <div
            className={styles.referenceCard}
            role="button"
            tabIndex={0}
            onClick={() => referenceInputRef.current?.click()}
            onKeyDown={(event) => {
              // reference 카드 전체를 업로드 트리거로 열어
              // 모바일/데스크톱 모두 클릭 영역이 넓게 유지되도록 합니다.
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                referenceInputRef.current?.click();
              }
            }}>
            {referenceImageUrl ? (
              <img
                src={referenceImageUrl}
                alt={`${entry.name || '장소'} reference`}
                className={styles.referenceImage}
              />
            ) : (
              <div className={styles.referencePlaceholder}>
                <ImagePlus size={26} />
                <strong className={styles.referencePlaceholderTitle}>
                  참고 이미지가 아직 없습니다
                </strong>
                <p className={styles.referencePlaceholderText}>
                  추가 장소라면 비교용 참고 이미지를 직접 넣을 수 있습니다.
                </p>
              </div>
            )}
          </div>

          <div className={styles.compareInfoRow}>
            {referenceImageUrl && entry.experiencePhotos.length > 0 ? (
              <span className={styles.matchBadge}>
                <Link2 size={13} />
                원본 장면과 실제 사진을 함께 기록 중
              </span>
            ) : (
              <span className={styles.entryPill}>
                <PlusCircle size={13} />
                사진과 함께 장소 경험을 남겨보세요
              </span>
            )}

            <button
              type="button"
              className={styles.uploadReferenceButton}
              onClick={() => referenceInputRef.current?.click()}>
              <ImagePlus size={14} />
              {referenceImageUrl ? '참고 이미지 바꾸기' : '참고 이미지 추가'}
            </button>
          </div>

          {referenceUploadMessage ? (
            <p
              className={
                entry.referenceImageUploadStatus === 'error'
                  ? `${styles.uploadStatusText} ${styles.uploadStatusError}`
                  : styles.uploadStatusText
              }>
              {referenceUploadMessage}
            </p>
          ) : null}

          <input
            ref={referenceInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length > 0) {
                onUploadReferenceImage(entry.id, files[0]);
              }
              event.target.value = '';
            }}
          />
        </div>

        <div className={styles.compareColumn}>
          <span className={styles.columnLabel}>실제 촬영 사진</span>
          <button
            type="button"
            className={styles.uploadZone}
            onClick={() => photoInputRef.current?.click()}>
            <Upload size={24} />
            <strong className={styles.uploadZoneTitle}>실제 촬영 사진 업로드</strong>
            <p className={styles.uploadZoneHint}>
              각 spot에는 대표 사진 1장만 올립니다. 대신 그 사진에 대한 감상, 음악, 현장 분위기를 자세히 적습니다.
            </p>
            <span className={styles.uploadZoneButton}>
              {uploadedPhoto ? '사진 바꾸기' : '사진 추가'}
            </span>
          </button>

          <input
            ref={photoInputRef}
            type="file"
            // 페이지 정책과 동일하게 대표 사진은 jpg/png/webp만 허용합니다.
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length > 0) {
                onAddPhotos(entry.id, files);
              }
              event.target.value = '';
            }}
          />

          {uploadedPhoto ? (
            <>
              <div className={styles.photoNarrativeBanner}>
                <div className={styles.photoNarrativeLead}>
                  <Music4 size={15} />
                  <strong>게시물 내용은 이 대표 사진의 감상으로 적습니다</strong>
                </div>
                <p className={styles.photoNarrativeText}>
                  예: “이 장면 너무 좋았습니다”, “이때는 OST를 들으면서 걸었습니다”, “실제로는 훨씬 조용한 분위기였습니다”
                </p>
              </div>

              <div className={styles.photoSingleWrap}>
                <div className={styles.photoCard}>
                  <div className={styles.photoPreviewWrap}>
                    <img
                      src={uploadedPhoto.previewUrl}
                      alt={uploadedPhoto.name}
                      className={styles.photoPreview}
                    />
                    <button
                      type="button"
                      className={styles.photoRemoveButton}
                      onClick={() => onRemovePhoto(entry.id, uploadedPhoto.id)}>
                      <X size={12} />
                    </button>
                  </div>
                  <div className={styles.photoInfoRow}>
                    <span className={`${styles.gpsBadge} ${styles.gpsBadgeNeutral}`}>
                      <MapPin size={10} />
                      위치정보 미확인
                    </span>
                    <span className={styles.entryMeta}>{uploadedPhoto.name}</span>
                  </div>
                  {photoUploadMessage ? (
                    <p
                      className={
                        uploadedPhoto.uploadStatus === 'error'
                          ? `${styles.uploadStatusText} ${styles.uploadStatusError}`
                          : styles.uploadStatusText
                      }>
                      {photoUploadMessage}
                    </p>
                  ) : null}
                  <div className={styles.photoNoteHeader}>
                    <strong className={styles.photoNoteLabel}>이 사진의 감상</strong>
                    <span className={styles.photoNoteHelper}>
                      장면 감상, 들은 음악, 현장 기분을 이 대표 사진 기준으로 남겨보세요
                    </span>
                  </div>
                  <div className={styles.photoPromptRow}>
                    {photoPromptPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={styles.photoPromptChip}
                        onClick={() =>
                          onUpdatePhotoNote(
                            entry.id,
                            uploadedPhoto.id,
                            uploadedPhoto.note ? `${uploadedPhoto.note}\n${preset}` : preset,
                          )
                        }>
                        {preset}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className={styles.photoNote}
                    value={uploadedPhoto.note}
                    onChange={(event) =>
                      onUpdatePhotoNote(entry.id, uploadedPhoto.id, event.target.value)
                    }
                    placeholder="예: 이 장면이 정말 좋았습니다. 실제로는 골목이 더 좁았고, 이때는 OST를 들으며 걸어서 더 몰입됐습니다."
                  />
                </div>
              </div>
            </>
          ) : (
            <p className={styles.referencePlaceholderText}>
              아직 업로드된 사진이 없습니다. 이 장소를 다녀왔다면 대표 사진 1장을 먼저 올리고, 그 사진의 감상을 남겨보세요.
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostSceneEntryCard;
