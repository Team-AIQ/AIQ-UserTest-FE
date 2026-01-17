"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bot, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LottieLoader } from "@/components/lottie-loader";

interface AIAnswer {
  id: string;
  name: string;
  content: string;
  isComplete: boolean;
}

interface SSEData {
  type?: string;
  questionId?: number;
  model?: "GPT" | "Gemini" | "Perplexity";
  content?: string;
}

const AI_LOGOS: Record<string, string> = {
  "GPT-4":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png",
  ChatGPT:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png",
  GPT: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png",
  Claude:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Claude_AI_logo.svg/512px-Claude_AI_logo.svg.png",
  Gemini:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/512px-Google_Gemini_logo.svg.png",
  Perplexity:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Perplexity_AI_logo.svg/512px-Perplexity_AI_logo.svg.png",
};

const AI_COLORS: Record<string, string> = {
  "GPT-4": "from-[#10a37f] to-[#0d8c6d]",
  ChatGPT: "from-[#10a37f] to-[#0d8c6d]",
  GPT: "from-[#10a37f] to-[#0d8c6d]",
  Claude: "from-[#d97706] to-[#b45309]",
  Gemini: "from-[#4285f4] to-[#2b5797]",
  Perplexity: "from-[#20b8cd] to-[#1a9aab]",
};

