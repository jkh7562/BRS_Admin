import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/Login_Background.jpg";
import { resetPassword } from "../../api/apiServices"; // API import 추가

const N_FindPasswordPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleBackClick = () => {
        navigate("/");
    };

    const handleSignupClick = () => {
        navigate("/n_SignupPage");
    };

    const handleResetPassword = async () => {
        // 입력값 검증
        if (!name || !id || !phoneNumber || !newPassword || !confirmPassword) {
            setErrorMessage("모든 필드를 입력해주세요.");
            return;
        }

        // 비밀번호 일치 여부 확인
        if (newPassword !== confirmPassword) {
            setErrorMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const result = await resetPassword(id, name, phoneNumber, newPassword);
            console.log("✅ 비밀번호 변경 결과:", result);

            // 결과 처리
            if (result === "Success") {
                setIsSuccess(true);
                setSuccessMessage("비밀번호가 성공적으로 변경되었습니다.");
                setErrorMessage("");
            } else {
                setErrorMessage("비밀번호 변경에 실패했습니다. 입력 정보를 확인해주세요.");
            }
        } catch (error) {
            setErrorMessage("서버 오류로 비밀번호 변경에 실패했습니다.");
        }
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

                {!isSuccess ? (
                    // 비밀번호 변경 폼
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
                            placeholder="아이디"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                        />
                        <input
                            type="text"
                            placeholder="전화번호"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                        />
                        <input
                            type="password"
                            placeholder="새 비밀번호"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                        />
                        <input
                            type="password"
                            placeholder="새 비밀번호 확인"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                        />

                        {errorMessage && (
                            <p className="text-red-500 text-sm mb-4 font-[Pretendard]">{errorMessage}</p>
                        )}

                        <div className="flex justify-end mb-6 text-[14px]">
                            <div className="space-x-2 text-[#1A0A0B]">
                                <button onClick={handleBackClick} className="hover:underline font-[Pretendard]">로그인 단계로 돌아가기
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleResetPassword}
                            className="w-full bg-[#00C17B] text-white mb-14 py-2.5 rounded hover:bg-green-600 mb-6 text-[18px] font-[Pretendard]">
                            비밀번호 변경
                        </button>
                    </>
                ) : (
                    // 비밀번호 변경 성공 화면
                    <>
                        <div className="bg-[#F3F4F8] rounded-lg p-6 mb-8">
                            <p className="text-center text-[20px] font-bold font-[Pretendard] text-[#00C17B] mb-2">
                                비밀번호 변경 완료
                            </p>
                            <p className="text-center text-[16px] font-[Pretendard]">
                                비밀번호가 성공적으로 변경되었습니다.
                            </p>
                            <p className="text-center text-[16px] font-[Pretendard] mt-2">
                                새 비밀번호로 로그인해주세요.
                            </p>
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
                    <button onClick={handleSignupClick}
                            className="ml-6 text-black text-[16px] font-semibold hover:underline font-[Pretendard]">
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    );
};

export default N_FindPasswordPage;