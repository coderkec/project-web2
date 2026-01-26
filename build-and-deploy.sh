#!/bin/bash
# 통합 대시보드 빌드 및 배포 스크립트 (OAuth 디버깅 버전)

set -e

echo "========================================="
echo "통합 대시보드 도커 빌드 및 배포"
echo "========================================="

# 환경변수 확인
GOOGLE_CLIENT_ID="116278425083-h8gi5c8u24gcoudtfbks9u8bkfknc1n7.apps.googleusercontent.com"
REGISTRY="10.2.2.40:5000"
IMAGE_NAME="library/integrated-dashboard"
VERSION=$(date +%Y%m%d-%H%M%S)

echo ""
echo "빌드 정보:"
echo "  - 레지스트리: ${REGISTRY}"
echo "  - 이미지: ${IMAGE_NAME}"
echo "  - 버전: ${VERSION}"
echo ""

# 1. 도커 이미지 빌드
echo "[1/5] 도커 이미지 빌드 중..."
docker build \
  --build-arg VITE_APP_ID="${GOOGLE_CLIENT_ID}" \
  --no-cache \
  -t ${REGISTRY}/${IMAGE_NAME}:${VERSION} \
  -t ${REGISTRY}/${IMAGE_NAME}:latest \
  .

echo "✅ 도커 이미지 빌드 완료"

# 2. 도커 레지스트리에 푸시
echo ""
echo "[2/5] 도커 이미지 푸시 중..."
docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}
docker push ${REGISTRY}/${IMAGE_NAME}:latest

echo "✅ 도커 이미지 푸시 완료"

# 2.5 불필요한 이미지 및 시스템 자원 정리 (용량 확보)
echo ""
echo "[Cleanup] 도커 시스템 및 빌드 캐시 정리 중..."
# 사용하지 않는 모든 찌꺼기(이미지, 캐시, 네트워크 등) 일괄 삭제
docker system prune -f
docker builder prune -f

# 3. 기존 파드 완전 삭제 (캐시 방지)
echo ""
echo "[3/5] 기존 파드 삭제 중..."
kubectl delete pods -n team2 -l app=integrated-dashboard --force --grace-period=0 || true
sleep 5

echo "✅ 기존 파드 삭제 완료"

# 4. Kubernetes 배포
echo ""
echo "[4/5] Kubernetes 배포 중..."
kubectl apply -f deployment.yaml
kubectl apply -f ingress.yaml

echo "✅ Kubernetes 배포 완료"

# 5. 배포 상태 확인
echo ""
echo "[5/5] 배포 상태 확인 중..."
echo "파드 상태:"
kubectl get pods -n team2 -l app=integrated-dashboard

echo ""
echo "서비스 상태:"
kubectl get svc -n team2

echo ""
echo "Ingress 상태:"
kubectl get ingress -n team2

echo ""
echo "========================================="
echo "배포 완료!"
echo "========================================="
echo ""
echo "다음 단계:"
echo "1. 파드 로그 확인:"
echo "   kubectl logs -f -n team2 -l app=integrated-dashboard"
echo ""
echo "2. 브라우저에서 접속:"
echo "   http://172.16.6.61"
echo ""
echo "3. Google OAuth 테스트 후 로그에서 [Auth] 메시지 확인"
echo ""
