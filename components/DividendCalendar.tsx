"use client";

import { useMemo, useState } from "react";
import { dividends, type Market } from "@/lib/dividends";

type Filter = "all" | Market;
type Sort = "exDate" | "yield";

const marketLabel: Record<Market, string> = {
  domestic: "국내",
  us: "미국",
};

const marketBadgeClass: Record<Market, string> = {
  domestic: "bg-violet-50 text-violet-700",
  us: "bg-blue-50 text-blue-700",
};

function formatDateHeader(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function formatPayDate(dateStr: string) {
  const d = new Date(dateStr);
  return `지급 ${d.getMonth() + 1}/${d.getDate()}`;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className={filled ? "text-amber-500 flex-shrink-0" : "text-neutral-300 flex-shrink-0"}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0l-4.725 2.885a.562.562 0 0 1-.84-.61l1.285-5.385a.563.563 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345l2.125-5.111Z"
      />
    </svg>
  );
}

export default function DividendCalendar() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("exDate");
  const [watched, setWatched] = useState<Set<string>>(
    new Set(dividends.filter((d) => d.watched).map((d) => d.id))
  );

  function toggleWatch(id: string) {
    setWatched((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    let list = dividends.filter((d) => filter === "all" || d.market === filter);
    list = [...list].sort((a, b) =>
      sort === "yield"
        ? b.yieldPct - a.yieldPct
        : a.exDate.localeCompare(b.exDate)
    );
    return list;
  }, [filter, sort]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const d of filtered) {
      const key = d.exDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const thisWeekCount = filtered.length;
  const avgYield =
    filtered.reduce((sum, d) => sum + d.yieldPct, 0) / (filtered.length || 1);
  const watchedCount = filtered.filter((d) => watched.has(d.id)).length;

  return (
    <div className="max-w-[680px] mx-auto py-8 px-4">
      <div className="flex gap-2 mb-4">
        {(["all", "domestic", "us"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {f === "all" ? "전체" : marketLabel[f]}
          </button>
        ))}
        <div className="flex-1" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="border border-neutral-200 rounded-lg text-sm px-3 py-2 text-neutral-600"
        >
          <option value="exDate">배당락일순</option>
          <option value="yield">수익률순</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-neutral-50 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">이번 목록 배당 예정</p>
          <p className="text-2xl font-medium">{thisWeekCount}개 종목</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">평균 배당수익률</p>
          <p className="text-2xl font-medium">{avgYield.toFixed(1)}%</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">관심종목 배당</p>
          <p className="text-2xl font-medium">{watchedCount}개</p>
        </div>
      </div>

      {grouped.map(([date, items]) => (
        <div key={date} className="mb-5">
          <p className="text-xs text-neutral-400 mb-2">{formatDateHeader(date)}</p>
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            {items.map((d, i) => (
              <div
                key={d.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i < items.length - 1 ? "border-b border-neutral-200" : ""
                }`}
              >
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-md flex-shrink-0 ${marketBadgeClass[d.market]}`}
                >
                  {marketLabel[d.market]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.name}</p>
                  <p className="text-xs text-neutral-400">{d.ticker} · 배당락일</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium">{d.yieldPct.toFixed(1)}%</p>
                  <p className="text-xs text-neutral-400">{formatPayDate(d.payDate)}</p>
                </div>
                <button
                  onClick={() => toggleWatch(d.id)}
                  aria-label={watched.has(d.id) ? "관심종목에서 제거" : "관심종목에 추가"}
                  className="flex-shrink-0"
                >
                  <StarIcon filled={watched.has(d.id)} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {grouped.length === 0 && (
        <p className="text-sm text-neutral-400 text-center py-12">
          해당 조건의 배당 일정이 없습니다.
        </p>
      )}
    </div>
  );
}
