import React from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 가져오기
import TextAnimation from "../../component/TextAnimation"; // TextAnimation 컴포넌트 import
import useResetPassword from "../../hooks/useResetPassword"; // ✅ 비밀번호 찾기 훅 import

const FindPasswordPage = () => {
    const navigate = useNavigate(); // 뒤로가기 버튼용 네비게이트 함수
    const { formData, handleChange, handleResetPassword, message } = useResetPassword();

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
                        onClick={() => navigate("/")}
                        className="absolute top-4 left-4 text-sm text-blue-500 hover:underline"
                    >
                        뒤로가기
                    </button>

                    <h1 className="text-2xl font-bold mb-6">비밀번호 찾기</h1>

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
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="border rounded px-4 py-2 w-full"
                            />
                        </div>

                        {/* 아이디 입력 */}
                        <div className="w-full">
                            <label htmlFor="id" className="block text-sm font-medium mb-1">
                                아이디
                            </label>
                            <input
                                type="text"
                                id="id"
                                name="id"
                                value={formData.id}
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

                        {/* 새 비밀번호 입력 */}
                        <div className="w-full">
                            <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                                새 비밀번호
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="border rounded px-4 py-2 w-full"
                            />
                        </div>

                        {/* 에러 및 성공 메시지 */}
                        {message && <p className="text-sm text-red-500">{message}</p>}

                        {/* 비밀번호 변경 버튼 */}
                        <button
                            type="button"
                            onClick={handleResetPassword}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            비밀번호 변경
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindPasswordPage;
