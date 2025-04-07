import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // React Router의 Link 컴포넌트 import
import SpringbootLogo from "../assets/Springboot.png";
import MySQLLogo from "../assets/MySQL.png";
import ReactLogo from "../assets/React.png";
import { logout, checkPassword, updatePassword } from "../api/apiServices"
import { useDispatch, useSelector } from "react-redux"; // ✅ Redux 추가
import { fetchMyInfo } from "../slices/myInfoSlice"; // ✅ 내 정보 가져오는 Thunk 추가
import { fetchBoxLog } from "../slices/boxLogSlice";
import { fetchBoxes } from "../slices/boxSlice";
import { fetchUsers } from "../slices/userSlice";


const NavigationBar = () => {
    const [isNotificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
    const [isProfileSidebarOpen, setProfileSidebarOpen] = useState(false);
    const [isPasswordChangeOpen, setPasswordChangeOpen] = useState(false); // 비밀번호 변경 화면 상태
    const [activeDropdown, setActiveDropdown] = useState(null);
    const navigate = useNavigate(); // ✅ 네비게이션 훅 사용
    const dispatch = useDispatch();
    const { data: myInfo, status } = useSelector((state) => state.myInfo);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [statusMessage, setStatusMessage] = useState(null);
    const [isCheckingPassword, setIsCheckingPassword] = useState(false);

    const [alarms, setAlarms] = useState([]); // ✅ SSE 알람 상태 관리

    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchMyInfo());
            dispatch(fetchBoxLog());
            dispatch(fetchBoxes());
            dispatch(fetchUsers());
        }
    }, [status, dispatch]);

    useEffect(() => {
        const eventSource = new EventSource(`https://localhost:8443/SSEsubscribe`, {
            withCredentials: true,
        });
        console.log("구독 후", eventSource);

        eventSource.onopen = () => {
            console.log("SSE 연결 성공");
        };

        eventSource.onmessage = (event) => {
            console.log("SSE 메시지 수신:", event.event);
            const alarmData = JSON.parse(event.data);
            setAlarms((prev) => [...prev, alarmData]);
        };

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

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

            // 로그아웃 API 호출
            await logout();

            console.log("✅ 로그아웃 성공");

            // 로그인 페이지로 이동
            navigate("/");
        } catch (error) {
            console.error("❌ 로그아웃 실패:", error);
        }
    };

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            // 1️⃣ 비밀번호 확인 요청
            const checkResponse = await checkPassword(currentPassword);
            if (checkResponse !== "Success") {
                alert("현재 비밀번호가 올바르지 않습니다.");
                return;
            }

            // 2️⃣ 비밀번호 변경 요청
            const updateResponse = await updatePassword(newPassword);
            if (updateResponse === "Success") {
                alert("비밀번호가 성공적으로 변경되었습니다.");
                closePasswordChange();
            } else {
                alert("비밀번호 변경에 실패했습니다.");
            }
        } catch (error) {
            alert("비밀번호 변경 중 오류가 발생했습니다.");
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
                    <Link to="/boxAddRemovePage">
                        <button className="px-4 py-2 border rounded">수거함 추가/제거</button>
                    </Link>
                    {/*<Link to="/control">
                        <button className="px-4 py-2 border rounded">수거함 제어</button>
                    </Link>*/}
                    {/*<Link to="/log">
                        <button className="px-4 py-2 border rounded">수거함 로그</button>
                    </Link>*/}
                    <Link to="/boxControlLogPage">
                        <button className="px-4 py-2 border rounded">수거함 제어/로그</button>
                    </Link>
                    <Link to="/collectorAssignmentPage">
                        <button className="px-4 py-2 border rounded">수거자 배치</button>
                    </Link>
                    <Link to="/monitoringPage">
                    <button className="px-4 py-2 border rounded">모니터링</button>
                    </Link>
                    <Link to="/userApprovalPage">
                        <button className="px-4 py-2 border rounded">가입 관리</button>
                    </Link>
                    <Link to="/orderHistoryPage">
                        <button className="px-4 py-2 border rounded">주문 내역</button>
                    </Link>
                </div>

                <div className="flex items-center justify-end flex-none w-1/4 space-x-6">
                    <div className="relative">
                        <div
                            className="flex items-center cursor-pointer"
                            onClick={() => toggleDropdown("springboot")}
                        >
                            <img src={SpringbootLogo} className="h-10 w-auto" alt="Spring Boot" />
                            <div className="h-2 w-2 rounded-full bg-green-500 ml-3"></div>
                        </div>
                        {activeDropdown === "springboot" && (
                            <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded">
                                <ul>
                                    <li className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                        <span>App</span>
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </li>
                                    <li className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                        <span>Web</span>
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div
                            className="flex items-center cursor-pointer"
                            onClick={() => toggleDropdown("mysql")}
                        >
                            <img src={MySQLLogo} className="h-8 w-auto" alt="MySQL" />
                            <div className="h-2 w-2 rounded-full bg-green-500 ml-3"></div>
                        </div>
                        {activeDropdown === "mysql" && (
                            <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded">
                                <ul>
                                    <li className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                        <span>Database</span>
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div
                            className="flex items-center cursor-pointer"
                            onClick={() => toggleDropdown("react")}
                        >
                            <img src={ReactLogo} className="h-10 w-auto" alt="React" />
                            <div className="h-2 w-2 rounded-full bg-green-500 ml-2"></div>
                        </div>
                        {activeDropdown === "react" && (
                            <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded">
                                <ul>
                                    <li className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                        <span>사용자</span>
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </li>
                                    <li className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                        <span>수거자</span>
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </li>
                                    <li className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                        <span>관리자</span>
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-2">
                        <button onClick={toggleNotificationSidebar} className="px-4 py-2 border rounded">
                            알림
                        </button>
                        <button onClick={toggleProfileSidebar} className="px-4 py-2 border rounded">
                            프로필
                        </button>
                    </div>
                </div>
            </div>

            {/* 알림 사이드바 */}
            <div
                className={`fixed top-0 right-0 h-full bg-white shadow-lg w-80 transition-transform duration-300 z-10 ${
                    isNotificationSidebarOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">알림</h2>
                    <button
                        onClick={toggleNotificationSidebar}
                        className="text-sm text-gray-500 hover:underline mb-4"
                    >
                        닫기
                    </button>
                    <div className="space-y-6">
                        <div className="p-4 bg-gray-100 rounded shadow-md">
                            <p className="font-bold">수거함 추가</p>
                            <p className="text-sm text-gray-600">1월 02일</p>
                            <p className="text-sm text-gray-800">선문대 동문 앞 수거함이 추가되었습니다.</p>
                        </div>
                        <div className="p-4 bg-gray-100 rounded shadow-md">
                            <p className="font-bold">수거함 제거</p>
                            <p className="text-sm text-gray-600">1월 01일</p>
                            <p className="text-sm text-gray-800">선문대 서문 앞 수거함이 제거되었습니다.</p>
                        </div>
                    </div>
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
                        {status === "loading" ? (
                            <p>⏳ 정보 불러오는 중...</p>
                        ) : status === "failed" ? (
                            <p>❌ 정보를 불러오지 못했습니다.</p>
                        ) : myInfo ? (
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                <div>
                                    <p className="font-bold">{myInfo.name}</p> {/* ✅ Redux에서 가져온 name */}
                                    <p className="text-sm text-gray-600">{myInfo.id}</p> {/* ✅ Redux에서 가져온 id */}
                                </div>
                            </div>
                        ) : (
                            <p>⚠️ 사용자 정보를 찾을 수 없습니다.</p>
                        )}

                        <button
                            onClick={openPasswordChange}
                            className="mt-4 px-4 py-2 w-full bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            비밀번호 변경
                        </button>
                        <button
                            onClick={handleLogout} // ✅ 클릭 시 /로 이동
                            className="mt-4 px-4 py-2 w-full bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>

            {/* 비밀번호 변경 화면 */}
            {isPasswordChangeOpen && (
                <div
                    className="fixed top-0 right-0 h-full bg-white shadow-lg w-80 transition-transform duration-300 z-10 ">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-6">비밀번호 변경</h2>
                        <div className="space-y-4">
                            <input
                                type="password"
                                placeholder="현재 비밀번호"
                                className="w-full px-4 py-2 border rounded"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="새 비밀번호"
                                className="w-full px-4 py-2 border rounded"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="새 비밀번호 확인"
                                className="w-full px-4 py-2 border rounded"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {statusMessage && <p className="text-red-500">{statusMessage}</p>}
                            <button
                                onClick={handlePasswordChange}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                disabled={isCheckingPassword}
                            >
                                {isCheckingPassword ? "처리 중..." : "확인"}
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
