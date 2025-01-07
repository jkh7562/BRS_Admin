import React from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 가져오기
import TextAnimation from "../component/TextAnimation"; // TextAnimation 컴포넌트 import

const FindIdPage = () => {
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

                    <h1 className="text-2xl font-bold mb-6">아이디 찾기</h1>

                    {/* 입력 양식 컨테이너 */}
                    <div className="w-full max-w-md space-y-4">
                        {/* 이름 입력 */}
                        <div className="w-full">
                            <label htmlFor="name" className="block text-sm font-medium mb-1">
                                이름
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="border rounded px-4 py-2 w-full"
                            />
                        </div>

                        {/* 전화번호 입력 */}
                        <div className="w-full">
                            <label htmlFor="phone" className="block text-sm font-medium mb-1">
                                전화번호
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    id="phone"
                                    className="flex-1 border rounded px-4 py-2"
                                />
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    인증번호 발송
                                </button>
                            </div>
                        </div>

                        {/* 인증번호 입력 */}
                        <div className="w-full">
                            <label htmlFor="code" className="block text-sm font-medium mb-1">
                                인증번호
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    id="code"
                                    className="flex-1 border rounded px-4 py-2"
                                />
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    확인
                                </button>
                            </div>
                        </div>

                        {/* 인증번호 재전송 버튼 */}
                        <div className="w-full">
                            <button
                                type="button"
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                인증번호 재전송
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindIdPage;
