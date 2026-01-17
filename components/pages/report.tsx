"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { LottieLoader } from "@/components/lottie-loader";

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const questionId =
        searchParams.get("questionId") || sessionStorage.getItem("questionId");

      if (!questionId) {
        router.push("/");
        return;
      }

      const fetchReport = async () => {
        try {
          const response = await api.post(
            `http://localhost:8080/api/ai/synthesize/${questionId}`
          );

          setReport(response.data.report || response.data.content || "");
          setIsLoading(false);
        } catch (err) {
          console.error("보고서 요청 오류:", err);
          setError("보고서를 불러오지 못했습니다.");
          setIsLoading(false);
        }
      };

      fetchReport();
    }
  }, [router, searchParams]);

  const handleNextClick = () => {
    router.push("/feedback");
  };

  // --- 기준으로 나눔 (안전하게)
  const sections = report.split("---");
  const firstSection = sections[0] || "";
  const secondSection = sections[1] || "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-aiq-gray-light to-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-white/80 backdrop-blur-sm animate-fade-in">
        <h1 className="text-2xl font-black text-aiq-green tracking-tight">
          AIQ
        </h1>
        <div className="flex items-center gap-2 text-sm text-aiq-gray">
          AI 합의점 보고서
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            /* =======================
         로딩 상태
      ======================= */
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              <div className="mb-4">
                <LottieLoader size={100} />
              </div>
              <p className="text-aiq-gray animate-pulse-soft">
                AIQ가 보고서를 작성하고 있어요...
              </p>
            </div>
          ) : error ? (
            /* =======================
         에러 상태
      ======================= */
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center animate-fade-in">
              {error}
            </div>
          ) : (
            /* =======================
         정상 보고서 화면
      ======================= */
            <div className="bg-gradient-to-br from-aiq-green-light to-white rounded-2xl shadow-lg p-5 border-2 border-aiq-green/30 animate-fade-in-up">
              {/* 헤더 영역 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-aiq-green/30 flex items-center justify-center overflow-hidden p-1">
                  <img
                    src="/images/aiq-character.png"
                    alt="AIQ Character"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-aiq-black">
                    AIQ 합의점 보고서
                  </h3>
                  <p className="text-xs text-aiq-gray">
                    AIQ가 분석한 결과입니다
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* =======================
             첫 번째 박스
             (항상 존재)
          ======================= */}
                <div className="bg-white rounded-xl p-4 border border-aiq-green/20">
                  <div className="prose prose-sm max-w-none text-aiq-black/80">
                    {firstSection.split("\n").map((line, i) => {
                      if (line.startsWith("### ")) {
                        return (
                          <h3
                            key={i}
                            className="text-base font-bold mt-4 mb-2 text-aiq-green"
                          >
                            {line.replace("### ", "")}
                          </h3>
                        );
                      }

                      if (line.startsWith("- ") || line.match(/^\d+\./)) {
                        return (
                          <p key={i} className="ml-4 my-1">
                            {line}
                          </p>
                        );
                      }

                      if (line.includes("**")) {
                        const parts = line.split(/\*\*(.*?)\*\*/g);
                        return (
                          <p key={i} className="my-1">
                            {parts.map((part, j) =>
                              j % 2 === 1 ? (
                                <strong key={j}>{part}</strong>
                              ) : (
                                part
                              )
                            )}
                          </p>
                        );
                      }

                      return line ? (
                        <p key={i} className="my-1">
                          {line}
                        </p>
                      ) : (
                        <br key={i} />
                      );
                    })}
                  </div>
                </div>

                {/* =======================
             두 번째 박스
             (있을 때만 렌더)
          ======================= */}
                {secondSection && (
                  <div className="bg-white rounded-xl p-4 border border-aiq-green/20">
                    <div className="prose prose-sm max-w-none text-aiq-black/80">
                      {secondSection.split("\n").map((line, i) => {
                        if (line.startsWith("### ")) {
                          return (
                            <h3
                              key={i}
                              className="text-base font-bold mt-4 mb-2 text-aiq-green"
                            >
                              {line.replace("### ", "")}
                            </h3>
                          );
                        }

                        if (line.startsWith("- ") || line.match(/^\d+\./)) {
                          return (
                            <p key={i} className="ml-4 my-1">
                              {line}
                            </p>
                          );
                        }

                        if (line.includes("**")) {
                          const parts = line.split(/\*\*(.*?)\*\*/g);
                          return (
                            <p key={i} className="my-1">
                              {parts.map((part, j) =>
                                j % 2 === 1 ? (
                                  <strong key={j}>{part}</strong>
                                ) : (
                                  part
                                )
                              )}
                            </p>
                          );
                        }

                        return line ? (
                          <p key={i} className="my-1">
                            {line}
                          </p>
                        ) : (
                          <br key={i} />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Button */}
      {!isLoading && !error && (
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent p-4 pt-8 animate-fade-in-up">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-3 text-aiq-gray text-sm animate-pulse-soft">
              <ChevronDown className="w-4 h-4" />
              <span className="mx-1">보고서를 모두 확인하셨나요?</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Button
              onClick={handleNextClick}
              className="w-full h-14 bg-aiq-green hover:bg-aiq-green-dark text-white font-semibold rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
