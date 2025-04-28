import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/Login_Background.jpg";
import { sendSmsAuth, verifySmsCode, postCreateNewUser  } from "../../api/apiServices";

const N_SignupPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [smsMessage, setSmsMessage] = useState({ text: "", isSuccess: null });
    const [verifyMessage, setVerifyMessage] = useState({ text: "", isSuccess: null });
    const [signupMessage, setSignupMessage] = useState({ text: "", isSuccess: null });

    const handleBackClick = () => {
        navigate("/n_LoginPage");
    };

    const handleSendSms = async () => {
        if (!phoneNumber) {
            setSmsMessage({ text: "전화번호를 입력해 주세요.", isSuccess: false });
            return;
        }
        try {
            await sendSmsAuth(phoneNumber);
            setSmsMessage({ text: "인증번호가 발송되었습니다.", isSuccess: true });
        } catch (error) {
            setSmsMessage({ text: "인증번호 발송에 실패했습니다.", isSuccess: false });
        }
    };

    const handleVerifyCode = async () => {
        if (!phoneNumber || !verificationCode) {
            setVerifyMessage({ text: "전화번호와 인증번호를 모두 입력해 주세요.", isSuccess: false });
            return;
        }
        try {
            const result = await verifySmsCode(phoneNumber, verificationCode);
            if (result === "Success") {
                setVerifyMessage({ text: "인증 성공했습니다.", isSuccess: true });
            } else {
                setVerifyMessage({ text: "인증 실패했습니다. 다시 시도해주세요.", isSuccess: false });
            }
        } catch (error) {
            setVerifyMessage({ text: "인증 요청 중 오류가 발생했습니다.", isSuccess: false });
        }
    };

    const handleSignup = async () => {
        if (!name || !phoneNumber || !verificationCode || !id || !password || !confirmPassword) {
            setSignupMessage({ text: "모든 항목을 입력해 주세요.", isSuccess: false });
            return;
        }

        if (password !== confirmPassword) {
            setSignupMessage({ text: "비밀번호와 비밀번호 확인이 일치하지 않습니다.", isSuccess: false });
            return;
        }

        try {
            const response = await postCreateNewUser(id, password, name, phoneNumber, verificationCode);
            console.log("✅ 회원가입 성공:", response.data);

            alert("회원가입이 완료되었습니다.");

        } catch (error) {
            console.error("❌ 회원가입 실패:", error);
            if (error.response && error.response.data) {
                setSignupMessage({ text: `회원가입 실패: ${error.response.data}`, isSuccess: false });
            } else {
                setSignupMessage({ text: "회원가입 실패: 서버 오류", isSuccess: false });
            }
        }
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
                    화재걱정 없는 배터리배출의 시작<br />배터가 함께하겠습니다
                </p>

                <input
                    type="text"
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mb-2 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                />

                <span className="flex gap-3">
                    <input
                        type="text"
                        placeholder="전화번호"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                    />
                    <button
                        onClick={handleSendSms}
                        className="w-20 h-11 bg-gray-200 text-[#21262B] rounded hover:bg-gray-300 text-[14px] font-[Pretendard]"
                    >
                        인증번호
                    </button>
                </span>
                {smsMessage.text && (
                    <p className={`text-sm font-[Pretendard] ${smsMessage.isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                        {smsMessage.text}
                    </p>
                )}

                <span className="flex gap-3">
                    <input
                        type="number"
                        placeholder="인증번호"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full mt-2 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                    />
                    <button
                        onClick={handleVerifyCode}
                        className="w-20 h-11 mt-2 bg-gray-200 text-[#21262B] rounded hover:bg-gray-300 text-[14px] font-[Pretendard]"
                    >
                        확인하기
                    </button>
                </span>
                {verifyMessage.text && (
                    <p className={`text-sm font-[Pretendard] ${verifyMessage.isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                        {verifyMessage.text}
                    </p>
                )}

                <input
                    type="text"
                    placeholder="아이디"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full mt-2 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-2 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                />
                <input
                    type="password"
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full my-2 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                />

                <div className="flex justify-end mb-6 text-[14px]">
                    <div className="space-x-2 text-[#1A0A0B]">
                        <button onClick={handleBackClick} className="hover:underline font-[Pretendard]">
                            로그인 단계로 돌아가기
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSignup}
                    className="w-full bg-[#00C17B] text-white py-2.5 rounded hover:bg-green-600 text-[18px] font-[Pretendard]"
                >
                    회원가입
                </button>

                {signupMessage.text && (
                    <p className={`text-sm font-[Pretendard] mt-2 ${signupMessage.isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                        {signupMessage.text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default N_SignupPage;
