-- V1.3__insert_admin_user.sql

-- 관리자 계정 생성
-- ID: admin / PW: admin1234
-- 이름(nickname): admin

INSERT IGNORE INTO `User` (
    `user_id`, 
    `email`, 
    `password`, 
    `nickname`, 
    `role`, 
    `status`
) VALUES (
    'admin', 
    'admin@oshiashi.com', 
    'admin1234', 
    '최고관리자', 
    'admin', 
    'active'
);