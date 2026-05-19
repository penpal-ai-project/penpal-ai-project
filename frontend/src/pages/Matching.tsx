import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, Sparkles, Users, Brain, Hash, BarChart3, Zap } from "lucide-react";
import EmotionBadge from "@/components/EmotionBadge";
import { getMatches, getTraitLabel, type MatchResponse, type SavedLetterAnalysis, type Trait } from "../api";

const analysisSteps = [
  { text: "편지를 읽고 있어요...", icon: Brain },
  { text: "감정을 분석하고 있어요...", icon: Heart },
  { text: "키워드를 추출하고 있어요...", icon: Hash },
  { text: "사용자 벡터를 생성 중이에요...", icon: BarChart3 },
  { text: "비슷한 마음을 찾고 있어요...", icon: Users },
  { text: "마음이 연결되었어요!", icon: Sparkles },
];

const mockKeywords: Trait[] = ["위로", "일상", "고독", "자기성찰", "감사"];

const Matching = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const analysis = (location.state as any)?.analysis as SavedLetterAnalysis | undefined;
  const emotions = analysis?.emotion_label ? [analysis.emotion_label] : ["따뜻함", "그리움"];
  const traits = analysis?.traits?.slice(0, 5) || mockKeywords;

  const handleLoadMatches = async () => {
    setMatchLoading(true);
    setMatchError(null);

    try {
      const savedUserId = localStorage.getItem("user_id") ?? (() => {
        const savedUser = localStorage.getItem("maeum-user");
        return savedUser ? String(JSON.parse(savedUser).user_id ?? "") : null;
      })();

      if (!savedUserId) {
        setMatchError("로그인된 사용자 정보가 없습니다.");
        return;
      }

      console.log("matching 요청 user_id:", savedUserId);

      const result = await getMatches(Number(savedUserId));
      const matches = Array.isArray(result) ? result : result.matches ?? [];

      console.log("Match full response:", result);
      console.log("Match debug message:", Array.isArray(result) ? undefined : result.debug_message);
      console.log("Match result:", matches);

      setMatchResult(Array.isArray(result) ? {
        target_user_id: Number(savedUserId),
        matching_base: "user_profiles",
        target_letter_count: 0,
        preferred_gender: "",
        excluded_user_ids: [],
        matches
      } : {
        ...result,
        matches
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "매칭 결과 조회 실패";
      setMatchError(message);
      console.error(error);
    } finally {
      setMatchLoading(false);
    }
  };

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 2400),
      setTimeout(() => setStep(3), 3600),
      setTimeout(() => setStep(4), 4800),
      setTimeout(() => setStep(5), 6000),
      setTimeout(() => setShowResult(true), 7000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
      <div className="container mx-auto px-6 max-w-lg text-center">
        {!showResult ? (
          <div className="space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-4 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
              <div className="absolute inset-0 rounded-full bg-primary/5 flex items-center justify-center">
                {(() => {
                  const StepIcon = analysisSteps[step]?.icon || Sparkles;
                  return <StepIcon className="w-10 h-10 text-primary animate-pulse-soft" />;
                })()}
              </div>
            </div>
            <div className="space-y-3">
              {analysisSteps.map(({ text, icon: Icon }, i) => (
                <div key={i} className={`flex items-center justify-center gap-2 transition-all duration-500 ${i <= step ? "opacity-100" : "opacity-0"} ${i === step ? "scale-105" : "scale-100"}`}>
                  <Icon className={`w-4 h-4 ${i <= step ? "text-primary" : "text-muted-foreground/30"}`} />
                  <p className={`font-body text-sm ${i < step ? "text-muted-foreground" : i === step ? "text-foreground font-medium" : "text-muted-foreground/30"}`}>
                    {i < step && "✓ "}{text}
                  </p>
                </div>
              ))}
            </div>
            <div className="w-full max-w-xs mx-auto h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${((step + 1) / analysisSteps.length) * 100}%` }} />
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeInUp 0.6s ease-out forwards" }}>
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">마음이 연결되었어요</h2>
            <p className="font-body text-muted-foreground mb-6">AI가 당신의 편지를 분석하여<br />비슷한 감정의 사람들을 찾았습니다</p>

            {/* AI Analysis Result */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-4 text-left">
              <p className="font-body text-xs text-muted-foreground mb-3 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> AI 감정 분석 결과</p>
              <div className="flex flex-wrap gap-2 mb-4">{emotions.map((e: string) => <EmotionBadge key={e} emotion={e} />)}</div>
              <p className="font-body text-xs text-muted-foreground mb-2">추출된 키워드</p>
              <div className="flex flex-wrap gap-1.5">
                {traits.map((kw, index) => {
                  const label = getTraitLabel(kw);

                  return (
                    <span key={`${label}-${index}`} className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-body text-xs">
                      #{label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Matched Users (max 3) */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-4 text-left">
              <p className="font-body text-xs text-muted-foreground mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> AI 자동 매칭 결과 (최대 3명)</p>
              <button
                onClick={handleLoadMatches}
                disabled={matchLoading}
                className="w-full mb-4 bg-primary text-primary-foreground py-3 rounded-xl font-body text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {matchLoading ? "매칭 결과 불러오는 중..." : "매칭 결과 불러오기"}
              </button>
              {matchError && <p className="font-body text-xs text-destructive mb-3">{matchError}</p>}
              {matchResult && (
                <div className="space-y-3">
                  {matchResult.matches.length === 0 ? (
                    <p className="font-body text-sm text-muted-foreground">{matchResult.debug_message || "추천된 매칭 결과가 아직 없습니다."}</p>
                  ) : (
                    matchResult.matches.map((m) => (
                      <div key={m.user_id} className="p-3 rounded-xl bg-secondary/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-body text-sm font-medium text-foreground">추천 사용자 #{m.user_id}</p>
                          <p className="font-body text-lg font-bold text-primary">{Math.round(m.final_score * 100)}%</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-accent" />
                          <p className="font-body text-[10px] text-muted-foreground">
                            matched_traits: {m.matched_traits.length > 0 ? m.matched_traits.map(getTraitLabel).join(", ") : "없음"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 mb-8">
              <p className="font-body text-sm text-muted-foreground">
                📬 매칭된 펜팔에게 편지가 전달되었어요.<br />보통 24시간 안에 답장이 도착합니다.
              </p>
            </div>

            <button onClick={() => navigate("/letters")} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-body font-medium hover:opacity-90 transition-opacity">
              편지함 확인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matching;
