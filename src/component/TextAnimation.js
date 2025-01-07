import React, { useState, useEffect } from "react";

const TextAnimation = () => {
    // 메시지를 관리하기 위한 상태
    const [messageIndex, setMessageIndex] = useState(0); // 현재 메시지 인덱스
    const [displayedText, setDisplayedText] = useState(""); // 현재 표시할 텍스트
    const [typingIndex, setTypingIndex] = useState(0); // 타이핑 중인 문자 인덱스

    // 표시할 메시지 리스트
    const messages = [
        "관리자님, 환영합니다.\n폐전지 수거 데이터를 확인하세요.",
        "수거 현황을 모니터링하고 데이터를 분석하세요.",
        "효율적인 수거와 데이터를 한눈에 관리하세요.",
        "환경 보호를 위한 관리 업무를 시작하세요.",
    ];

    // 타자 효과 구현
    useEffect(() => {
        if (typingIndex < messages[messageIndex].length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + messages[messageIndex][typingIndex]);
                setTypingIndex(typingIndex + 1);
            }, 45); // 타자 속도
            return () => clearTimeout(timeout);
        } else {
            // 메시지 전환 대기 시간
            const switchTimeout = setTimeout(() => {
                setMessageIndex((prevIndex) =>
                    prevIndex === messages.length - 1 ? 0 : prevIndex + 1
                );
                setDisplayedText(""); // 다음 메시지로 넘어가기 전에 초기화
                setTypingIndex(0);
            }, 3000); // 대기 시간
            return () => clearTimeout(switchTimeout);
        }
    }, [typingIndex, messageIndex, messages]);

    return (
        <div className="flex justify-center items-center border-r bg-white">
            <div className="text-left text-black">
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
