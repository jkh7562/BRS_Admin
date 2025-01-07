import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 가져오기
import TextAnimation from "../component/TextAnimation"; // TextAnimation 컴포넌트 가져오기

const SignupPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false); // 비밀번호 보기 상태
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // 비밀번호 확인 보기 상태
    const navigate = useNavigate(); // 뒤로가기 버튼용 네비게이트 함수

    return (
        <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
            {/* 전체 화면을 좌우로 나누는 컨테이너 */}
            <div className="grid grid-cols-2 w-full h-full bg-white shadow-md">
                {/* 왼쪽 영역 */}
                <TextAnimation />

                {/* 오른쪽 영역 */}
                <div className="flex flex-col justify-center items-center p-8 relative">
                    {/* 뒤로가기 버튼 */}
                    <button
                        onClick={() => navigate("/")} // 뒤로가기 버튼 클릭 시 로그인 페이지로 이동
                        className="absolute top-4 left-4 text-sm text-blue-500 hover:underline"
                    >
                        뒤로가기
                    </button>

                    <h1 className="text-2xl font-bold mb-6">회원가입</h1>

                    {/* 입력 양식 컨테이너 */}
                    <div className="w-full max-w-md space-y-4">
                        {/* 이름 입력 */}
                        <div className="w-full">
                            <label className="text-sm font-medium mb-1 block">이름</label>
                            <input
                                type="text"
                                className="border rounded px-4 py-2 w-full"
                            />
                        </div>

                        {/* 전화번호 입력 */}
                        <div className="w-full">
                            <label className="text-sm font-medium mb-1 block">전화번호</label>
                            <input
                                type="text"
                                className="border rounded px-4 py-2 w-full"
                            />
                        </div>

                        {/* 아이디 입력 */}
                        <div className="w-full flex items-center space-x-4">
                            <div className="flex-grow">
                                <label className="text-sm font-medium mb-1 block">아이디</label>
                                <input
                                    type="text"
                                    className="border rounded px-4 py-2 w-full"
                                />
                            </div>
                            <button className="border rounded px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600">
                                중복체크
                            </button>
                        </div>

                        {/* 비밀번호 입력 */}
                        <div className="w-full flex items-center space-x-4">
                            <div className="flex-grow">
                                <label className="text-sm font-medium mb-1 block">비밀번호</label>
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    className="border rounded px-4 py-2 w-full"
                                />
                            </div>
                            <button
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                className="border rounded px-4 py-2 text-sm"
                            >
                                {passwordVisible ? "숨기기" : "보기"}
                            </button>
                        </div>

                        {/* 비밀번호 확인 입력 */}
                        <div className="w-full flex items-center space-x-4">
                            <div className="flex-grow">
                                <label className="text-sm font-medium mb-1 block">비밀번호 확인</label>
                                <input
                                    type={confirmPasswordVisible ? "text" : "password"}
                                    className="border rounded px-4 py-2 w-full"
                                />
                            </div>
                            <button
                                onClick={() =>
                                    setConfirmPasswordVisible(!confirmPasswordVisible)
                                }
                                className="border rounded px-4 py-2 text-sm"
                            >
                                {confirmPasswordVisible ? "숨기기" : "보기"}
                            </button>
                        </div>

                        {/* 가입하기 버튼 */}
                        <button className="bg-blue-500 text-white rounded py-2 px-6 w-full mt-4 hover:bg-blue-600">
                            회원가입
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
