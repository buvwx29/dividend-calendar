import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 회사 정보 매핑 (이름 + 대략적인 배당 수익률)
// 티커 개수를 줄인 이유: Alpha Vantage 무료 티어는 하루 25회 호출 제한
const companyInfo: Record<string, { name: string; yield: number }> = {
  AAPL: { name: 'Apple Inc.', yield: 4.2 },
  KO: { name: 'Coca-Cola', yield: 2.9 },
  JNJ: { name: 'Johnson & Johnson', yield: 3.1 },
  O: { name: 'Realty Income', yield: 5.6 },
  VZ: { name: 'Verizon', yield: 6.2 },
};

// 캐시를 파일로 저장 (서버를 껐다 켜도 유지됨)
const CACHE_FILE = path.join(process.cwd(), '.cache-us-dividends.json');
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12시간

function readCache(): { data: any[]; timestamp: number } | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(data: any[]) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (err) {
    console.error('캐시 파일 저장 실패:', err);
  }
}

export async function GET() {
  try {
    // 캐시 파일이 있고, 아직 유효 기간 안이면 API 호출 없이 바로 반환
    const cache = readCache();
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json(cache.data);
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다. .env.local의 ALPHA_VANTAGE_API_KEY를 확인하세요.' },
        { status: 500 }
      );
    }

    const tickers = Object.keys(companyInfo);
    const today = new Date();
    const threeMonthsLater = new Date(
      today.getFullYear(),
      today.getMonth() + 3,
      today.getDate()
    );

    // 순서대로 하나씩 호출 (Alpha Vantage는 호출량이 적어서 Promise.all보다 순차 호출이 안전)
    const allDividends: any[] = [];

    for (const symbol of tickers) {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=DIVIDENDS&symbol=${symbol}&apikey=${apiKey}`
      );
      const json = await res.json();

      // data가 없으면 원인을 콘솔에 남김 (호출 제한 초과, 잘못된 심볼 등)
      if (!Array.isArray(json.data)) {
        console.warn(`[${symbol}] 배당 데이터 없음, 응답:`, json);
      }

      // Alpha Vantage 응답 형태: { symbol: "AAPL", data: [{ ex_dividend_date, payment_date, amount, ... }] }
      const records = Array.isArray(json.data) ? json.data : [];

      const upcoming = records.filter((r: any) => {
        const exDate = new Date(r.ex_dividend_date);
        return exDate >= today && exDate <= threeMonthsLater;
      });

      upcoming.forEach((r: any, idx: number) => {
        allDividends.push({
          id: `${symbol}-${r.ex_dividend_date}-${idx}`,
          market: 'us' as const,
          ticker: symbol,
          name: companyInfo[symbol]?.name || symbol,
          exDate: r.ex_dividend_date,
          payDate: r.payment_date || r.ex_dividend_date,
          yieldPct: companyInfo[symbol]?.yield ?? 2.5,
          watched: false,
        });
      });
    }

    allDividends.sort((a, b) => a.exDate.localeCompare(b.exDate));

    // 전부 실패해서 빈 배열이면, 기존 캐시(만료됐어도)를 그대로 유지해서 반환
    // (호출 제한 때문에 화면이 텅 비는 것보다, 오래된 데이터라도 보여주는 게 나음)
    if (allDividends.length === 0 && cache) {
      console.warn('오늘 API 호출이 모두 실패해서, 이전 캐시 데이터를 대신 반환합니다.');
      return NextResponse.json(cache.data);
    }

    // 결과를 캐시 파일에 저장
    writeCache(allDividends);

    return NextResponse.json(allDividends);
  } catch (error) {
    console.error('배당 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}