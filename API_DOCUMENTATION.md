# API 문서 - 통합 서비스 대시보드

## 개요

통합 서비스 대시보드는 **tRPC** 기반의 타입 안전 API를 제공합니다. 모든 API 호출은 `/api/trpc` 엔드포인트를 통해 처리되며, 자동 타입 검증과 에러 처리를 지원합니다.

## 인증

모든 API는 **Manus OAuth**를 통한 인증이 필요합니다. 로그인 후 자동으로 세션 쿠키가 설정되어 인증된 요청을 처리할 수 있습니다.

### 인증 확인
```typescript
const { user } = await trpc.auth.me.useQuery();
```

## API 엔드포인트

### 1. 날씨 API (weather)

#### weather.fetch - 날씨 데이터 조회
특정 위치의 현재 날씨 정보를 조회합니다.

**요청**
```typescript
const weatherData = await trpc.weather.fetch.useQuery({ 
  location: "서울" 
});
```

**응답**
```typescript
{
  location: string;           // 위치명
  temperature: number;        // 온도 (°C)
  humidity: number;           // 습도 (%)
  windSpeed: number;          // 풍속 (km/h)
  condition: string;          // 날씨 상태 (맑음, 흐림 등)
  description?: string;       // 상세 설명
  feelsLike?: number;         // 체감 온도 (°C)
  uvIndex?: number;           // 자외선 지수 (0-11)
  visibility?: number;        // 시정 (m)
  pressure?: number;          // 기압 (hPa)
  precipitation?: number;     // 강수량 (mm)
}
```

**예시**
```typescript
const result = await trpc.weather.fetch.useQuery({ location: "서울" });
console.log(result.temperature); // 15
console.log(result.humidity);    // 65
```

#### weather.latest - 최근 날씨 기록 조회
저장된 최근 날씨 기록을 조회합니다.

**요청**
```typescript
const records = await trpc.weather.latest.useQuery();
```

**응답**
최대 10개의 최근 기록을 시간순으로 반환합니다.

#### weather.save - 날씨 데이터 저장
날씨 정보를 데이터베이스에 저장합니다.

**요청**
```typescript
await trpc.weather.save.useMutation().mutateAsync({
  location: "서울",
  temperature: 15,
  humidity: 65,
  windSpeed: 12,
  condition: "맑음",
  description: "맑은 하늘",
  feelsLike: 13,
  uvIndex: 5,
  visibility: 10000,
  pressure: 1013,
  precipitation: 0
});
```

**응답**
```typescript
{ success: true }
```

---

### 2. 물류 API (logistics)

#### logistics.fetch - 배송 정보 조회
배송 번호로 배송 정보를 조회합니다.

**요청**
```typescript
const logisticsData = await trpc.logistics.fetch.useQuery({ 
  trackingNumber: "CJ123456789" 
});
```

**응답**
```typescript
{
  trackingNumber: string;     // 배송 번호
  status: string;             // 배송 상태
  origin: string;             // 출발지
  destination: string;        // 도착지
  carrier?: string;           // 배송사
  estimatedDelivery?: Date;   // 예상 배송일
  actualDelivery?: Date;      // 실제 배송일
  weight?: number;            // 무게 (g)
  distance?: number;          // 거리 (km)
  cost?: number;              // 비용 (원)
  notes?: string;             // 비고
}
```

**예시**
```typescript
const result = await trpc.logistics.fetch.useQuery({ 
  trackingNumber: "CJ123456789" 
});
console.log(result.status);      // "배송중"
console.log(result.destination); // "부산 해운대구"
```

#### logistics.list - 배송 기록 조회
저장된 배송 기록을 조회합니다.

**요청**
```typescript
const records = await trpc.logistics.list.useQuery();
```

**응답**
최대 10개의 최근 기록을 시간순으로 반환합니다.

#### logistics.save - 배송 정보 저장
배송 정보를 데이터베이스에 저장합니다.

**요청**
```typescript
await trpc.logistics.save.useMutation().mutateAsync({
  trackingNumber: "CJ123456789",
  status: "배송중",
  origin: "서울 강남구",
  destination: "부산 해운대구",
  carrier: "CJ대한통운",
  weight: 2500,
  distance: 450,
  cost: 5000,
  notes: "안전 배송 중입니다"
});
```

