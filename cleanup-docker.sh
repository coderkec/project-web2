#!/bin/bash
# 도커 시스템 정밀 청소 스크립트 (용량 확보용)

echo "========================================="
echo "도커 시스템 클린업 시작 (찌꺼기 제거)"
echo "========================================="

# 1. 사용하지 않는 컨테이너, 네트워크, 이미지(dangling) 및 빌드 캐시 정격 삭제
echo "[1/3] 사용하지 않는 모든 자원 정리 중 (system prune)..."
docker system prune -f

# 2. 빌드 캐시 강제 정리 (용량을 가장 많이 차지함)
echo "[2/3] 빌드 캐시 정리 중..."
docker builder prune -f

# 3. 현재 배포된 이미지 외에 오래된 이미지들 정리 (태그 있는 이미지 포함)
echo "[3/3] 이전 대시보드 이미지 정리 중..."
# 'latest'와 현재 날짜가 포함된 이미지를 제외한 모든 integrated-dashboard 이미지 삭제 시도
REGISTRY="10.2.2.40:5000"
IMAGE_NAME="library/integrated-dashboard"
docker images ${REGISTRY}/${IMAGE_NAME} --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep -v "latest" | grep -v "$(date +%Y%m%d)" | awk '{print $2}' | xargs -r docker rmi || true

echo ""
echo "========================================="
echo "청소 완료! 남아 있는 용량을 확인하세요."
df -h /
echo "========================================="
