import { useState } from "react";
import { BarChart3, Music, StickyNote, TrendingUp } from "lucide-react";
import EmotionBadge from "@/components/EmotionBadge";

const archiveData = [
  {
    month: "2026년 4월",
    entries: [
      { date: "4월 7일", emotions: ["평온함", "감사"], snippet: "오늘은 작은 것들이 특별하게 느껴진 하루...", memo: "좋은 하루였다", music: { title: "봄날", artist: "BTS" } },
      { date: "4월 5일", emotions: ["따뜻함"], snippet: "답장을 받고 마음이 따뜻해졌다...", memo: "", music: { title: "밤편지", artist: "아이유" } },
      { date: "4월 3일", emotions: ["그리움", "평온함"], snippet: "고요한 하루, 예전 생각이 났다...", memo: "다시 읽어보고 싶은 편지", music: null },
    ],
  },
  {
    month: "2026년 3월",
    entries: [
      { date: "3월 28일", emotions: ["기쁨"], snippet: "오랜만에 기분 좋은 소식을 들었다...", memo: "", music: { title: "좋은 날", artist: "아이유" } },
      { date: "3월 20일", emotions: ["외로움", "슬픔"], snippet: "혼자인 저녁, 조용히 글을 적어본다...", memo: "이때 힘들었지만 지금은 괜찮다", music: null },
      { date: "3월 15일", emotions: ["불안"], snippet: "앞으로의 일들이 걱정되는 밤...", memo: "", music: null },
    ],
  },
];

const emotionTrend = [
  { week: "3월 2주", emotions: { "평온함": 1, "슬픔": 2, "불안": 1 } },
  { week: "3월 3주", emotions: { "외로움": 1, "슬픔": 1 } },
  { week: "3월 4주", emotions: { "기쁨": 2, "따뜻함": 1 } },
  { week: "4월 1주", emotions: { "평온함": 2, "감사": 1, "그리움": 1, "따뜻함": 2 } },
];

const emotionColors: Record<string, string> = {
  "따뜻함": "bg-[hsl(var(--emotion-warm))]",
  "평온함": "bg-[hsl(var(--emotion-calm))]",
  "기쁨": "bg-[hsl(var(--emotion-joy))]",
  "슬픔": "bg-[hsl(var(--emotion-sad))]",
  "불안": "bg-[hsl(var(--emotion-anxious))]",
  "그리움": "bg-primary/60",
  "감사": "bg-accent/60",
  "외로움": "bg-muted-foreground/40",
};

const Archive = () => {
  const [memos, setMemos] = useState<Record<string, string>>(
    Object.fromEntries(archiveData.flatMap(m => m.entries.map((e, i) => [`${m.month}-${i}`, e.memo])))
  );
  const [editingMemo, setEditingMemo] = useState<string | null>(null);

  const maxBarValue = Math.max(...emotionTrend.map(w => Object.values(w.emotions).reduce((a, b) => a + b, 0)));

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">감정 기록</h1>
        <p className="font-body text-muted-foreground mb-10">편지에 담긴 나의 감정 아카이브</p>

        {/* Emotion summary */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <p className="font-body text-sm font-medium text-foreground mb-4">최근 30일 감정 분포</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { emotion: "평온함", count: 5 },
              { emotion: "그리움", count: 3 },
              { emotion: "기쁨", count: 2 },
              { emotion: "따뜻함", count: 4 },
            ].map(({ emotion, count }) => (
              <div key={emotion} className="text-center">
                <div className="text-2xl font-letter font-bold text-foreground mb-1">{count}</div>
                <EmotionBadge emotion={emotion} />
              </div>
            ))}
          </div>
        </div>

        {/* Emotion Trend Graph */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="font-body text-sm font-medium text-foreground">감정 변화 그래프</p>
          </div>
          <div className="flex items-end gap-3 h-32">
            {emotionTrend.map((week) => {
              const total = Object.values(week.emotions).reduce((a, b) => a + b, 0);
              const entries = Object.entries(week.emotions);
              return (
                <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: `${(total / maxBarValue) * 100}%`, minHeight: "8px" }}>
                    {entries.map(([emotion, count]) => (
                      <div
                        key={emotion}
                        className={`w-full rounded-sm ${emotionColors[emotion] || "bg-muted"}`}
                        style={{ height: `${(count / total) * 100}%`, minHeight: "4px" }}
                        title={`${emotion}: ${count}`}
                      />
                    ))}
                  </div>
                  <span className="font-body text-[9px] text-muted-foreground text-center leading-tight">{week.week}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(emotionColors).slice(0, 6).map(([emotion, colorClass]) => (
              <div key={emotion} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${colorClass}`} />
                <span className="font-body text-[10px] text-muted-foreground">{emotion}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-10">
          {archiveData.map(({ month, entries }) => (
            <div key={month}>
              <h2 className="text-xl font-bold mb-4 text-foreground">{month}</h2>
              <div className="space-y-3">
                {entries.map(({ date, emotions, snippet, music }, i) => {
                  const memoKey = `${month}-${i}`;
                  return (
                    <div
                      key={i}
                      className="relative pl-6 border-l-2 border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-primary/60" />
                      <div className="bg-card rounded-xl p-4 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-body text-xs text-muted-foreground">{date}</span>
                          <div className="flex gap-1">
                            {emotions.map((e) => (
                              <EmotionBadge key={e} emotion={e} />
                            ))}
                          </div>
                        </div>
                        <p className="font-letter text-sm text-foreground mb-2">{snippet}</p>

                        {/* Music recommendation */}
                        {music && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <Music className="w-3 h-3 text-accent" />
                            <span className="font-body text-[10px] text-muted-foreground">
                              {music.title} - {music.artist}
                            </span>
                          </div>
                        )}

                        {/* Personal memo */}
                        <div className="mt-2">
                          {editingMemo === memoKey ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={memos[memoKey] || ""}
                                onChange={(e) => setMemos({ ...memos, [memoKey]: e.target.value })}
                                placeholder="메모를 입력하세요..."
                                className="flex-1 px-2 py-1 rounded border border-input bg-background font-body text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                              />
                              <button
                                onClick={() => setEditingMemo(null)}
                                className="px-2 py-1 rounded bg-primary text-primary-foreground font-body text-xs"
                              >
                                저장
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingMemo(memoKey)}
                              className="flex items-center gap-1 font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <StickyNote className="w-3 h-3" />
                              {memos[memoKey] ? `📝 ${memos[memoKey]}` : "메모 추가"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Archive;