**응답**
```typescript
{ success: true }
```

---

### 3. 에너지 API (energy)

#### energy.fetch - 에너지 데이터 조회
시설의 에너지 사용 정보를 조회합니다.

**요청**
```typescript
const energyData = await trpc.energy.fetch.useQuery({ 
  facility: "본사빌딩" 
});
```

**응답**
```typescript
{
  facility: string;           // 시설명
  energyType: string;         // 에너지 종류 (전기, 가스 등)
  consumption: number;        // 사용량
  cost: number;               // 비용 (원)
  efficiency?: number;        // 효율성 (%)
  carbonEmission?: number;    // 탄소 배출 (kg)
  peakUsage?: number;         // 최대 사용량
  averageUsage?: number;      // 평균 사용량
  trend?: string;             // 추세 (상승, 하강, 유지)
  notes?: string;             // 비고
  recordDate: Date;           // 기록 날짜
}
```

**예시**
```typescript
const result = await trpc.energy.fetch.useQuery({ facility: "본사빌딩" });
console.log(result.consumption);  // 1250
console.log(result.efficiency);   // 78
console.log(result.trend);        // "하강"
```

#### energy.list - 에너지 기록 조회
저장된 에너지 기록을 조회합니다.

**요청**
```typescript
const records = await trpc.energy.list.useQuery();
```

**응답**
최대 10개의 최근 기록을 시간순으로 반환합니다.

#### energy.save - 에너지 데이터 저장
에너지 정보를 데이터베이스에 저장합니다.

**요청**
```typescript
await trpc.energy.save.useMutation().mutateAsync({
  facility: "본사 빌딩",
  energyType: "전기",
  consumption: 1250,
  cost: 187500,
  efficiency: 78,
  carbonEmission: 625,
  peakUsage: 1800,
  averageUsage: 1100,
  trend: "하강",
  notes: "효율성이 개선되고 있습니다",
  recordDate: new Date()
});
```

**응답**
```typescript
{ success: true }
```

---

### 4. 인증 API (auth)

#### auth.me - 현재 사용자 정보 조회
로그인한 사용자의 정보를 조회합니다.

**요청**
```typescript
const user = await trpc.auth.me.useQuery();
```

**응답**
```typescript
{
  id: number;
  openId: string;
  name?: string;
  email?: string;
  loginMethod?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

#### auth.logout - 로그아웃
현재 세션을 종료합니다.

**요청**
```typescript
await trpc.auth.logout.useMutation().mutateAsync();
```

**응답**
```typescript
{ success: true }
```

---

## 에러 처리

모든 API는 표준 tRPC 에러 응답을 반환합니다.

```typescript
try {
  await trpc.weather.fetch.useQuery({ location: "서울" });
} catch (error) {
  if (error.code === "UNAUTHORIZED") {
    // 인증 필요
  } else if (error.code === "BAD_REQUEST") {
    // 잘못된 요청
  } else if (error.code === "INTERNAL_SERVER_ERROR") {
    // 서버 오류
  }
}
```

## 사용 예시

### React 컴포넌트에서 API 사용

```typescript
import { trpc } from "@/lib/trpc";

export function WeatherComponent() {
  const { data, isLoading, error } = trpc.weather.fetch.useQuery({ 
    location: "서울" 
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error.message}</div>;

  return (
    <div>
      <h2>{data?.location}</h2>
      <p>온도: {data?.temperature}°C</p>
      <p>습도: {data?.humidity}%</p>
    </div>
  );
}
```

### 데이터 저장

```typescript
const saveMutation = trpc.weather.save.useMutation();

async function saveWeather() {
  try {
    await saveMutation.mutateAsync({
      location: "서울",
      temperature: 15,
      humidity: 65,
      windSpeed: 12,
      condition: "맑음"
    });
    console.log("저장 완료");
  } catch (error) {
    console.error("저장 실패:", error);
  }
}
```

## 레이트 제한

현재 레이트 제한이 설정되지 않았습니다. 과도한 요청을 피해주시기 바랍니다.

## 버전 정보

- **API 버전**: 1.0.0
- **tRPC 버전**: 11.6.0
- **마지막 업데이트**: 2024년 12월

## 추가 정보

더 자세한 정보는 프로젝트 저장소의 README.md를 참고하세요.
