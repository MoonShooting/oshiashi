package project.oshiashi.oshiashi.domain.post.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.post.dto.PostEntryResponse;
import project.oshiashi.oshiashi.domain.comment.repository.CommentRepository;
import project.oshiashi.oshiashi.domain.post.dto.PostRequest;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostImageEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostLikeEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostTagEntity;
import project.oshiashi.oshiashi.domain.post.repository.PostImageRepository;
import project.oshiashi.oshiashi.domain.post.repository.PostLikeRepository;
import project.oshiashi.oshiashi.domain.post.repository.PostRepository;
import project.oshiashi.oshiashi.domain.post.repository.PostTagRepository;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;
import project.oshiashi.oshiashi.domain.tag.repository.TagRepository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional // 서비스 레이어 전체에 트랜잭션 적용 (더티 체킹 및 데이터 일관성 보장)
public class PostServiceImpl implements PostService {

	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final RouteRepository routeRepository;
	private final TagRepository tagRepository;
	private final PostLikeRepository postLikeRepository;

	private final CommentRepository commentRepository;
	private final PostTagRepository postTagRepository;
	private final PostImageRepository postImageRepository;


	/**
	 * 1. 게시글 전체 조회 ( 루트가 있는 게시물)
	 * @return List<PostResponse>
	 * - 필수 반환: 모든 필드 (postId, title, content, status, viewCount, likeCount, tagNames, createdAt, updateAt)
	 * - 특징: 데이터가 없으면 빈 리스트 [] 반환
	 */
	/*
	@Override // 2026-03-22 이상학 : 작업한 최신순, 조회수 순, 좋아요 순 날아간거 복구했습니다.
	@Transactional(readOnly = true)
	public List<PostResponse> getAllPost(Boolean routeIdIsNull, String sort, String search, List<String> tags) {
		log.debug("[Service] 게시글 전체 조회 요청 발생 - routeIdIsNull: {}, sort: {}", routeIdIsNull, sort);

		String normalizedSort = (sort == null || sort.isBlank()) ? "latest" : sort.trim().toLowerCase();

		List<PostEntity> posts;

		if (Boolean.TRUE.equals(routeIdIsNull)) {
			posts = switch (normalizedSort) {
				// 프론트에서 설정한 값에 맞춰서 case 변수명 맞추었습니다
				// 프론트에서는 <option value="latest">최신순</option> <option value="popular">인기순</option>
				// <option value="views">조회순</option> 으로 설정 되어있습니다
				case "views" -> postRepository.findAllByRouteIsNullOrderByViewCountDescCreatedAtDesc();
				case "popular"  -> postRepository.findAllByRouteIsNullOrderByLikeCountDescCreatedAtDesc();
				case "latest"-> postRepository.findAllByRouteIsNullOrderByCreatedAtDesc();
				default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다: " + sort);
			};
		} else {
			posts = switch (normalizedSort) {
				case "views" -> postRepository.findAllByRouteIsNotNullOrderByViewCountDescCreatedAtDesc();
				case "popular"  -> postRepository.findAllByRouteIsNotNullOrderByLikeCountDescCreatedAtDesc();
				case "latest"-> postRepository.findAllByRouteIsNotNullOrderByCreatedAtDesc();
				default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다: " + sort);
			};
		}

		return posts.stream()
				// 검색어 필터: 제목 또는 내용에 포함되는지 확인
				.filter(post -> (search == null || search.isBlank())
						|| post.getTitle().contains(search)
						|| post.getContent().contains(search))
				// 태그 필터: 선택한 태그를 하나라도 가지고 있는지 확인
				.filter(post -> (tags == null || tags.isEmpty())
						|| post.getPostTags().stream()
						.anyMatch(pt -> tags.contains(pt.getTag().getTagName())))
				.map(PostResponse::fromEntity)
				.collect(Collectors.toUnmodifiableList());
	}*/
	@Override
	@Transactional(readOnly = true)
	public List<PostResponse> getAllPost(Boolean routeIdIsNull, String sort, String search, List<String> tags) {
		log.debug("[Service] 게시글 전체 조회 요청 발생 - routeIdIsNull: {}, sort: {}", routeIdIsNull, sort);

		String normalizedSort = (sort == null || sort.isBlank()) ? "latest" : sort.trim().toLowerCase();
		List<PostEntity> posts;

		boolean hasTags = tags != null && !tags.isEmpty();
		boolean routeOnlyNull = Boolean.TRUE.equals(routeIdIsNull);

		// ── 정렬 상수 통일: 프론트 기준 "views"/"popular"/"latest" 사용 ──
		// (커뮤니티/루트 양쪽 모두 동일한 정렬 키 사용)
		if (routeOnlyNull) {
			if (hasTags) {
				posts = postRepository.findAllByRouteIsNullAndTagNamesInOrderByCreatedAtDesc(tags);
			} else {
				posts = switch (normalizedSort) {
					case "views", "view" -> postRepository.findAllByRouteIsNullOrderByViewCountDescCreatedAtDesc();
					case "popular", "like" -> postRepository.findAllByRouteIsNullOrderByLikeCountDescCreatedAtDesc();
					case "latest" -> postRepository.findAllByRouteIsNullOrderByCreatedAtDesc();
					default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다. " + sort);
				};
			}
		} else {
			if (hasTags) {
				posts = postRepository.findAllByRouteIsNotNullAndTagNamesInOrderByCreatedAtDesc(tags);
			} else {
				posts = switch (normalizedSort) {
					case "views", "view" -> postRepository.findAllByRouteIsNotNullOrderByViewCountDescCreatedAtDesc();
					case "popular", "like" -> postRepository.findAllByRouteIsNotNullOrderByLikeCountDescCreatedAtDesc();
					case "latest" -> postRepository.findAllByRouteIsNotNullOrderByCreatedAtDesc();
					default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다. " + sort);
				};
			}
		}

		// search는 우선 기존처럼 메모리 필터 유지
		List<PostEntity> filteredPosts = posts.stream()
				.filter(post -> (search == null || search.isBlank())
						|| post.getTitle().contains(search)
						|| post.getContent().contains(search))
				.toList();

		if (filteredPosts.isEmpty()) {
			return List.of();
		}

		List<Long> postIds = filteredPosts.stream()
				.map(PostEntity::getPostId)
				.toList();

		Map<Long, Integer> commentCountMap = commentRepository.countByPostIds(postIds).stream()
				.collect(Collectors.toMap(
						row -> (Long) row[0],
						row -> ((Long) row[1]).intValue()
				));

		Map<Long, List<String>> tagMap = postTagRepository.findTagNamesByPostIds(postIds).stream()
				.collect(Collectors.groupingBy(
						row -> (Long) row[0],
						Collectors.mapping(row -> (String) row[1], Collectors.toList())
				));

		Map<Long, List<String>> imageMap = postImageRepository.findImagesByPostIds(postIds).stream()
				.sorted(Comparator.comparing(row -> (Integer) row[2]))
				.collect(Collectors.groupingBy(
						row -> (Long) row[0],
						Collectors.mapping(row -> (String) row[1], Collectors.toList())
				));

		return filteredPosts.stream()
				.map(post -> PostResponse.fromListData(
						post,
						commentCountMap.getOrDefault(post.getPostId(), 0),
						tagMap.getOrDefault(post.getPostId(), List.of()),
						imageMap.getOrDefault(post.getPostId(), List.of())
				))
				.toList();
	}

