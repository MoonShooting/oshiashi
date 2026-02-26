-- V1.3: Spot 테이블의 오타 및 설계서 반영
-- 만약 기존에 Favorite이라는 이름으로 생성했다면 이름을 Spot으로 변경
-- ALTER TABLE Favorite RENAME TO Spot; 

-- Spot 테이블의 오타 수정 (latitute -> latitude 등)
ALTER TABLE Spot RENAME COLUMN latitute TO latitude;
ALTER TABLE Spot RENAME COLUMN longitute TO longitude;
ALTER TABLE Spot RENAME COLUMN adress TO address;

-- 설계서에 따른 spot_description(장소 설명) 컬럼 추가 (필요시)
-- ALTER TABLE Spot ADD COLUMN spot_description TEXT;