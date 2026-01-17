"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Bot, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LottieLoader } from "@/components/lottie-loader"

interface AIAnswer {
  id: string
  name: string
  content: string
  isComplete: boolean
}

interface SSEData {
  type: "questionId" | "answer"
  questionId?: number
  aiId?: string
  aiName?: string
  content?: string
  isComplete?: boolean
}

const AI_LOGOS: Record<string, string> = {
  "GPT-4": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png",
  ChatGPT: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png",
  GPT: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png",
  Claude: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Claude_AI_logo.svg/512px-Claude_AI_logo.svg.png",
  Gemini:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/512px-Google_Gemini_logo.svg.png",
  Perplexity:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Perplexity_AI_logo.svg/512px-Perplexity_AI_logo.svg.png",
}

const AI_COLORS: Record<string, string> = {
  "GPT-4": "from-[#10a37f] to-[#0d8c6d]",
  ChatGPT: "from-[#10a37f] to-[#0d8c6d]",
  GPT: "from-[#10a37f] to-[#0d8c6d]",
  Claude: "from-[#d97706] to-[#b45309]",
  Gemini: "from-[#4285f4] to-[#2b5797]",
  Perplexity: "from-[#20b8cd] to-[#1a9aab]",
}

export default function AnswerPage() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState("")
  const [nickname, setNickname] = useState("")
  const [answers, setAnswers] = useState<AIAnswer[]>([])
  const [questionId, setQuestionId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedNickname = sessionStorage.getItem("nickname")
    const storedPhonenumber = sessionStorage.getItem("phonenumber")
    const storedQuestion = sessionStorage.getItem("question")

    if (!storedNickname || !storedQuestion) {
      navigate("/")
      return
    }

    setNickname(storedNickname)
    setQuestion(storedQuestion)

    const encodedNickname = encodeURIComponent(storedNickname)
    const encodedPhonenumber = encodeURIComponent(storedPhonenumber || "")
    const encodedQuestion = encodeURIComponent(storedQuestion)

    const apiUrl = `/api/ai/analyze?nickname=${encodedNickname}&phonenumber=${encodedPhonenumber}&question=${encodedQuestion}`

    const eventSource = new EventSource(apiUrl)

    eventSource.onopen = () => {
      setIsConnecting(false)
    }

    eventSource.onmessage = (event) => {
      try {
        const data: SSEData = JSON.parse(event.data)

        if (data.type === "questionId" && data.questionId) {
          setQuestionId(data.questionId)
          sessionStorage.setItem("questionId", String(data.questionId))
        } else if (data.type === "answer" && data.aiId && data.aiName) {
          setAnswers((prev) => {
            const existingIndex = prev.findIndex((a) => a.id === data.aiId)

            if (existingIndex >= 0) {
              const updated = [...prev]
              updated[existingIndex] = {
                ...updated[existingIndex],
                content: updated[existingIndex].content + (data.content || ""),
                isComplete: data.isComplete || false,
              }
              return updated
            } else {
              return [
                ...prev,
                {
                  id: data.aiId!,
                  name: data.aiName!,
                  content: data.content || "",
                  isComplete: data.isComplete || false,
                },
              ]
            }
          })
        }
      } catch {
        console.error("SSE 데이터 파싱 오류")
      }
    }

    eventSource.onerror = () => {
      setError("연결이 끊어졌습니다. 페이지를 새로고침 해주세요.")
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [navigate])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [answers])

  const handleGoToReport = () => {
    if (questionId) {
      navigate(`/report?questionId=${questionId}`)
    }
  }

  const completedAnswers = answers.filter((a) => a.isComplete).length
  const allAnswersComplete = completedAnswers === 3

  // 데모용 시뮬레이션
  useEffect(() => {
    if (isConnecting) {
      const timer = setTimeout(() => {
        setIsConnecting(false)

        setQuestionId(12345)
        sessionStorage.setItem("questionId", "12345")

        setTimeout(() => {
          setAnswers([
            {
              id: "ai1",
              name: "GPT-4",
              content:
                "AI 기술은 앞으로 더욱 발전하여 인간의 삶을 편리하게 만들 것입니다. 특히 자연어 처리, 컴퓨터 비전, 로보틱스 분야에서 큰 진전이 예상됩니다. 다양한 산업에서 자동화와 최적화가 이루어질 것이며, 개인 맞춤형 서비스가 보편화될 것입니다.",
              isComplete: true,
            },
          ])
        }, 1000)

        setTimeout(() => {
          setAnswers((prev) => [
            ...prev,
            {
              id: "ai2",
              name: "Gemini",
              content:
                "AI 기술은 교육, 의료, 산업 전반에 걸쳐 혁신을 가져올 것입니다. 개인화된 서비스와 효율성 향상이 주요 트렌드가 될 것입니다. 멀티모달 AI의 발전으로 텍스트, 이미지, 음성을 통합적으로 이해하는 시스템이 보편화될 전망입니다.",
              isComplete: true,
            },
          ])
        }, 2500)

        setTimeout(() => {
          setAnswers((prev) => [
            ...prev,
            {
              id: "ai3",
              name: "Perplexity",
              content:
                "AI의 미래는 기술적 발전과 함께 윤리적 고려가 중요해질 것입니다. 인간과 AI의 협업이 핵심 키워드가 될 것으로 예상합니다. 투명성과 신뢰성 있는 AI 시스템 구축이 필수적이며, 사회적 합의를 통한 규제 프레임워크 마련이 중요합니다.",
              isComplete: true,
            },
          ])
        }, 4000)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isConnecting])

  const getAILogo = (name: string) => {
    for (const key of Object.keys(AI_LOGOS)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return AI_LOGOS[key]
      }
    }
    return null
  }

  const getAIColor = (name: string) => {
    for (const key of Object.keys(AI_COLORS)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return AI_COLORS[key]
      }
    }
    return "from-aiq-green to-aiq-green-dark"
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-aiq-gray-light to-white flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-white/80 backdrop-blur-sm animate-fade-in">
        <h1 className="text-2xl font-black text-aiq-green tracking-tight">AIQ</h1>
        <div className="flex items-center gap-2 text-sm text-aiq-gray">
          <span className="flex items-center gap-1">
            <Bot className="w-4 h-4" />
            {completedAnswers}/3 완료
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
              <p className="text-aiq-gray animate-pulse-soft">AI들이 답변을 준비하고 있어요...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center animate-fade-in">{error}</div>
          )}

          {answers.map((answer, index) => {
            const logoUrl = getAILogo(answer.name)
            const colorClass = getAIColor(answer.name)

            return (
              <div
                key={answer.id}
                className="bg-white rounded-2xl shadow-md p-5 border border-border animate-fade-in-up"
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
                    <h3 className="font-semibold text-aiq-black">{answer.name}</h3>
                    <p className="text-xs text-aiq-gray">{answer.isComplete ? "답변 완료" : "답변 중..."}</p>
                  </div>
                </div>
                <div className="text-aiq-black/80 leading-relaxed whitespace-pre-wrap">{answer.content}</div>
                {!answer.isComplete && <span className="inline-block w-2 h-4 bg-aiq-green animate-pulse-soft ml-1" />}
              </div>
            )
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
              AIQ가 답변을 분석해드릴까요?
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
