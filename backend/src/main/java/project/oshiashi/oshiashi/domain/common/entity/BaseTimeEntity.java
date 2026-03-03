package project.oshiashi.oshiashi.domain.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public class BaseTimeEntity {
    @CreatedDate
    @Column(name = "created_at", updatable = false) // DB 확정 후 수정부분
    protected LocalDateTime TimecreatedAt;

    @LastModifiedDate
    @Column(name = "updated_at") // DB 확정 후 수정부분
    protected LocalDateTime TimeupdatedAt;
}