	/**
	 * 1-2. 게시글 전체 조회 (페이지네이션 적용)
	 * - 기존 getAllPost와 동일한 로직이나 DB 레벨에서 LIMIT/OFFSET 적용
	 * - 프론트에서 page/size를 보내면 이 메서드로 라우팅됨
	 */
	@Override
	@Transactional(readOnly = true)
	public List<PostResponse> getAllPost(Boolean routeIdIsNull, String sort, String search, List<String> tags, Pageable pageable) {
		log.debug("[Service] 게시글 페이지네이션 조회 - routeIdIsNull: {}, sort: {}, page: {}, size: {}",
				routeIdIsNull, sort, pageable.getPageNumber(), pageable.getPageSize());

		String normalizedSort = (sort == null || sort.isBlank()) ? "latest" : sort.trim().toLowerCase();
		List<PostEntity> posts;

		boolean hasTags = tags != null && !tags.isEmpty();
		boolean hasSearch = search != null && !search.isBlank();
		boolean routeOnlyNull = Boolean.TRUE.equals(routeIdIsNull);

		// ── 성능 최적화: search 필터를 DB LIKE 쿼리로 전환 ──
		// 기존: DB에서 전체 로드 → Java stream().filter()로 검색 (메모리 낭비)
		// 개선: DB에서 LIKE 조건으로 필터링 후 페이지네이션 적용
		if (hasSearch && !hasTags) {
			// 검색어가 있고 태그 필터가 없는 경우 → DB LIKE 쿼리 사용
			if (routeOnlyNull) {
				posts = switch (normalizedSort) {
					case "views", "view" -> postRepository.searchByRouteNullViews(search, pageable);
					case "popular", "like" -> postRepository.searchByRouteNullPopular(search, pageable);
					case "latest" -> postRepository.searchByRouteNullLatest(search, pageable);
					default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다. " + sort);
				};
			} else {
				posts = switch (normalizedSort) {
					case "views", "view" -> postRepository.searchByRouteNotNullViews(search, pageable);
					case "popular", "like" -> postRepository.searchByRouteNotNullPopular(search, pageable);
					case "latest" -> postRepository.searchByRouteNotNullLatest(search, pageable);
					default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다. " + sort);
				};
			}
		} else if (routeOnlyNull) {
			if (hasTags) {
				posts = postRepository.findAllByRouteIsNullAndTagNamesInOrderByCreatedAtDesc(tags, pageable);
			} else {
				posts = switch (normalizedSort) {
					case "views", "view" -> postRepository.findAllByRouteIsNullOrderByViewCountDescCreatedAtDesc(pageable);
					case "popular", "like" -> postRepository.findAllByRouteIsNullOrderByLikeCountDescCreatedAtDesc(pageable);
					case "latest" -> postRepository.findAllByRouteIsNullOrderByCreatedAtDesc(pageable);
					default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다. " + sort);
				};
			}
		} else {
			if (hasTags) {
				posts = postRepository.findAllByRouteIsNotNullAndTagNamesInOrderByCreatedAtDesc(tags, pageable);
			} else {
				posts = switch (normalizedSort) {
					case "views", "view" -> postRepository.findAllByRouteIsNotNullOrderByViewCountDescCreatedAtDesc(pageable);
					case "popular", "like" -> postRepository.findAllByRouteIsNotNullOrderByLikeCountDescCreatedAtDesc(pageable);
					case "latest" -> postRepository.findAllByRouteIsNotNullOrderByCreatedAtDesc(pageable);
					default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다. " + sort);
				};
			}
		}

		// 태그+검색 조합인 경우에만 메모리 필터 (드문 케이스)
		List<PostEntity> filteredPosts;
		if (hasSearch && hasTags) {
			filteredPosts = posts.stream()
					.filter(post -> post.getTitle().contains(search)
							|| post.getContent().contains(search))
					.toList();
		} else {
			filteredPosts = posts;
		}

		if (filteredPosts.isEmpty()) {
			return List.of();
		}

		List<Long> postIds = filteredPosts.stream()
				.map(PostEntity::getPostId)
				.toList();

		Map<Long, Integer> commentCountMap = commentRepository.countByPostIds(postIds).stream()
				.collect(Collectors.toMap(
						row -> (Long) row[0],
						row -> ((Long) row[1]).intValue()
				));

		Map<Long, List<String>> tagMap = postTagRepository.findTagNamesByPostIds(postIds).stream()
				.collect(Collectors.groupingBy(
						row -> (Long) row[0],
						Collectors.mapping(row -> (String) row[1], Collectors.toList())
				));

		Map<Long, List<String>> imageMap = postImageRepository.findImagesByPostIds(postIds).stream()
				.sorted(Comparator.comparing(row -> (Integer) row[2]))
				.collect(Collectors.groupingBy(
						row -> (Long) row[0],
						Collectors.mapping(row -> (String) row[1], Collectors.toList())
				));

		return filteredPosts.stream()
				.map(post -> PostResponse.fromListData(
						post,
						commentCountMap.getOrDefault(post.getPostId(), 0),
						tagMap.getOrDefault(post.getPostId(), List.of()),
						imageMap.getOrDefault(post.getPostId(), List.of())
				))
				.toList();
	}

