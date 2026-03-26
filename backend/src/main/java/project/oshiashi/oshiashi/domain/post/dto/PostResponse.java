package project.oshiashi.oshiashi.domain.post.dto;

import lombok.*;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity.PostStatus;
import project.oshiashi.oshiashi.domain.post.entity.PostImageEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostTagEntity;
import project.oshiashi.oshiashi.domain.route.entity.RouteSpotEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * [ 게시글 응답 DTO ]
 * - DB에서 조회한 데이터를 클라이언트에게 전달할 때 사용합니다.
 * - 엔티티 내부의 모든 필드와 함께, 매핑된 태그 이름 리스트를 포함합니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PostResponse {

	private Long postId;        // 게시글 고유 ID
	private String title;       // 제목
	private String content;     // 내용
	private PostStatus status;  // 공개 여부 (PUBLIC, PRIVATE 등)
	private Integer viewCount;  // 조회수
	private Integer likeCount;  // 좋아요 수
	private LocalDateTime createdAt; // 생성 일시
	private LocalDateTime updateAt;  // 수정 일시
	
	private Long routeId;    // 추가: 프론트엔드 분기 처리를 위한 필드
	private List<String> imageUrl;
	/**
	 * 태그 이름 리스트
	 * - PostTagEntity 리스트에서 태그 이름(String)만 추출하여 담습니다.
	 */
	private List<String> tagNames;
	
	// 프론트에서 설정한 댓글 카운팅 하는 변수입니다
	private Integer commentCount;
	
	
	// [추가 1] 목록/마이페이지를 위한 대표 이미지 (첫 번째 이미지 주소)
	private String thumbnailUrl;
	
	// [추가 2] 성지순례 상세 비교 UI를 위한 핵심 데이터 (이미지 리스트를 가공해서 담음)
	private List<PostEntryResponse> entries;
	
	private String userId;
	private String userNickname;
	/**
	 * 엔티티를 DTO로 변환하는 정적 팩토리 메서드
	 * @param entity 변환할 PostEntity
	 * @return 변환된 PostResponse
	 */
	public static PostResponse fromEntity(PostEntity entity) {
		// 첫 번째 이미지를 썸네일로 활용
		List<PostImageEntity> sortedImages = entity.getImages().stream()
				.sorted(Comparator.comparingInt(PostImageEntity::getSortOrder))
				.collect(Collectors.toList());
		
		String firstImg = (sortedImages != null && !sortedImages.isEmpty())
				? sortedImages.get(0).getImageUrl() : null;
		
		// [수정 포인트] 0번 인덱스만 원본 취급하는 entries 생성
		List<PostEntryResponse> entryResponses = new ArrayList<>();
		if (!sortedImages.isEmpty()) {
			
			// 1. 현재 게시글(Post)에 연결된 루트에서 routeSpots 리스트를 가져옵니다.
			List<RouteSpotEntity> routeSpots = (entity.getRoute() != null)
					? entity.getRoute().getRouteSpots() : new ArrayList<>();
			
			// i += 2 를 통해 [원본, 내사진] 한 쌍씩 묶어서 처리합니다.
			for (int i = 0; i < sortedImages.size(); i += 2) {
				
				// 짝수(i) : 애니메이션 원본 장면 (Reference)
				PostImageEntity refImg = sortedImages.get(i);
				
				// 홀수(i + 1) : 내가 직접 찍은 사진 (User)
				// 만약 홀수 번호 사진이 없을 경우를 대비해 안전하게 처리
				PostImageEntity userImg = (i + 1 < sortedImages.size())
						? sortedImages.get(i + 1) : null;
				
				int spotIdx = i / 2; // 몇 번째 장소인지 (0, 1, 2...)
				
				// 기본값 설정
				String realArtworkTitle = "작품 정보 없음";
				String realName = "장소 정보 없음";
				String realAddress = "주소 정보 없음";
				BigDecimal lat = BigDecimal.ZERO;
				BigDecimal lng = BigDecimal.ZERO;
				
				// 2. [핵심] routeSpots를 타고 들어가서 진짜 Spot 데이터 가져오기
				if (spotIdx < routeSpots.size()) {
					// RouteSpotEntity에서 SpotEntity를 꺼냅니다.
					var spot = routeSpots.get(spotIdx).getSpot();
					
					if (spot != null) {
						realName = spot.getName();       // "도쿄 타워", "도쿄 돔" 등
						realAddress = spot.getAddress(); // 실제 주소
						lat = spot.getLatitude();        // DB의 위도
						lng = spot.getLongitude();       // DB의 경도
						if (spot.getArtwork() != null) {
							realArtworkTitle = spot.getArtwork().getTitle(); // 드디어 진짜 제목!
						}
					}
				}
				
				// 성민님이 정해둔 변수명에 매핑
				String referenceUrl = refImg.getImageUrl(); // 왼쪽 화면용
				String userUrl = (userImg != null) ? userImg.getImageUrl() : referenceUrl; // 오른쪽 화면용
				
				entryResponses.add(PostEntryResponse.builder()
						.referenceImageUrl(referenceUrl)
						.userImageUrl(userUrl)
						.name(realName)//(i / 2 + 1) + "번째 성지 장소") // 장소 1, 장소 2... 순서
						.address(realAddress) // 추후 엔티티에 address 필드가 있다면 img.getAddress() 등으로 교체
						.artworkTitle(realArtworkTitle)
						.latitude(lat)
						.longitude(lng)
						.note(userImg != null ? "직접 촬영한 기록입니다." : "비교용 원본 이미지입니다.")
						.sortOrder(i / 2) // 화면 리스트 인덱스 (0, 1, 2...)
						.build());
			}
		}
		
		return PostResponse.builder()
				.userId(entity.getUser().getUserId())
				.userNickname(entity.getUser().getNickname())
				.postId(entity.getPostId())
				.title(entity.getTitle())
				.content(entity.getContent())
				// route가 null일 수 있으므로 안전하게 처리
				.routeId(entity.getRoute() != null ? entity.getRoute().getRouteId() : null)
				.status(entity.getStatus())
				.viewCount(entity.getViewCount())
				.likeCount(entity.getLikeCount())
				.createdAt(entity.getCreatedAt())
				// (추가) 댓글 리스트의 크기를 측정하여 매핑 (Null 체크 포함)
				.commentCount(entity.getComments() != null ? entity.getComments().size() : 0)
				.updateAt(entity.getUpdateAt())
				
				// [추가 1 매핑] 썸네일 URL
				.thumbnailUrl(firstImg)
				
				// 위에서 만든 엔트리 리스트를 연결
				.entries(entryResponses)
				
				// [핵심] PostTagEntity 리스트를 순회하며 태그 이름만 String 리스트로 수집
				.tagNames(entity.getPostTags().stream()
						.map(postTag -> postTag.getTag().getTagName())
						.collect(Collectors.toList()))
				// 추가: 이미지 리스트 변환 (엔티티 -> DTO)
				.imageUrl(entity.getImages().stream()
						.map(PostImageEntity::getImageUrl)
						.collect(Collectors.toList()))
				.build();
	}

	public static PostResponse fromListData(
			PostEntity entity,
			Integer commentCount,
			List<String> tagNames,
			List<String> imageUrls
	) {
		return PostResponse.builder()
				.userId(entity.getUser().getUserId())
				.userNickname(entity.getUser().getNickname())
				.postId(entity.getPostId())
				.title(entity.getTitle())
				.content(entity.getContent())
				.routeId(entity.getRoute() != null ? entity.getRoute().getRouteId() : null)
				.status(entity.getStatus())
				.viewCount(entity.getViewCount())
				.likeCount(entity.getLikeCount())
				.createdAt(entity.getCreatedAt())
				.updateAt(entity.getUpdateAt())
				.commentCount(commentCount != null ? commentCount : 0)
				.tagNames(tagNames != null ? tagNames : List.of())
				.imageUrl(imageUrls != null ? imageUrls : List.of())
				.build();
	}

	public static PostResponse fromCreateData(
			PostEntity entity,
			List<String> imageUrls,
			List<String> tagNames,
			List<PostEntryResponse> entries
	) {
		List<String> safeImageUrls = imageUrls != null ? imageUrls : List.of();
		List<String> safeTagNames = tagNames != null ? tagNames : List.of();
		List<PostEntryResponse> safeEntries = entries != null ? entries : List.of();

		return PostResponse.builder()
				.userId(entity.getUser().getUserId())
				.userNickname(entity.getUser().getNickname())
				.postId(entity.getPostId())
				.title(entity.getTitle())
				.content(entity.getContent())
				.routeId(entity.getRoute() != null ? entity.getRoute().getRouteId() : null)
				.status(entity.getStatus())
				.viewCount(entity.getViewCount())
				.likeCount(entity.getLikeCount())
				.createdAt(entity.getCreatedAt())
				.updateAt(entity.getUpdateAt())
				.commentCount(0)
				.thumbnailUrl(safeImageUrls.isEmpty() ? null : safeImageUrls.get(0))
				.entries(safeEntries)
				.tagNames(safeTagNames)
				.imageUrl(safeImageUrls)
				.build();
	}

}
