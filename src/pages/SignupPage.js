import React from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 가져오기
import TextAnimation from "../component/TextAnimation"; // TextAnimation 컴포넌트 가져오기
import useSignup from "../hooks/useSignup"; // 커스텀 훅 가져오기

const SignupPage = () => {
    const navigate = useNavigate();
    const { formData, handleChange, handleSubmit, errorMessage } = useSignup(); // 훅 사용

    return (
        <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
            <div className="grid grid-cols-2 w-full h-full bg-white shadow-md">
                <TextAnimation />

                <div className="flex flex-col justify-center items-center p-8 relative">
                    {/* 뒤로가기 버튼 */}
                    <button
                        onClick={() => navigate("/")}
                        className="absolute top-4 left-4 text-sm text-blue-500 hover:underline"
                    >
                        뒤로가기
                    </button>

                    <h1 className="text-2xl font-bold mb-6">회원가입</h1>

                    <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
                        {/* 이름 입력 */}
                        <div className="w-full">
                            <label className="text-sm font-medium mb-1 block">이름</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="border rounded px-4 py-2 w-full"
                                required
                            />
                        </div>

                        {/* 전화번호 입력 */}
                        <div className="w-full">
                            <label className="text-sm font-medium mb-1 block">전화번호</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="border rounded px-4 py-2 w-full"
                                required
                            />
                        </div>

                        {/* 아이디 입력 */}
                        <div className="w-full">
                            <label className="text-sm font-medium mb-1 block">아이디</label>
                            <input
                                type="text"
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                className="border rounded px-4 py-2 w-full"
                                required
                            />
                        </div>

                        {/* 비밀번호 입력 */}
                        <div className="w-full">
                            <label className="text-sm font-medium mb-1 block">비밀번호</label>
                            <input
                                type="password"
                                name="pw"
                                value={formData.pw}
                                onChange={handleChange}
                                className="border rounded px-4 py-2 w-full"
                                required
                            />
                        </div>

                        {/* 비밀번호 확인 입력 */}
                        <div className="w-full">
                            <label className="text-sm font-medium mb-1 block">비밀번호 확인</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="border rounded px-4 py-2 w-full"
                                required
                            />
                        </div>

                        {/* 에러 메시지 */}
                        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

                        {/* 가입하기 버튼 */}
                        <button
                            type="submit"
                            className="bg-blue-500 text-white rounded py-2 px-6 w-full mt-4 hover:bg-blue-600"
                        >
                            회원가입
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