	/**
	 * 2. 게시글 단건 조회
	 * @param postId (필수) 조회할 게시글 고유 ID
	 * @return PostResponse
	 * - 필수 반환: 해당 ID의 모든 게시글 데이터 및 관련 태그 리스트
	 * - 예외: ID가 존재하지 않을 경우 RuntimeException 발생
	 */
	@Override
	@Transactional
	public PostResponse getPostById(Long postId) {
		log.debug("[Service] 게시글 단건 조회 시작 - ID: {}", postId);

		// ── 성능 최적화: 2-쿼리 전략으로 N+1 해결 ──
		// 1단계: Route → RouteSpot → Spot → Artwork 그래프를 한 번에 로드
		PostEntity entity = postRepository.findByIdWithRouteGraph(postId)
				.orElseThrow(() -> {
					log.debug("[Service] 조회 실패: {}번 게시글이 존재하지 않음", postId);
					return new BusinessException(ErrorCode.POST_NOT_FOUND);
				});

		// 2단계: Images와 PostTags를 별도 쿼리로 로드
		// (MultipleBagFetchException 방지를 위해 컬렉션별 분리)
		postRepository.findByIdWithImages(postId);
		postRepository.findByIdWithTags(postId);

		entity.incrementViewCount();
		log.debug("[Service] 조회수 증가!, {}", entity.getViewCount());
		log.debug("[Service] 게시글 조회 성공: {}", entity.getTitle());

		return PostResponse.fromEntity(entity);
	}