export default function AnswerPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [nickname, setNickname] = useState("");
  const [answers, setAnswers] = useState<AIAnswer[]>([]);
  const [questionId, setQuestionId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);

  const EXPECTED_AI_COUNT = 3;
  const answerCountRef = useRef(0);

  useEffect(() => {
    const count = Number(sessionStorage.getItem("retryCount") || "0");
    setRetryCount(count);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedNickname = sessionStorage.getItem("nickname");
      const storedPhonenumber = sessionStorage.getItem("phonenumber");
      console.log("phone from storage:", storedPhonenumber);

      const storedQuestion = sessionStorage.getItem("question");

      if (!storedNickname || !storedQuestion) {
        router.push("/");
        return;
      }

      setNickname(storedNickname);
      setQuestion(storedQuestion);

      const encodedNickname = encodeURIComponent(storedNickname);
      const encodedPhonenumber = encodeURIComponent(storedPhonenumber || "");
      const encodedQuestion = encodeURIComponent(storedQuestion);

      const apiUrl = `http://localhost:8080/api/ai/analyze?nickname=${encodedNickname}&phoneNumber=${encodedPhonenumber}&question=${encodedQuestion}`;

      const eventSource = new EventSource(apiUrl);

      eventSource.onopen = () => {
        setIsConnecting(false);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SSEData;

          // 1️⃣ INIT 처리
          if (data.type === "INIT" && data.questionId) {
            setQuestionId(data.questionId);
            sessionStorage.setItem("questionId", String(data.questionId));
            return;
          }

          // 2️⃣ ANSWER 처리 (백엔드는 content만 옴)
          if (data.content && data.model) {
            setAnswers((prev) => {
              answerCountRef.current = prev.length + 1;
              return [
                ...prev,
                {
                  id: `${data.model}-${prev.length}`,
                  name: data.model,
                  content: data.content,
                  isComplete: true,
                },
              ];
            });
          }
        } catch (e) {
          console.error("SSE 파싱 오류", e);
        }
      };

      eventSource.onerror = () => {
        if (answerCountRef.current >= EXPECTED_AI_COUNT) {
          eventSource.close();
          return;
        }
        setError("연결이 끊어졌습니다. 페이지를 새로고침 해주세요.");
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [answers]);

  const handleGoToReport = () => {
    if (questionId) {
      router.push(`/report?questionId=${questionId}`);
    }
  };

  const completedAnswers = answers.filter((a) => a.isComplete).length;
  const allAnswersComplete = completedAnswers === EXPECTED_AI_COUNT;

  const getAILogo = (name: string) => {
    for (const key of Object.keys(AI_LOGOS)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return AI_LOGOS[key];
      }
    }
    return null;
  };

  const getAIColor = (name: string) => {
    for (const key of Object.keys(AI_COLORS)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return AI_COLORS[key];
      }
    }
    return "from-aiq-green to-aiq-green-dark";
  };

  const handleRetry = () => {
    const nextCount = retryCount + 1;
    sessionStorage.setItem("retryCount", String(nextCount));
    router.push("/question");
  };

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-gradient-to-b from-aiq-gray-light to-white flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-white/80 backdrop-blur-sm animate-fade-in">
          <h1 className="text-2xl font-black text-aiq-green tracking-tight">
            AIQ
          </h1>
          <div className="flex items-center gap-2 text-sm text-aiq-gray">
            <span className="flex items-center gap-1">
              <Bot className="w-4 h-4" />
              {completedAnswers}/{EXPECTED_AI_COUNT} 완료
            </span>
          </div>
        </header>

        {/* Question Display */}
        <div className="bg-white border-b border-border p-4 animate-fade-in delay-100">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-aiq-gray mb-1">{nickname}님의 질문</p>
            <p className="text-aiq-black font-medium">{question}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            {isConnecting && (
              <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                <div className="mb-4">
                  <LottieLoader size={100} />
                </div>
                <p className="text-aiq-gray animate-pulse-soft">
                  AI들이 답변을 준비하고 있어요...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center animate-fade-in">
                {error}
              </div>
            )}

            {answers.map((answer, index) => {
              const logoUrl = getAILogo(answer.name);
              const colorClass = getAIColor(answer.name);
              const truncatedContent =
                answer.content.length > 200
                  ? answer.content.slice(0, 200) + "..."
                  : answer.content;

              return (
                <Dialog key={answer.id}>
                  <DialogTrigger asChild>
                    <div
                      className="bg-white rounded-2xl shadow-md p-5 border border-border animate-fade-in-up cursor-pointer hover:shadow-lg transition-shadow"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {logoUrl ? (
                          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden p-1.5">
                            <img
                              src={logoUrl || "/placeholder.svg"}
                              alt={`${answer.name} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold`}
                          >
                            {index + 1}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-aiq-black">
                            {answer.name}
                          </h3>
                          <p className="text-xs text-aiq-gray">
                            {answer.isComplete ? "답변 완료" : "답변 중..."}
                          </p>
                        </div>
                      </div>
                      <div className="text-aiq-black/80 leading-relaxed whitespace-pre-wrap">
                        {truncatedContent}
                      </div>
                      {answer.content.length > 200 && (
                        <p className="text-aiq-green text-sm mt-2 font-medium">
                          더 보기...
                        </p>
                      )}
                      {!answer.isComplete && (
                        <span className="inline-block w-2 h-4 bg-aiq-green animate-pulse-soft ml-1" />
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        {logoUrl ? (
                          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden p-1.5">
                            <img
                              src={logoUrl || "/placeholder.svg"}
                              alt={`${answer.name} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold`}
                          >
                            {index + 1}
                          </div>
                        )}
                        {answer.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="text-aiq-black/80 leading-relaxed whitespace-pre-wrap mt-4">
                      {answer.content}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}

            <div ref={bottomRef} />
          </div>
        </div>

        {allAnswersComplete && (
          <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent p-4 pt-8 animate-fade-in-up">
            <div className="max-w-3xl mx-auto">
              <Button
                onClick={handleGoToReport}
                className="w-full h-14 bg-gradient-to-r from-aiq-green to-aiq-green-dark hover:from-aiq-green-dark hover:to-aiq-green text-white font-semibold rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                AIQ가 합의점을 기반으로 최적의 제품을 선택해 뒀어요! 보러가기
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Re-ask Button */}
      {allAnswersComplete && retryCount === 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleRetry} />
          </TooltipTrigger>
          <TooltipContent>
            <p>1번 더 재질문 할 수 있어요!</p>
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipProvider>
  );
}
