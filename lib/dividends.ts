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

export const dividends: Dividend[] = [
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
