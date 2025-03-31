import React from "react";
import bgImage from "../../assets/Login_Background.jpg";

const N_LoginPage = () => {
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
                    type="text"
                    placeholder="아이디"
                    className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                />

                <div className="flex items-center justify-between mb-6 text-[14px]">
                    <label className="flex items-center font-[Pretendard]">
                        <input type="checkbox" className="mr-2 accent-green-600"/>
                        아이디 저장
                    </label>
                    <div className="space-x-2 text-gray-500">
                        <button className="hover:underline font-[Pretendard]">아이디 찾기</button>
                        <span>•</span>
                        <button className="hover:underline font-[Pretendard]">비밀번호 찾기</button>
                    </div>
                </div>

                <button
                    className="w-full bg-green-500 text-white mb-14 py-2.5 rounded hover:bg-green-600 mb-6 text-[18px] font-[Pretendard]">
                    로그인
                </button>

                <div className="mb-5 text-center text-[16px] text-gray-600 font-[Pretendard]">
                    지구를 위해 배터와 함께해요{" "}
                    <button className="ml-6 text-black text-[16px] font-semibold hover:underline font-[Pretendard]">
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    );
};

export default N_LoginPage;