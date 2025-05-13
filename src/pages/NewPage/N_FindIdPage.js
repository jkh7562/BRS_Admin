import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/Login_Background.jpg";
import { findUserId } from "../../api/apiServices"; // API import 추가

const N_FindIdPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [foundId, setFoundId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSearching, setIsSearching] = useState(true); // true: 검색 모드, false: 결과 모드

    const handleBackClick = () => {
        navigate("/n_LoginPage");
    };

    const handleSignupClick = () => {
        navigate("/n_SignupPage");
    };

    const handleFindId = async () => {
        // 입력값 검증
        if (!name || !phoneNumber) {
            setErrorMessage("이름과 전화번호를 모두 입력해주세요.");
            return;
        }

        try {
            const result = await findUserId(name, phoneNumber);
            console.log("✅ 아이디 찾기 결과:", result);

            // 결과 처리
            if (result && result !== "존재하지 않는 사용자입니다.") {
                setFoundId(result);
                setIsSearching(false); // 결과 모드로 전환
                setErrorMessage("");
            } else {
                setErrorMessage("존재하지 않는 사용자입니다.");
            }
        } catch (error) {
            setErrorMessage("서버 오류로 아이디 찾기에 실패했습니다.");
        }
    };

    const handleRetry = () => {
        // 다시 검색 모드로 전환
        setIsSearching(true);
        setFoundId("");
        setErrorMessage("");
        setName("");
        setPhoneNumber("");
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="bg-white rounded-xl shadow-2xl p-12 w-[500px]">
                <h2 className="text-[48px] font-bold text-center font-nexon">
                    Let's batter.
                </h2>

                <p className="text-center text-[18px] text-gray-600 mb-12 leading-relaxed font-[Pretendard]">
                    화재걱정 없는 배터리배출의 시작<br/>배터가 함께하겠습니다
                </p>

                {isSearching ? (
                    // 검색 모드 UI
                    <>
                        <input
                            type="text"
                            placeholder="이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                        />
                        <input
                            type="text"
                            placeholder="전화번호"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                        />

                        {errorMessage && (
                            <p className="text-red-500 text-sm mb-4 font-[Pretendard]">{errorMessage}</p>
                        )}

                        <div className="flex justify-end mb-6 text-[14px]">
                            <div className="space-x-2 text-[#1A0A0B]">
                                <button onClick={handleBackClick} className="hover:underline font-[Pretendard]">로그인 단계로 돌아가기</button>
                            </div>
                        </div>

                        <button
                            onClick={handleFindId}
                            className="w-full bg-[#00C17B] text-white mb-14 py-2.5 rounded hover:bg-green-600 mb-6 text-[18px] font-[Pretendard]">
                            아이디 찾기
                        </button>
                    </>
                ) : (
                    // 결과 모드 UI
                    <>
                        <div className="bg-[#F3F4F8] rounded-lg p-6 mb-8">
                            <p className="text-center text-[16px] font-[Pretendard] mb-2">
                                회원님의 아이디는
                            </p>
                            <p className="text-center text-[24px] font-bold font-[Pretendard] text-[#00C17B]">
                                {foundId}
                            </p>
                            <p className="text-center text-[16px] font-[Pretendard] mt-2">
                                입니다.
                            </p>
                        </div>

                        <div className="flex justify-between mb-6">
                            <button
                                onClick={handleRetry}
                                className="text-[14px] text-[#1A0A0B] hover:underline font-[Pretendard]">
                                다시 찾기
                            </button>
                            <button
                                onClick={handleBackClick}
                                className="text-[14px] text-[#1A0A0B] hover:underline font-[Pretendard]">
                                로그인 단계로 돌아가기
                            </button>
                        </div>

                        <button
                            onClick={handleBackClick}
                            className="w-full bg-[#00C17B] text-white mb-14 py-2.5 rounded hover:bg-green-600 mb-6 text-[18px] font-[Pretendard]">
                            로그인하러 가기
                        </button>
                    </>
                )}

                <div className="mt-8 text-center text-[16px] text-[#1A0A0B] font-[Pretendard]">
                    지구를 위해 배터와 함께해요{" "}
                    <button onClick={handleSignupClick} className="ml-6 text-black text-[16px] font-semibold hover:underline font-[Pretendard]">
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    );
};

export default N_FindIdPage;