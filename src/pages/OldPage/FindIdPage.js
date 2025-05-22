import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextAnimation from "../../component/TextAnimation";
import useFindId from "../../hooks/useFindId";

const FindIdPage = () => {
    const navigate = useNavigate();
    const { formData, handleChange, handleFindId, userId, setUserId, errorMessage, setErrorMessage } = useFindId();
    const [copied, setCopied] = useState(false);

    // 아이디 복사 기능
    const handleCopy = () => {
        navigator.clipboard.writeText(userId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
            <div className="grid grid-cols-2 w-full h-full bg-white shadow-md">
                {/* 왼쪽 애니메이션 영역 */}
                <TextAnimation />

                {/* 오른쪽 입력 및 결과 영역 */}
                <div className="flex flex-col justify-center items-center p-8 relative">
                    {/* 뒤로가기 버튼 */}
                    <button
                        onClick={() => navigate("/")}
                        className="absolute top-4 left-4 text-sm text-blue-500 hover:underline"
                    >
                        뒤로가기
                    </button>

                    <h1 className="text-2xl font-bold mb-6">아이디 찾기</h1>

                    <div className="w-full max-w-md space-y-4">
                        {/* 이름 입력 */}
                        <div className="w-full">
                            <label htmlFor="name" className="block text-sm font-medium mb-1">
                                이름
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="border rounded px-4 py-2 w-full"
                            />
                        </div>

                        {/* 전화번호 입력 */}
                        <div className="w-full">
                            <label htmlFor="phone" className="block text-sm font-medium mb-1">
                                전화번호
                            </label>
                            <input
                                type="text"
                                id="phone"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="border rounded px-4 py-2 w-full"
                            />
                        </div>

                        {/* 에러 메시지 */}
                        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

                        {/* 아이디 찾기 버튼 */}
                        <button
                            type="button"
                            onClick={handleFindId}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            아이디 찾기
                        </button>

                        {/* 찾은 아이디 표시 */}
                        {userId && (
                            <div className="mt-4 p-4 border rounded-lg bg-gray-100 text-center">
                                <p className="text-lg font-semibold text-green-600">아이디: {userId}</p>
                                <button
                                    onClick={handleCopy}
                                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                >
                                    {copied ? "✅ 복사됨!" : "📋 복사하기"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindIdPage;
