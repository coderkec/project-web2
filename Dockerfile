# =========================
# 1. Build Stage
# =========================
FROM node:22-bullseye AS builder

WORKDIR /app

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# package 파일 및 패치 파일 복사
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 복사
COPY . .

# Vite 빌드 시 필요한 환경변수 주입
ARG VITE_APP_ID
ENV VITE_APP_ID=$VITE_APP_ID


# Vite (Frontend) + esbuild (Server) 빌드
RUN pnpm build


# =========================
# 2. Runtime Stage
# =========================
FROM node:22-bullseye AS runner

WORKDIR /app
ENV NODE_ENV=production

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 빌드 결과물(dist 폴더)만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/patches ./patches

# 프로덕션 의존성만 설치
RUN pnpm install --prod --frozen-lockfile

# 앱 실행
EXPOSE 3000

# dist/index.js를 실행
CMD ["node", "dist/index.js"]
