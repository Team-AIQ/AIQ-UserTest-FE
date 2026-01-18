"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChevronDown, AlertCircle } from "lucide-react";
import { LottieLoader } from "@/components/lottie-loader";

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 중복 호출 방지를 위한 Ref
  const isFetched = useRef(false);

  useEffect(() => {
    // StrictMode로 인한 중복 호출 방지
    if (isFetched.current) return;

    const questionId =
      searchParams.get("questionId") || sessionStorage.getItem("questionId");

    if (!questionId) {
      router.push("/");
      return;
    }

    const fetchReport = async () => {
      try {
        isFetched.current = true; // 호출 시작 기록

        const response = await api.post(
          `http://localhost:8080/api/ai/synthesize/${questionId}`
        );

        // 백엔드가 String으로 주든, {report: ""}로 주든 모두 대응
        const data =
          typeof response.data === "string"
            ? response.data
            : response.data.report || response.data.content || "";

        if (!data) {
          throw new Error("보고서 내용이 비어있습니다.");
        }

        setReport(data);
      } catch (err) {
        console.error("보고서 요청 오류:", err);
        setError("AIQ 보고서를 생성하는 중 오류가 발생했습니다.");
        isFetched.current = false; // 에러 시 재시도 가능하도록 초기화
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [router, searchParams]);

  const handleNextClick = () => {
    router.push("/feedback");
  };

  // --- 구분자로 섹션 나누기
  const sections = report.split("---").map((s) => s.trim());
  const firstSection = sections[0] || "";
  const secondSection = sections[1] || "";

  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      const trimmed = line.trim();

      // 1️⃣ AI 모델 카드 (가장 먼저 처리)
      if (
        trimmed.startsWith("GPT:") ||
        trimmed.startsWith("Gemini:") ||
        trimmed.startsWith("Perplexity:")
      ) {
        const [model, ...rest] = trimmed.split(":");
        const desc = rest.join(":").trim();

        const colorMap: Record<string, string> = {
          GPT: "bg-blue-50 text-blue-700 border-blue-200",
          Gemini: "bg-purple-50 text-purple-700 border-purple-200",
          Perplexity: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };

        return (
          <div
            key={i}
            className={`border rounded-xl p-4 my-4 ${colorMap[model]}`}
          >
            <div className="font-bold mb-1">{model}</div>
            <div className="text-sm leading-relaxed">{parseBold(desc)}</div>
          </div>
        );
      }

      // 2️⃣ H1 : # 제목 (문서 타이틀)
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={i} className="text-lg font-extrabold mt-4 text-aiq-black">
            {trimmed.replace(/^#\s*/, "")}
          </h1>
        );
      }

      // 3️⃣ H2 : ## 제목 (섹션 제목)
      if (trimmed.startsWith("## ")) {
        return (
          <h2
            key={i}
            className="text-base font-bold mt-10 mb-3 text-aiq-gray-dark"
          >
            {trimmed.replace(/^##\s*/, "")}
          </h2>
        );
      }

      // 4️⃣ H3 : ### 제목 (포인트 소제목 - 초록)
      if (trimmed.startsWith("### ")) {
        return (
          <h3
            key={i}
            className="text-sm font-bold mt-5 mb-2 text-aiq-green border-b border-aiq-green/10 pb-1"
          >
            {trimmed.replace(/^###\s*/, "")}
          </h3>
        );
      }

      // 5️⃣ H4 : #### 제목 (설명용 소제목)
      if (trimmed.startsWith("#### ")) {
        return (
          <h4
            key={i}
            className="text-sm font-semibold mt-4 mb-2 text-aiq-black"
          >
            {trimmed.replace(/^####\s*/, "")}
          </h4>
        );
      }

      // 6️⃣ "필수 스펙" 전용 처리 (공백 / # 있어도 잡힘)
      if (trimmed.replace(/#/g, "") === "필수 스펙") {
        return (
          <div
            key={i}
            className="mt-6 mb-2 text-aiq-gray-dark font-bold text-sm tracking-wide"
          >
            필수 스펙
          </div>
        );
      }

      // 7️⃣ 리스트 항목 (-, 1. 등)
      if (trimmed.startsWith("- ") || /^\d+\./.test(trimmed)) {
        return (
          <div key={i} className="flex gap-2 ml-1 my-1.5">
            <span className="text-aiq-gray-dark">•</span>
            <span className="flex-1 text-aiq-gray-dark">
              {parseBold(trimmed.replace(/^- |\d+\. /, ""))}
            </span>
          </div>
        );
      }

      // 8️⃣ 일반 문장
      return trimmed ? (
        <div key={i} className="my-2 leading-relaxed">
          {parseBold(trimmed)}
        </div>
      ) : (
        <div key={i} className="h-2" />
      );
    });
  };

  // 볼드체(**) 처리 함수
  const parseBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, j) =>
      j % 2 === 1 ? (
        <strong
          key={j}
          className="text-aiq-green font-semibold bg-aiq-green/10 px-1.5 py-0.5 rounded-md"
        >
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-aiq-gray-light to-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-white/80 backdrop-blur-sm">
        <h1 className="text-2xl font-black text-aiq-green tracking-tight">
          AIQ
        </h1>
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 bg-aiq-green/10 text-aiq-green rounded-full">
          AI 분석 완료
        </div>
      </header>

      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <LottieLoader size={120} />
              <p className="mt-6 text-aiq-gray font-medium animate-pulse">
                3개 모델의 답변을 통합하여 보고서를 쓰고 있어요...
              </p>
            </div>
          ) : error ? (
            <div className="bg-destructive/5 text-destructive border border-destructive/20 p-6 rounded-2xl text-center flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              <p className="font-medium">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                다시 시도
              </Button>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              {/* 리포트 카드 디자인 */}
              <div className="bg-white rounded-3xl shadow-xl shadow-aiq-green/5 border border-aiq-green/20 overflow-hidden">
                <div className="bg-aiq-green p-6 text-white flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center p-1 shadow-inner">
                    <img
                      src="/images/aiq-character.png"
                      alt="AIQ"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AIQ 통합 보고서</h3>
                    <p className="text-aiq-green-light text-sm opacity-90">
                      GPT, Gemini, Perplexity 종합 분석
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* 섹션 1 */}
                  <div className="prose prose-sm max-w-none text-aiq-black/80">
                    {renderMarkdown(firstSection)}
                  </div>

                  {/* 구분선 (두 번째 섹션이 있을 때만) */}
                  {secondSection && (
                    <div className="border-t border-dashed border-aiq-green/20 my-8" />
                  )}

                  {/* 섹션 2 */}
                  {secondSection && (
                    <div className="prose prose-sm max-w-none text-aiq-black/80">
                      {renderMarkdown(secondSection)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Button */}
      {!isLoading && !error && (
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent p-6 pt-10">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-aiq-gray text-sm">
              <ChevronDown className="w-4 h-4 animate-bounce" />
              <span>추천 결과에 만족하시나요?</span>
            </div>
            <Button
              onClick={handleNextClick}
              className="w-full h-15 bg-aiq-green hover:bg-aiq-green-dark text-white font-bold rounded-2xl text-lg shadow-lg shadow-aiq-green/20"
            >
              다음 단계로
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
