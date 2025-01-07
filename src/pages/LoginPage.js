import React from "react";
import { Link } from "react-router-dom"; // React Router의 Link 컴포넌트 import
import TextAnimation from "../component/TextAnimation"; // TextAnimation 컴포넌트 import

const LoginPage = () => {
    return (
        <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
            {/* 전체 화면을 좌우로 나누는 컨테이너 */}
            <div className="grid grid-cols-2 w-full h-full bg-white shadow-md">
                {/* 왼쪽 영역 */}
                <TextAnimation />

                {/* 오른쪽 영역 */}
                <div className="flex flex-col justify-center items-center space-y-4 p-4">
                    {/* 이미지 */}
                    <div className="bg-gray-200 w-24 h-24 flex items-center justify-center">
                        Image
                    </div>

                    {/* 입력 필드 */}
                    <input
                        type="text"
                        placeholder="ID"
                        className="border rounded px-4 py-2 w-3/4"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border rounded px-4 py-2 w-3/4"
                    />

                    {/* 버튼들 */}
                    <div className="grid grid-cols-2 gap-2 w-3/4">
                        <Link to="/signup">
                            <button className="border rounded py-2 w-full">회원가입</button>
                        </Link>
                        <button className="border rounded py-2">로그인</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-3/4">
                        <Link to="/findid">
                            <button className="border rounded py-2 w-full">아이디 찾기</button>
                        </Link>
                        <button className="border rounded py-2">비밀번호 찾기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
