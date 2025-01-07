import React, { useState, useEffect } from "react";
import "./TextAnimation.css";

const TextAnimation = () => {
    const [messageIndex, setMessageIndex] = useState(0); // 현재 메시지 인덱스
    const [displayedText, setDisplayedText] = useState(""); // 현재 표시할 텍스트
    const [typingIndex, setTypingIndex] = useState(0); // 타이핑 중인 문자 인덱스
    const [isSliding, setIsSliding] = useState(false); // 슬라이드 애니메이션 상태

    const messages = [
        "관리자님, 환영합니다.\n폐전지 수거 데이터를 확인하세요.",
        "수거 현황을 모니터링하고 데이터를 분석하세요.",
        "효율적인 수거와 데이터를 한눈에 관리하세요.",
        "환경 보호를 위한 관리 업무를 시작하세요.",
    ];

    // 타자 효과
    useEffect(() => {
        if (typingIndex < messages[messageIndex].length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + messages[messageIndex][typingIndex]);
                setTypingIndex(typingIndex + 1);
            }, 45);
            return () => clearTimeout(timeout);
        } else {
            // 슬라이드 애니메이션 대기
            const waitTimeout = setTimeout(() => {
                setIsSliding(true); // 슬라이드 애니메이션 시작
                setTimeout(() => {
                    // 슬라이드 완료 후 상태 초기화
                    setIsSliding(false);
                    setMessageIndex((prevIndex) =>
                        prevIndex === messages.length - 1 ? 0 : prevIndex + 1
                    );
                    setDisplayedText("");
                    setTypingIndex(0);
                }, 500); // 슬라이드 애니메이션 지속 시간
            }, 3000); // 메시지 유지 시간
            return () => clearTimeout(waitTimeout);
        }
    }, [typingIndex, messageIndex, messages]);

    return (
        <div className="text-animation-container">
            <div className={`text-wrapper ${isSliding ? "slide-out" : ""}`}>
                <h1 className="text-3xl font-bold mb-4">
                    {displayedText.split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </h1>
            </div>
        </div>
    );
};

export default TextAnimation;
