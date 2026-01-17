"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ThankYouPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedNickname = sessionStorage.getItem("nickname");
      if (storedNickname) {
        setNickname(storedNickname);
      }
    }

    // sessionStorage 클리어 (테스트 완료)
    setTimeout(() => {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
    }, 1000);
  }, []);

  const handleRestart = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-aiq-green-light via-white to-aiq-gray-light flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-aiq-green/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-aiq-green/15 rounded-full blur-3xl animate-pulse-soft delay-300" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-aiq-green/10 rounded-full blur-2xl animate-pulse-soft delay-500" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-6 animate-fade-in">
          <h1 className="text-4xl font-black text-aiq-green tracking-tight">
            AIQ
          </h1>
        </div>

        <div className="flex justify-center mb-8 animate-fade-in-up delay-100">
          <img
            src="/images/aiq-character.png"
            alt="AIQ Character"
            className="w-36 h-auto object-contain drop-shadow-xl animate-float"
          />
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-aiq-green/20 animate-fade-in-up delay-200">
          <h1 className="text-2xl font-bold text-aiq-black mb-3">
            {nickname ? (
              <>
                <span className="text-aiq-green">{nickname}</span>님,{" "}
              </>
            ) : (
              ""
            )}
            감사합니다!
          </h1>

          <p className="text-aiq-gray mb-6 leading-relaxed">
            AIQ MVP 테스터로 참여해주셔서 정말 감사합니다.
            <br />
            피드백은 AIQ 발전에 큰 도움이 됩니다.
          </p>

          <div className="bg-aiq-green-light rounded-xl p-4 mb-6">
            <p className="text-aiq-green-dark text-sm font-medium">
              정식 출시 시 가장 먼저 알려드릴게요!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleRestart}
              className="w-full h-12 bg-aiq-green hover:bg-aiq-green-dark text-white font-semibold rounded-xl text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              다시 테스트하기
            </Button>

            <p className="text-xs text-aiq-gray">
              문의: aiq.official@gmail.com
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-aiq-gray animate-fade-in delay-400">
          AIQ - AI와 함께하는 새로운 경험
        </p>
      </div>
    </main>
  );
}
