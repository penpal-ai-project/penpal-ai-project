import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles } from "lucide-react";
import EmotionBadge from "@/components/EmotionBadge";
import LetterPaperSelector, { getPaperClasses, type PaperStyle } from "@/components/LetterPaperSelector";
import AIWritingAssistant from "@/components/AIWritingAssistant";
import { saveLetter } from "../api";

const WriteLetter = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [paperStyle, setPaperStyle] = useState<PaperStyle>("default");


  const paperClasses = getPaperClasses(paperStyle);

  
  const handleSubmit = async () => {
  if (content.trim().length < 10) return;

  try {
    const user = JSON.parse(localStorage.getItem("maeum-user"));
    const result = await saveLetter(user.user_id, 2, content);

    console.log("감정 분석 결과:", result);
    
    alert("편지가 저장되었습니다.");

    navigate("/matching", {
      state: {
        content,
        paperStyle,
        analysis: result,
      },
    });
  } catch (error) {
    console.error(error);
    alert("편지 저장에 실패했습니다.");
  }
};

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">오늘의 마음을 적어보세요</h1>
          <p className="font-body text-muted-foreground">
            솔직한 감정일수록, 더 깊은 연결이 만들어집니다
          </p>
        </div>


        {/* Paper Selector */}
        <div className="mb-8">
          <LetterPaperSelector selected={paperStyle} onSelect={setPaperStyle} />
        </div>

        {/* Letter Area */}
        <div className={`rounded-2xl p-8 border shadow-sm mb-6 ${paperClasses.paper}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className={`${paperClasses.font} text-sm opacity-60 ${paperClasses.text}`}>Dear. 나에게,</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 하루는 어땠나요? 마음속에 떠오르는 것들을 자유롭게 적어보세요..."
            className={`w-full min-h-[300px] bg-transparent ${paperClasses.font} ${paperClasses.text} leading-[32px] resize-none focus:outline-none ${paperClasses.placeholder}`}
            style={{ lineHeight: "32px" }}
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <span className="font-body text-xs text-muted-foreground">{content.length}자</span>
            <span className={`${paperClasses.font} text-sm opacity-60 ${paperClasses.text}`}>
              {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* AI Writing Assistant */}

        {/* AI analysis hint */}
        <div className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border mb-8">
          <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-body text-sm font-medium text-foreground mb-1">AI 감정 분석 & 자동 매칭</p>
            <p className="font-body text-xs text-muted-foreground">
              작성한 편지를 AI가 분석하여 감정·키워드·성향을 파악하고, 최대 3명의 비슷한 마음을 가진 사람과 자동으로 매칭해 드립니다.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={content.trim().length < 10}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-body font-medium text-base disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          <Send className="w-5 h-5" />
          편지 보내기
        </button>
      </div>
    </div>
  );
};

export default WriteLetter;
