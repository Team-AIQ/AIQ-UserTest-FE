"use client";

import { useState, useEffect, useRef } from "react"; // useRef 추가
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, FileText } from "lucide-react";
import { LottieLoader } from "@/components/lottie-loader";

// Axios 인스턴스 설정
const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

function StarRating({
                        value,
                        onChange,
                        label,
                    }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
}) {
    const [hovered, setHovered] = useState(0);

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
                    >
                        <Star
                            className={`w-8 h-8 transition-all duration-200 ${
                                star <= (hovered || value)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                            }`}
                        />
                    </button>
                ))}
                {value > 0 && <span className="ml-2 text-sm text-aiq-green self-center">{value}점</span>}
            </div>
        </div>
    );
}

export default function FeedbackPage() {
    const router = useRouter();
    const isFetched = useRef(false); // 중복 호출 방지용 Ref

    // 요청하신 변수명으로 상태 관리
    const [stars1, setStars1] = useState(0);
    const [stars2, setStars2] = useState(0);
    const [textFeedback, setTextFeedback] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nickname, setNickname] = useState("");
    const [errors, setErrors] = useState<{ ratings?: string }>({});

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedNickname = sessionStorage.getItem("nickname");
            if (!storedNickname) {
                router.push("/");
                return;
            }
            setNickname(storedNickname);
        }
    }, [router]);

    // 요청하신 handleSubmit 로직 적용
    const handleSubmit = async () => {
        if (isFetched.current) return;

        // 별점 필수 체크 추가
        if (stars1 === 0 || stars2 === 0) {
            setErrors({ ratings: "모든 항목에 별점을 선택해 주세요" });
            return;
        }

        const storedNickname = sessionStorage.getItem("nickname");
        const storedPhoneNumber = sessionStorage.getItem("phonenumber"); // handleNext에서 저장한 소문자 키값

        console.log("세션에서 가져온 번호:", storedPhoneNumber);

        if (!storedPhoneNumber) {
            alert("사용자 정보가 없습니다. 처음부터 다시 시도해주세요.");
            return;
        }

        try {
            isFetched.current = true;
            setIsSubmitting(true);
            setErrors({});

            const feedbackData = {
                name: storedNickname,
                phoneNumber: storedPhoneNumber, // 백엔드에서 받는 CamelCase 키값
                convenienceRating: stars1,
                usageIntentRating: stars2,
                comment: textFeedback
            };

            const response = await api.post("/api/feedback", feedbackData);

            if (response.status === 200 || response.status === 201) {
                alert("피드백이 성공적으로 전달되었습니다!");
                sessionStorage.clear();
                router.push("/thank-you");
            }
        } catch (error) {
            isFetched.current = false;
            setIsSubmitting(false);
            console.error("제출 실패:", error);
            alert("전송 중 오류가 발생했습니다.");
        }
    };

    const handleViewReport = () => {
        const questionId = sessionStorage.getItem("questionId");
        router.push(questionId ? `/report?questionId=${questionId}` : "/report");
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-aiq-gray-light to-white flex flex-col items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-md">
                <div className="flex justify-center mb-6 animate-fade-in">
                    <img src="/images/aiq-character.png" alt="AIQ Character" className="w-24 h-auto object-contain animate-float" />
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 border border-border">
                    <h1 className="text-xl font-bold text-center text-aiq-black mb-2">사용자 만족도 조사</h1>
                    <p className="text-aiq-gray text-center text-sm mb-6">{nickname}님의 소중한 피드백을 부탁드려요!</p>

                    <div className="space-y-6">
                        <StarRating value={stars1} onChange={setStars1} label="비교 과정이 덜 번거로웠나요?" />
                        <StarRating value={stars2} onChange={setStars2} label="이런 서비스가 있다면 사용할 의향이 있나요?" />

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-aiq-black">AIQ의 개선사항을 피드백 해주세요!</label>
                            <Textarea
                                placeholder="사용하면서 느꼈던 점이나 개선 사항을 자유롭게 적어주세요."
                                value={textFeedback}
                                onChange={(e) => setTextFeedback(e.target.value)}
                                className="min-h-[100px] rounded-xl border-2 resize-none"
                            />
                        </div>

                        <Button onClick={handleViewReport} variant="outline" className="w-full h-12 border-2 border-aiq-green text-aiq-green rounded-xl flex gap-2 bg-transparent">
                            <FileText className="w-5 h-5" /> AIQ 보고서 다시 보기
                        </Button>

                        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 bg-aiq-green hover:bg-aiq-green-dark text-white font-semibold rounded-xl text-lg transition-all">
                            {isSubmitting ? <span className="flex items-center gap-2"><LottieLoader size={24} /> 제출 중...</span> : "피드백 제출하기"}
                        </Button>

                        {errors.ratings && <p className="text-sm text-destructive text-center">{errors.ratings}</p>}
                    </div>
                </div>
            </div>
        </main>
    );
}