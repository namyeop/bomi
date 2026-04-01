FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 의존성 설치
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# 소스 복사 및 빌드
COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
