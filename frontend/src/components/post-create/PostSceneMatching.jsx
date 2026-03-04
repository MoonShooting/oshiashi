import React, { useState } from "react";

const INITIAL_SCENES = [
  {
    id: "1",
    spotName: "카마쿠라 고등학교 앞 건널목",
    artworkTitle: "슬램덩크 OP 명장면",
    sceneImageUrl: null,
    userPhotos: [],
  },
  {
    id: "2",
    spotName: "신주쿠 교차로",
    artworkTitle: "너의 이름은 - 타키와 미츠하 엇갈림",
    sceneImageUrl: null,
    userPhotos: [],
  },
  {
    id: "3",
    spotName: "스가 신사 계단",
    artworkTitle: "너의 이름은 - 재회 장면",
    sceneImageUrl: null,
    userPhotos: [],
  },
];

function PostSceneMatching() {
  const [scenes, setScenes] = useState(INITIAL_SCENES);

  const setSceneImage = (sceneId, imageUrl) => {
    setScenes((prev) => prev.map((scene) => (scene.id === sceneId ? { ...scene, sceneImageUrl: imageUrl } : scene)));
  };

  const addUserPhoto = (sceneId) => {
    setScenes((prev) =>
      prev.map((scene) => {
        if (scene.id !== sceneId) return scene;
        if (scene.userPhotos.length >= 6) return scene;
        const nextPhoto = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          hasGPS: Math.random() > 0.5,
        };
        return { ...scene, userPhotos: [...scene.userPhotos, nextPhoto] };
      })
    );
  };

  const removeUserPhoto = (sceneId, photoId) => {
    setScenes((prev) =>
      prev.map((scene) => {
        if (scene.id !== sceneId) return scene;
        return { ...scene, userPhotos: scene.userPhotos.filter((photo) => photo.id !== photoId) };
      })
    );
  };

  return (
    <section className="scene-matching">
      <div className="scene-matching-head">
        <h3>촬영 장면 매칭</h3>
        <p>각 장소의 원본 장면과 실제 촬영 사진을 연결할 수 있습니다</p>
      </div>

      <div className="scene-card-list">
        {scenes.map((scene) => {
          const isMatched = !!scene.sceneImageUrl && scene.userPhotos.length > 0;
          return (
            <article key={scene.id} className="scene-card card">
              <header className="scene-card-header">
                <h4>{scene.spotName}</h4>
                <p>{scene.artworkTitle}</p>
              </header>

              <div className="scene-card-grid">
                <div className="scene-col">
                  <span className="scene-col-title">원본 장면</span>
                  <button
                    className={scene.sceneImageUrl ? "scene-dropzone filled" : "scene-dropzone"}
                    onClick={() => setSceneImage(scene.id, `scene-${scene.id}`)}
                  >
                    {scene.sceneImageUrl ? (
                      <span className="scene-filled-label">원본 장면 연결됨</span>
                    ) : (
                      <>
                        <span>⤴</span>
                        <span>원본 장면 업로드</span>
                        <small>드래그하거나 클릭</small>
                      </>
                    )}
                  </button>
                </div>

                <div className="scene-col">
                  <div className="scene-user-head">
                    <span className="scene-col-title">실제 촬영 사진</span>
                    {isMatched && <span className="scene-match-badge">🔗 원본 장면과 매칭됨</span>}
                  </div>

                  <button className="scene-dropzone compact" onClick={() => addUserPhoto(scene.id)}>
                    <span>⤴</span>
                    <span>실제 촬영 사진 업로드</span>
                    <small>드래그하거나 클릭</small>
                  </button>

                  {!!scene.userPhotos.length && (
                    <div className="scene-photo-grid">
                      {scene.userPhotos.map((photo) => (
                        <div key={photo.id} className="scene-photo-thumb">
                          <button className="scene-photo-remove" onClick={() => removeUserPhoto(scene.id, photo.id)}>
                            ✕
                          </button>
                          <span className="scene-photo-gps">📍 {photo.hasGPS ? "위치정보 있음" : "위치정보 없음"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default PostSceneMatching;
