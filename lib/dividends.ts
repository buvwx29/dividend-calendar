export type Market = "domestic" | "us";

export interface Dividend {
  id: string;
  market: Market;
  ticker: string;
  name: string;
  exDate: string; // YYYY-MM-DD
  payDate: string;
  yieldPct: number;
  watched: boolean;
}

/**
 * API Route '/api/dividends/us'에서 미국 배당 데이터 조회
 * - Finnhub API로부터 가져온 데이터를 우리 형식으로 변환
 * - 브라우저에서 호출하지만, API 키는 서버에서만 보관됨
 */
export async function getUSDividends(): Promise<Dividend[]> {
  try {
    const res = await fetch('/api/dividends/us');
    if (!res.ok) throw new Error('배당 데이터를 가져오지 못했습니다');
    return res.json();
  } catch (err) {
    console.error('배당 데이터 로딩 오류:', err);
    throw err;
  }
}

/**
 * API Route '/api/dividends/domestic'에서 국내 배당 데이터 조회
 */
export async function getDomesticDividends(): Promise<Dividend[]> {
  const res = await fetch('/api/dividends/domestic');
  if (!res.ok) throw new Error('국내 배당 데이터를 가져오지 못했습니다');
  return res.json();
}

/**
 * 국내 + 미국 배당 데이터를 한 번에 가져와서 하나로 합침
 * 화면(DividendCalendar.tsx)에서는 이 함수 하나만 호출하면 됨
 */
export async function getAllDividends(): Promise<Dividend[]> {
  // 두 API를 동시에 호출 (하나가 늦어도 서로 기다리지 않음)
  const [usResult, domesticResult] = await Promise.allSettled([
    getUSDividends(),
    getDomesticDividends(),
  ]);

  const us = usResult.status === 'fulfilled' ? usResult.value : [];
  const domestic = domesticResult.status === 'fulfilled' ? domesticResult.value : [];

  // 둘 중 하나라도 실패하면 콘솔에 로그만 남기고, 성공한 쪽 데이터는 그대로 보여줌
  if (usResult.status === 'rejected') {
    console.error('미국 배당 데이터 로딩 실패:', usResult.reason);
  }
  if (domesticResult.status === 'rejected') {
    console.error('국내 배당 데이터 로딩 실패:', domesticResult.reason);
  }

  return [...us, ...domestic].sort((a, b) => a.exDate.localeCompare(b.exDate));
}

/**
 * 목업 데이터 (테스트 또는 개발 시에만 사용)
 * 실제 서비스는 getUSDividends() + getDomesticDividends() 사용
 */
export const mockDividends: Dividend[] = [
  {
    id: "1",
    market: "us",
    ticker: "JNJ",
    name: "Johnson & Johnson",
    exDate: "2026-07-14",
    payDate: "2026-08-12",
    yieldPct: 3.1,
    watched: false,
  },
  {
    id: "2",
    market: "domestic",
    ticker: "005930",
    name: "삼성전자",
    exDate: "2026-07-14",
    payDate: "2027-04-17",
    yieldPct: 2.0,
    watched: true,
  },
  {
    id: "3",
    market: "us",
    ticker: "KO",
    name: "Coca-Cola",
    exDate: "2026-07-15",
    payDate: "2026-10-01",
    yieldPct: 2.9,
    watched: false,
  },
  {
    id: "4",
    market: "us",
    ticker: "O",
    name: "Realty Income",
    exDate: "2026-07-15",
    payDate: "2026-08-15",
    yieldPct: 5.6,
    watched: false,
  },
  {
    id: "5",
    market: "domestic",
    ticker: "000660",
    name: "SK하이닉스",
    exDate: "2026-07-16",
    payDate: "2026-08-20",
    yieldPct: 1.4,
    watched: false,
  },
  {
    id: "6",
    market: "us",
    ticker: "PG",
    name: "Procter & Gamble",
    exDate: "2026-07-18",
    payDate: "2026-08-15",
    yieldPct: 2.4,
    watched: true,
  },
  {
    id: "7",
    market: "domestic",
    ticker: "055550",
    name: "신한지주",
    exDate: "2026-07-21",
    payDate: "2026-09-10",
    yieldPct: 4.8,
    watched: false,
  },
  {
    id: "8",
    market: "us",
    ticker: "VZ",
    name: "Verizon",
    exDate: "2026-07-21",
    payDate: "2026-08-04",
    yieldPct: 6.2,
    watched: false,
  },
];
