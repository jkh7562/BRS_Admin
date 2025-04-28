import React from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/Login_Background.jpg";

const N_FindIdPage = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate("/n_LoginPage");
    };

    const handleSignupClick = () => {
        navigate("/n_SignupPage");
    };
    
    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="bg-white rounded-xl shadow-2xl p-12 w-[500px]">
                <h2 className="text-[48px] font-bold text-center font-nexon">
                    Let’s batter.
                </h2>

                <p className="text-center text-[18px] text-gray-600 mb-12 leading-relaxed font-[Pretendard]">
                    화재걱정 없는 배터리배출의 시작<br/>배터가 함께하겠습니다
                </p>

                <input
                    type="name"
                    placeholder="이름"
                    className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                />
                <input
                    type="phonenumber"
                    placeholder="전화번호"
                    className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                />

                <div className="flex justify-end mb-6 text-[14px]">
                    <div className="space-x-2 text-[#1A0A0B]">
                        <button onClick={handleBackClick} className="hover:underline font-[Pretendard]">로그인 단계로 돌아가기</button>
                    </div>
                </div>

                <button
                    className="w-full bg-[#00C17B] text-white mb-14 py-2.5 rounded hover:bg-green-600 mb-6 text-[18px] font-[Pretendard]">
                    인증번호 전송
                </button>

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