	/**
	 * 3. 게시글 작성
	 * @param request (PostRequest DTO)
	 * - [필수 입력]: title (제목), content (내용)
	 * - [선택 입력]: tagNames (태그 리스트)
	 * @return PostResponse
	 * - 필수 반환: 생성된 게시글의 모든 정보 (ID, 생성시간, 태그 리스트 포함)
	 */
	@Override
	public PostResponse createPost(PostRequest request) { // 파라미터를 PostRequest로 변경
		
		// 0. SecurityContext에서 직접 로그인 아이디 추출
		// [로그인 여부 2중 확인]
//		 - null: 인증 정보 자체가 아예 생성되지 않은 경우
//		 - "anonymousUser": 로그인은 안 했지만 접속은 유지 중인 '익명 사용자'인 경우
//		 위 두 경우에는 글을 쓸 수 없으므로 에러를 발생시켜 차단합니다.
		String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
		
		if (currentUserId == null || currentUserId.equals("anonymousUser")) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "인증 정보가 없습니다. 로그인이 필요합니다.");
		}
		
		log.debug("[Service] 게시글 등록 요청 시작 - 제목: {}", request.getTitle());

		UserEntity user = userRepository.findById(currentUserId)
				.orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "사용자를 찾을 수 없습니다."));
		
		RouteEntity route = null;
		if (request.getRouteId() != null) {
			route = routeRepository.findById(request.getRouteId())
					.orElseThrow(() -> new BusinessException(ErrorCode.ROUTE_NOT_FOUND));
		}
		
		
		// 1. 엔티티 생성 (기본 정보 초기화)
		// status, viewCount, likeCount 등은 생성 시점에 서버에서 강제로 초기값을 부여합니다.
		PostEntity postEntity = PostEntity.builder()
				.user(user)
				.route(route)
				.title(request.getTitle())
				.content(request.getContent())
				.status(PostEntity.PostStatus.PUBLIC) // 초기 상태는 PUBLIC으로 강제 설정
				.viewCount(0)
				.likeCount(0)
				.createdAt(LocalDateTime.now())
				.updateAt(LocalDateTime.now())
				.build();
		
		//먼저 저장하여 postId 받기
		postEntity = postRepository.save(postEntity);
		
		// 이미지 URL → 장소 메모 매핑 (순서 보존, 중복 제거)
		// 기존: List<String>으로 URL만 수집 → note 유실
		// 개선: LinkedHashMap<url, note>으로 entry별 note를 함께 저장
		LinkedHashMap<String, String> imageNoteMap = new LinkedHashMap<>();

		// 2. 프론트가 보낸 'entries'를 최우선으로 가져옵니다. (여기에 원본과 내 사진이 다 있음)
		if (request.getEntries() != null && !request.getEntries().isEmpty()) {
			for (PostEntryResponse entry : request.getEntries()) {
				String note = entry.getNote() != null ? entry.getNote().trim() : "";

				// 1. [짝수 라인] 애니메이션 원본 장면 (Reference)
				if (entry.getReferenceImageUrl() != null && !entry.getReferenceImageUrl().isBlank()) {
					imageNoteMap.putIfAbsent(entry.getReferenceImageUrl().trim(), note);
				}

				// 2. [홀수 라인] 내가 직접 찍은 사진 (User)
				if (entry.getUserImageUrl() != null && !entry.getUserImageUrl().isBlank()) {
					imageNoteMap.putIfAbsent(entry.getUserImageUrl().trim(), note);
				}
			}
		}

		// 3. 만약 위에서 아무것도 안 담겼다면 기본 imageUrl 사용 (note 없음)
		if (imageNoteMap.isEmpty() && request.getImageUrl() != null) {
			for (String url : request.getImageUrl()) {
				if (url != null && !url.isBlank()) {
					imageNoteMap.putIfAbsent(url.trim(), "");
				}
			}
		}
		log.debug("최종 리스트 내용: {}", imageNoteMap.keySet());

		// 3. 이제 합쳐진 imageNoteMap으로 DB에 저장 (sortOrder i, note 포함)
		List<String> persistableImages = new ArrayList<>(imageNoteMap.keySet());
		int sortIdx = 0;
		for (Map.Entry<String, String> imgEntry : imageNoteMap.entrySet()) {
			PostImageEntity imageEntity = PostImageEntity.builder()
					.post(postEntity)
					.imageUrl(imgEntry.getKey())
					.sortOrder(sortIdx++)
					.note(imgEntry.getValue())
					.createdAt(LocalDateTime.now())
					.build();
			postEntity.addPostImage(imageEntity);
		}


		// 2. 태그 처리: 요청 DTO에 태그 이름 리스트가 포함되어 있다면 매핑 진행
		// addTagsToPost 내부에서 TagEntity 조회/생성 및 PostTagEntity 연결이 일어납니다.
		if (request.getTagNames() != null && !request.getTagNames().isEmpty()) {
			log.debug("[Service] 태그 매핑 처리 시작: {}개", request.getTagNames().size());
			addTagsToPostInBatch(postEntity, request.getTagNames());
		}

		log.debug("[Service] 게시글 및 태그 저장 완료 - 생성된 ID: {}", postEntity.getPostId());

		// 3. 저장된 엔티티를 응답용 DTO로 변환하여 반환
		// @Transactional 덕분에 메서드가 끝날 때 변경사항(이미지, 태그)이 자동으로 DB에 반영됨
		List<String> responseTagNames = normalizeTagNames(request.getTagNames());
		List<PostEntryResponse> responseEntries = request.getEntries() != null ? request.getEntries() : List.of();
		return PostResponse.fromCreateData(postEntity, persistableImages, responseTagNames, responseEntries);
	}
	
	/**
	 * 4. 게시글 삭제
	 * @param postId (필수) 삭제할 게시글 고유 ID
	 * @return void (성공 시 리턴값 없음, 컨트롤러에서 성공 메시지 처리)
	 * - 예외: ID가 존재하지 않을 경우 RuntimeException 발생
	 */
	public void deletePost(Long postId, String userId) {
		// 존재하는 게시물인가 확인
		PostEntity postEntity = postRepository.findById(postId)
				.orElseThrow(() -> {
					log.debug("!!! [Service] 삭제 실패: {}번 게시글이 없습니다.", postId);
					return new BusinessException(ErrorCode.POST_NOT_FOUND, "삭제할 게시글을 찾을 수 없습니다.");
				});
		
		// 2. 작성자 검증
		// 실제 작성자와 현재 유저의 아이디 검수
		if (!postEntity.getUser().getUserId().equals(userId)) {
			log.debug("작성자가 아닙니다. 게시글 작성자 ID: {}, 로그인 유저 ID: {}",
					postEntity.getUser().getUserId(), userId);
			log.debug("본인꺼만 삭제 가능합니다");
			throw new BusinessException(ErrorCode.ACCESS_DENIED, "본인이 작성한 글만 삭제할 수 있습니다.");
		}
		
		postRepository.deleteById(postId);
		log.debug("[Service] ID : {} 데이터가  삭제되었습니다.", postId);
	}
	
	/**
	 * 5. 게시글 수정
	 * @param postId (필수) 수정할 게시글 고유 ID
	 * @param request (PostRequest DTO)
	 * - [필수 입력]: title (제목), content (내용), status (공개 여부)
	 * - [선택 입력]: tagNames (수정할 태그 리스트)
	 * @return PostResponse
	 * - 필수 반환: 수정 및 태그 교체가 완료된 최신 데이터 (변경된 updateAt 포함)
	 * - 예외: 수정 대상 게시글이 없을 경우 RuntimeException 발생
	 */
	@Override
	public PostResponse updatePost(Long postId, String userId , PostRequest request) {
		// 1. 기존 게시글 조회 (없으면 예외 발생)
		PostEntity postEntity = postRepository.findById(postId)
				.orElseThrow(() -> {
					log.debug("[Service] 수정 실패: {}번 게시글이 없습니다.", postId);
					return new BusinessException(ErrorCode.POST_NOT_FOUND, "수정할 게시글을 찾을 수 없습니다.");
				});
		
		// 작성자 검증
		if (!postEntity.getUser().getUserId().equals(userId)) {
			log.debug("본인꺼만 수정 가능합니다");
			throw new BusinessException(ErrorCode.ACCESS_DENIED, "본인이 작성한 글만 수정할 수 있습니다.");
		}
		
		
		// 2. 기본 정보 업데이트 (JPA Dirty Checking 활용)
		// 따로 save()를 호출하지 않아도 트랜잭션 종료 시점에 변경 사항이 DB에 반영됩니다.
		postEntity.setTitle(request.getTitle());
		postEntity.setContent(request.getContent());
		// 피드백 반영: status가 null이면 기존 값을 유지하도록 조건문 추가
		if (request.getStatus() != null) {
			postEntity.setStatus(request.getStatus());
		}
		postEntity.setUpdateAt(LocalDateTime.now()); // 수정 시간 갱신

		// 3. 태그 수정 (기존 매핑 전체 제거 후 신규 등록)
		// PostEntity의 orphanRemoval = true 설정 덕분에 clear() 호출 시 기존 매핑 데이터가 DB에서 자동 삭제됩니다.
		log.debug("[Service] 기존 태그 초기화 및 신규 태그 매핑 시작");
		postEntity.getPostTags().clear();

		if (request.getTagNames() != null && !request.getTagNames().isEmpty()) {
			addTagsToPostInBatch(postEntity, request.getTagNames());
		}

		log.debug("[Service] 게시글 정보 및 {}개의 태그 수정 완료",
				request.getTagNames() != null ? request.getTagNames().size() : 0);
		
		// 수정된 엔티티를 다시 DTO로 변환해서 반환
		PostResponse postResponse = PostResponse.fromEntity(postEntity);
		log.debug("[Service] 최종 변환된 응답 DTO: {}", postResponse);
		return postResponse;
	}

	/**
	 * 6. 게시글 좋아요 증감
	 * @param postId (필수) 좋아요를 누를 게시글 고유 ID
	 * @return PostResponse
	 * - 필수 반환: likeCount가 +1 된 후의 전체 게시글 정보
	 * - 예외: 게시글이 없을 경우 EntityNotFoundException 발생
	 */
	@Override
	public PostResponse likePost(Long postId, String userId) {
		log.debug("[Service] 좋아요 요청 - ID: {}", postId);

		PostEntity post = postRepository.findById(postId)
				.orElseThrow(() -> new EntityNotFoundException("게시글 없음: " + postId));
		UserEntity user = userRepository.findById(userId)
				.orElseThrow(() -> new EntityNotFoundException("유저 없음: " + userId));
		
		// 1. 이미 좋아요를 눌렀는지 확인
		Optional<PostLikeEntity> postLike = postLikeRepository.findByPostAndUser(post, user);
		
		if (postLike.isPresent()) {
			// 2. 이미 있다면? 좋아요 취소 (삭제)
			postLikeRepository.delete(postLike.get());
			post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
			log.debug("[Service] 좋아요 취소 완료");
		} else {
			// 3. 없다면? 좋아요 등록 (저장)
			PostLikeEntity newLike = PostLikeEntity.create(post, user);
			postLikeRepository.save(newLike);
			post.setLikeCount((post.getLikeCount() == null ? 0 : post.getLikeCount()) + 1);
			log.debug("[Service] 좋아요 등록 완료");
		}
		
		return PostResponse.fromEntity(post);
	}

	/**
	 * [내부 메서드] 게시글과 태그 이름을 매핑하여 저장하는 공통 로직
	 * @param post 대상 게시글 엔티티
	 * @param tagNames 추가할 태그 이름 리스트
	 */
	// 게시글 태그는 자유 입력 태그가 아니라 DB에 저장된 작품 제목 태그만 연결합니다.
	private void addTagsToPost(PostEntity post, List<String> tagNames) {
		tagNames.forEach(rawName -> {
			String name = rawName == null ? null : rawName.trim();
			
			if (name == null || name.isBlank()) {
				return;
			}
			// DB에 이미 저장된 태그만 선택해서 연결합니다.
			// 존재하지 않는 태그는 새로 만들지 않고 예외를 발생시킵니다.
			TagEntity tag = tagRepository.findByTagName(name)
					.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "존재하지 않는 태그입니다: " + name));
			
			// 같은 게시글에 동일한 태그가 중복으로 연결되지 않도록 한 번 더 확인합니다.
			boolean alreadyMapped = post.getPostTags().stream()
					.anyMatch(postTag -> postTag.getTag().getTagId().equals(tag.getTagId()));
			
			if (!alreadyMapped) {
				// 게시글과 태그의 연결 정보만 생성합니다.
				// 태그 본체(TagEntity)는 여기서 새로 만들지 않습니다.
				PostTagEntity postTag = PostTagEntity.create(post, tag);
				post.getPostTags().add(postTag);
			}
		});
	}

	private List<String> normalizeTagNames(List<String> tagNames) {
		if (tagNames == null) {
			return List.of();
		}

		return tagNames.stream()
				.filter(name -> name != null && !name.isBlank())
				.map(String::trim)
				.distinct()
				.toList();
	}

	private void addTagsToPostInBatch(PostEntity post, List<String> tagNames) {
		List<String> normalizedTagNames = tagNames.stream()
				.filter(name -> name != null && !name.isBlank())
				.map(String::trim)
				.distinct()
				.toList();

		if (normalizedTagNames.isEmpty()) {
			return;
		}

		List<TagEntity> tags = tagRepository.findAllByTagNameIn(normalizedTagNames);
		Map<String, TagEntity> tagMap = tags.stream()
				.collect(Collectors.toMap(TagEntity::getTagName, tag -> tag));

		List<String> missingTagNames = normalizedTagNames.stream()
				.filter(tagName -> !tagMap.containsKey(tagName))
				.toList();

		if (!missingTagNames.isEmpty()) {
			throw new BusinessException(
					ErrorCode.INVALID_INPUT_VALUE,
					"존재하지 않는 태그입니다: " + String.join(", ", missingTagNames)
			);
		}

		normalizedTagNames.forEach(tagName -> {
			TagEntity tag = tagMap.get(tagName);

			boolean alreadyMapped = post.getPostTags().stream()
					.anyMatch(postTag -> postTag.getTag().getTagId().equals(tag.getTagId()));

			if (!alreadyMapped) {
				PostTagEntity postTag = PostTagEntity.create(post, tag);
				post.getPostTags().add(postTag);
			}
		});
	}

	/**
	 * 메인 화면용 인기 게시글 목록 조회
	 * - 현재는 루트가 있는 게시글만 대상으로 합니다.
	 * - 좋아요가 많은 순으로 정렬한 뒤 상위 10개만 반환합니다.
	 * - 좋아요 수가 같으면 더 최근 글이 먼저 오도록 createdAt 기준을 함께 사용합니다.
	 */
	/** 인기 게시글 상위 10개 (DB LIMIT) */
	private static final int TOP_POSTS_LIMIT = 10;

	@Override
	@Transactional(readOnly = true)
	public List<PostResponse> getTopPosts() {
		log.debug("[Service] 메인 인기 게시글 목록 조회 요청");

		// ── 성능 최적화 ──
		// 기존: 전체 로드 → Java .limit(10) → fromEntity() N+1 = 221 쿼리
		// 개선: DB에서 10건만 조회 (JOIN FETCH user) → fromListData로 배치 변환 = 4 쿼리
		List<PostEntity> topPosts = postRepository.findTopPostsWithUser(
				PageRequest.of(0, TOP_POSTS_LIMIT));

		if (topPosts.isEmpty()) {
			return List.of();
		}

		List<Long> postIds = topPosts.stream()
				.map(PostEntity::getPostId)
				.toList();

		Map<Long, Integer> commentCountMap = commentRepository.countByPostIds(postIds).stream()
				.collect(Collectors.toMap(
						row -> (Long) row[0],
						row -> ((Long) row[1]).intValue()
				));

		Map<Long, List<String>> tagMap = postTagRepository.findTagNamesByPostIds(postIds).stream()
				.collect(Collectors.groupingBy(
						row -> (Long) row[0],
						Collectors.mapping(row -> (String) row[1], Collectors.toList())
				));

		Map<Long, List<String>> imageMap = postImageRepository.findImagesByPostIds(postIds).stream()
				.sorted(Comparator.comparing(row -> (Integer) row[2]))
				.collect(Collectors.groupingBy(
						row -> (Long) row[0],
						Collectors.mapping(row -> (String) row[1], Collectors.toList())
				));

		return topPosts.stream()
				.map(post -> PostResponse.fromListData(
						post,
						commentCountMap.getOrDefault(post.getPostId(), 0),
						tagMap.getOrDefault(post.getPostId(), List.of()),
						imageMap.getOrDefault(post.getPostId(), List.of())
				))
				.toList();
	}
}
