import { NextResponse } from 'next/server';

// 조회할 국내 회사 목록 (법인등록번호 + 티커 + 대략적인 배당수익률)
// crno(법인등록번호)로 조회하는 게 회사명보다 훨씬 안정적 (표기 차이 문제 없음)
// 신한지주 등 추가 회사는 법인등록번호 확인되는 대로 추가 예정
const companyInfo: Record<string, { name: string; ticker: string; yield: number }> = {
  '1301110006246': { name: '삼성전자', ticker: '005930', yield: 2.0 },
  '1344110001387': { name: 'SK하이닉스', ticker: '000660', yield: 1.4 },
};

// YYYYMMDD -> YYYY-MM-DD 변환
function formatDate(raw: string): string {
  if (!raw || raw.length !== 8) return '';
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

export async function GET() {
  try {
    const serviceKey = process.env.DATA_GO_KR_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { error: '.env.local에 DATA_GO_KR_KEY가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    const crnos = Object.keys(companyInfo);
    const allDividends: any[] = [];

    for (const crno of crnos) {
      const url =
        `http://apis.data.go.kr/1160100/GetStocDiviInfoService_V2/getDiviInfo_V2` +
        `?serviceKey=${serviceKey}` +
        `&numOfRows=200` + // 전체 이력을 한 번에 받아서, 우리가 직접 최신순 정렬
        `&pageNo=1` +
        `&resultType=json` +
        `&crno=${crno}`;

      const res = await fetch(url);
      const json = await res.json();

      const rawItems = json?.response?.body?.items?.item;
      // 결과가 1건이면 배열이 아니라 객체로 오는 경우가 있어서 방어적으로 처리
      const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

      if (items.length === 0) continue;

      // 현금배당(stckDvdnRcd === "02")만 필터링 후, 배당기준일자 최신순 정렬
      const cashDividends = items
        .filter((item: any) => item.stckDvdnRcd === '02' && item.dvdnBasDt)
        .sort((a: any, b: any) => b.dvdnBasDt.localeCompare(a.dvdnBasDt));

      const latest = cashDividends[0];
      if (!latest) continue;

      const info = companyInfo[crno];
      allDividends.push({
        id: `${info.ticker}-${latest.dvdnBasDt}`,
        market: 'domestic' as const,
        ticker: info.ticker,
        name: info.name,
        exDate: formatDate(latest.dvdnBasDt), // 정확히는 "배당기준일자" (배당락일과 근사치)
        payDate: formatDate(latest.cashDvdnPayDt) || formatDate(latest.dvdnBasDt),
        yieldPct: info.yield,
        watched: false,
      });
    }

    allDividends.sort((a, b) => a.exDate.localeCompare(b.exDate));

    return NextResponse.json(allDividends);
  } catch (error) {
    console.error('국내 배당 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

