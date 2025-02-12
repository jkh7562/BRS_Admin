import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // React Router의 Link 컴포넌트 import
import { useDispatch, useSelector } from "react-redux";
import { fetchMyInfo } from "../slices/myInfoSlice"; // Redux에서 내정보 가져오기
import SpringbootLogo from "../assets/Springboot.png";
import MySQLLogo from "../assets/MySQL.png";
import ReactLogo from "../assets/React.png";
import { logout } from "../api/apiServices";

const NavigationBar = () => {
    const [isNotificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
    const [isProfileSidebarOpen, setProfileSidebarOpen] = useState(false);
    const [isPasswordChangeOpen, setPasswordChangeOpen] = useState(false); // 비밀번호 변경 화면 상태
    const [activeDropdown, setActiveDropdown] = useState(null);
    const navigate = useNavigate(); // ✅ 네비게이션 훅 사용
    const dispatch = useDispatch();

    // ✅ Redux에서 내 정보 가져오기
    const { data: userInfo } = useSelector((state) => state.myInfo);

    useEffect(() => {
        dispatch(fetchMyInfo()); // 컴포넌트가 마운트될 때 내정보 요청
    }, [dispatch]);

    const toggleNotificationSidebar = () => {
        setProfileSidebarOpen(false);
        setPasswordChangeOpen(false); // 비밀번호 변경 화면 닫기
        setNotificationSidebarOpen(!isNotificationSidebarOpen);
    };

    const toggleProfileSidebar = () => {
        setNotificationSidebarOpen(false);
        setPasswordChangeOpen(false); // 비밀번호 변경 화면 닫기
        setProfileSidebarOpen(!isProfileSidebarOpen);
    };

    const toggleDropdown = (dropdownId) => {
        setActiveDropdown((prev) => (prev === dropdownId ? null : dropdownId));
    };

    const openPasswordChange = () => {
        setProfileSidebarOpen(false); // 프로필 사이드바 닫기
        setPasswordChangeOpen(true); // 비밀번호 변경 화면 열기
    };

    const closePasswordChange = () => {
        setPasswordChangeOpen(false); // 비밀번호 변경 화면 닫기
    };

    const handleLogout = async () => {
        try {
            console.log("로그아웃 처리 중...");
            await logout();
            console.log("✅ 로그아웃 성공");
            navigate("/");
        } catch (error) {
            console.error("❌ 로그아웃 실패:", error);
        }
    };

    return (
        <div>
            {/* 네비게이션 바 */}
            <div className="flex items-center px-4 py-2 bg-white shadow-md fixed top-0 left-0 w-full z-50">
                <div className="flex items-center justify-start flex-none w-1/4">
                    <Link to="/main">
                        <button className="px-4 py-2 border rounded">로고</button>
                    </Link>
                </div>

                <div className="flex justify-center flex-grow space-x-4">
                    <Link to="/control">
                        <button className="px-4 py-2 border rounded">수거함 제어</button>
                    </Link>
                    <Link to="/log">
                        <button className="px-4 py-2 border rounded">수거함 로그</button>
                    </Link>
                    <Link to="/membershipcode">
                        <button className="px-4 py-2 border rounded">가입 코드 관리</button>
                    </Link>
                </div>

                <div className="flex items-center justify-end flex-none w-1/4 space-x-6">
                    <button onClick={toggleNotificationSidebar} className="px-4 py-2 border rounded">
                        알림
                    </button>
                    <button onClick={toggleProfileSidebar} className="px-4 py-2 border rounded">
                        프로필
                    </button>
                </div>
            </div>

            {/* 프로필 사이드바 */}
            <div
                className={`fixed top-0 right-0 h-full bg-white shadow-lg w-80 transition-transform duration-300 z-10 ${
                    isProfileSidebarOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">프로필</h2>
                    <button
                        onClick={toggleProfileSidebar}
                        className="text-sm text-gray-500 hover:underline mb-4"
                    >
                        닫기
                    </button>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                            <div>
                                <p className="font-bold">{userInfo?.name || "이름 없음"}</p>
                                <p className="text-sm text-gray-600">{userInfo?.id || "아이디 없음"}</p>
                            </div>
                        </div>
                        <button
                            onClick={openPasswordChange}
                            className="mt-4 px-4 py-2 w-full bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            비밀번호 변경
                        </button>
                        <button
                            onClick={handleLogout} // ✅ 클릭 시 로그아웃
                            className="mt-4 px-4 py-2 w-full bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>

            {/* 비밀번호 변경 화면 */}
            {isPasswordChangeOpen && (
                <div className="fixed top-0 right-0 h-full bg-white shadow-lg w-80 transition-transform duration-300 z-10">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-6">비밀번호 변경</h2>
                        <div className="space-y-4">
                            <input
                                type="password"
                                placeholder="현재 비밀번호"
                                className="w-full px-4 py-2 border rounded"
                            />
                            <input
                                type="password"
                                placeholder="새 비밀번호"
                                className="w-full px-4 py-2 border rounded"
                            />
                            <input
                                type="password"
                                placeholder="새 비밀번호 확인"
                                className="w-full px-4 py-2 border rounded"
                            />
                            <button
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                확인
                            </button>
                            <button
                                onClick={closePasswordChange}
                                className="w-full px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavigationBar;
