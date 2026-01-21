#!/bin/bash
# 도커 이미지 빌드 및 배포 스크립트

set -e

echo "========================================="
echo "통합 대시보드 도커 빌드 및 배포"
echo "========================================="

# 1. 도커 이미지 빌드
echo ""
echo "[1/3] 도커 이미지 빌드 중..."
docker build \
  --build-arg VITE_APP_ID=116278425083-h8gi5c8u24gcoudtfbks9u8bkfknc1n7.apps.googleusercontent.com \
  -t 10.2.2.40:5000/library/integrated-dashboard:latest \
  .

echo "✅ 도커 이미지 빌드 완료"

# 2. 도커 레지스트리에 푸시
echo ""
echo "[2/3] 도커 이미지 푸시 중..."
docker push 10.2.2.40:5000/library/integrated-dashboard:latest

echo "✅ 도커 이미지 푸시 완료"

# 3. Kubernetes 배포
echo ""
echo "[3/3] Kubernetes 배포 중..."
kubectl apply -f deployment.yaml
kubectl apply -f ingress.yaml

echo "✅ Kubernetes 배포 완료"

# 4. 배포 상태 확인
echo ""
echo "========================================="
echo "배포 상태 확인"
echo "========================================="
kubectl get pods -n team2 -l app=integrated-dashboard
kubectl get svc -n team2
kubectl get ingress -n team2

echo ""
echo "========================================="
echo "배포 완료!"
echo "========================================="
echo ""
echo "다음 단계:"
echo "1. Google Cloud Console에 Redirect URI 추가:"
echo "   http://172.16.6.61/api/oauth/callback"
echo ""
echo "2. 브라우저에서 접속:"
echo "   http://172.16.6.61"
echo ""
