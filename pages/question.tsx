"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { LottieLoader } from "@/components/lottie-loader"

export default function QuestionPage() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState("")
  const [nickname, setNickname] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const storedNickname = sessionStorage.getItem("nickname")
    if (!storedNickname) {
      navigate("/")
      return
    }
    setNickname(storedNickname)
  }, [navigate])

  const handleSubmit = () => {
    if (!question.trim()) return

    setIsLoading(true)
    sessionStorage.setItem("question", question)
    navigate("/answer")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-aiq-gray-light to-white flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border bg-white/80 backdrop-blur-sm animate-fade-in">
        <h1 className="text-2xl font-black text-aiq-green tracking-tight">AIQ</h1>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-aiq-green flex items-center justify-center text-white text-sm font-medium">
            {nickname.charAt(0)}
          </div>
          <span className="text-sm text-aiq-gray">{nickname}님</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-6 animate-fade-in-up">
          <img
            src="/images/aiq-character.png"
            alt="AIQ Character"
            className="w-36 h-auto object-contain drop-shadow-lg animate-float"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full mb-6 relative animate-fade-in-up delay-100">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white" />
          <h1 className="text-xl font-bold text-aiq-black text-center mb-2">무엇이든 물어보세요!</h1>
          <p className="text-aiq-gray text-center text-sm">
            3개의 AI가 여러분의 질문에 답변하고, 합의점을 정리해드립니다.
          </p>
        </div>

        <div className="w-full max-w-md animate-fade-in-up delay-200">
          <div className="bg-white rounded-2xl shadow-xl p-4 border border-border transition-all duration-300 focus-within:shadow-2xl focus-within:border-aiq-green/30">
            <Textarea
              placeholder="예: 200만원대 업무용 노트북 추천해주세요"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[120px] border-0 resize-none focus:ring-0 focus-visible:ring-0 text-base transition-all duration-300"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-xs text-aiq-gray">{question.length} / 500</span>
              <Button
                onClick={handleSubmit}
                disabled={!question.trim() || isLoading}
                className="bg-aiq-green hover:bg-aiq-green-dark text-white rounded-xl px-6 h-10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LottieLoader size={20} />
                    전송 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    질문하기
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center animate-fade-in delay-300">
        <p className="text-xs text-aiq-gray">AIQ MVP 테스터 프로그램</p>
      </footer>
    </main>
  )
}
