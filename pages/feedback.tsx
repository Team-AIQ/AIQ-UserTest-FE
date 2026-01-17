"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, FileText } from "lucide-react"
import { LottieLoader } from "@/components/lottie-loader"

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (v: number) => void
  label: string
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-aiq-black">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
            aria-label={`${star}점`}
          >
            <Star
              className={`w-8 h-8 transition-all duration-200 ${
                star <= (hovered || value) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
        {value > 0 && <span className="ml-2 text-sm text-aiq-green self-center">{value}점</span>}
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  const navigate = useNavigate()
  const [convenienceRating, setConvenienceRating] = useState(0)
  const [intentionRating, setIntentionRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nickname, setNickname] = useState("")
  const [phonenumber, setPhonenumber] = useState("")

  useEffect(() => {
    const storedNickname = sessionStorage.getItem("nickname")
    const storedPhonenumber = sessionStorage.getItem("phonenumber")

    if (!storedNickname) {
      navigate("/")
      return
    }

    setNickname(storedNickname)
    setPhonenumber(storedPhonenumber || "")
  }, [navigate])

  const handleSubmit = async () => {
    if (convenienceRating === 0 || intentionRating === 0) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          phonenumber,
          convenienceRating,
          intentionRating,
          feedback,
        }),
      })

      if (!response.ok) {
        throw new Error("피드백 전송 실패")
      }

      navigate("/thank-you")
    } catch (error) {
      console.error("피드백 전송 오류:", error)
      navigate("/thank-you")
    }
  }

  const handleViewReport = () => {
    const questionId = sessionStorage.getItem("questionId")
    if (questionId) {
      navigate(`/report?questionId=${questionId}`)
    } else {
      navigate("/report")
    }
  }

  const allRatingsComplete = convenienceRating > 0 && intentionRating > 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-aiq-gray-light to-white flex flex-col items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-aiq-green/10 rounded-full blur-2xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-aiq-green/10 rounded-full blur-3xl animate-pulse-soft delay-300" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-6 animate-fade-in">
          <img
            src="/images/aiq-character.png"
            alt="AIQ Character"
            className="w-28 h-auto object-contain drop-shadow-lg animate-float"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-border animate-fade-in-up delay-100">
          <h1 className="text-xl font-bold text-center text-aiq-black mb-2">사용자 만족도 조사</h1>
          <p className="text-aiq-gray text-center text-sm mb-6">{nickname}님의 소중한 피드백을 부탁드려요!</p>

          <div className="space-y-6">
            <StarRating
              value={convenienceRating}
              onChange={setConvenienceRating}
              label="비교 과정이 덜 번거로웠나요?"
            />

            <StarRating
              value={intentionRating}
              onChange={setIntentionRating}
              label="이런 서비스가 있다면 사용할 의향이 있나요?"
            />

            <div className="space-y-2">
              <label htmlFor="feedback" className="block text-sm font-medium text-aiq-black">
                AIQ의 개선사항을 피드백 해주세요!
              </label>
              <Textarea
                id="feedback"
                placeholder="사용하면서 느꼈던 점이나 개선 사항을 자유롭게 적어주세요."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px] rounded-xl border-2 border-border focus:border-aiq-green focus:ring-aiq-green resize-none transition-all duration-300"
              />
            </div>

            <Button
              onClick={handleViewReport}
              variant="outline"
              className="w-full h-12 border-2 border-aiq-green text-aiq-green hover:bg-aiq-green-light font-semibold rounded-xl text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 bg-transparent"
            >
              <FileText className="w-5 h-5" />
              AIQ 보고서 다시 보기
            </Button>

            {/* 제출 버튼 */}
            <Button
              onClick={handleSubmit}
              disabled={!allRatingsComplete || isSubmitting}
              className="w-full h-12 bg-aiq-green hover:bg-aiq-green-dark text-white font-semibold rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LottieLoader size={24} />
                  제출 중...
                </span>
              ) : (
                "피드백 제출하기"
              )}
            </Button>

            {!allRatingsComplete && (
              <p className="text-xs text-aiq-gray text-center animate-fade-in">모든 항목에 별점을 선택해 주세요</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
