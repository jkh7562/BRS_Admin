import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlarmIcon from "../assets/알림.png";
import DownIcon from "../assets/Down.png";
import FireInfoIcon from "../assets/FireInfo.png";
import BoxIcon from "../assets/수거함Black.png";
import PlusIcon from "../assets/가입신청Black.png";
import UserIcon from "../assets/user.png";
import { getMyInfo } from "../api/apiServices";
import { logout } from "../api/apiServices"

const Topbar = () => {
    const navigate = useNavigate();
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [userInfo, setUserInfo] = useState({ name: "", id: "" }); // ✅ 유저 정보 상태 추가

    const [alarms, setAlarms] = useState([]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const data = await getMyInfo();
                setUserInfo({
                    name: data.name || "",
                    id: data.id || "",
                });
            } catch (error) {
                console.error("내 정보 불러오기 실패:", error);
            }
        };

        fetchUserInfo();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isNotificationSidebarOpen &&
                !event.target.closest(".notification-sidebar") &&
                !event.target.closest(".notification-button")
            ) {
                setIsNotificationSidebarOpen(false);
            }

            if (
                isProfileDropdownOpen &&
                !event.target.closest(".profile-dropdown") &&
                !event.target.closest(".profile-button")
            ) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isProfileDropdownOpen, isNotificationSidebarOpen]);

    useEffect(() => {
        const eventSource = new EventSource(`${process.env.REACT_APP_API_BASE_URL}/SSEsubscribe`, {
            withCredentials: true,
        });
        console.log("구독 후", eventSource);

        eventSource.onopen = () => {
            console.log("SSE 연결 성공");
        };

        eventSource.addEventListener("alarm", (event) => {
            try {
                console.log("SSE 메시지 수신:", event.event);
                const alarmData = JSON.parse(event.data);
                setAlarms((prev) => [...prev, alarmData]);
            } catch (error) {
                console.error("SSE 데이터 파싱 에러:", error);
            }
        });

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const toggleProfileDropdown = () => {
        if (!isProfileDropdownOpen) {
            setShowPasswordForm(false);
        }
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const toggleNotificationSidebar = () => {
        setIsNotificationSidebarOpen(!isNotificationSidebarOpen);
    };

    const openPasswordForm = () => {
        setShowPasswordForm(true);
    };

    const closePasswordForm = () => {
        setShowPasswordForm(false);
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        console.log("Password change submitted:", passwordForm);

        setIsProfileDropdownOpen(false);
        setShowPasswordForm(false);
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        alert("비밀번호가 변경되었습니다.");
    };

    const handleLogoutClick = async () => {
        try {
            await logout(); // ✅ logout API 호출
            navigate("/n_LoginPage"); // ✅ 성공하면 로그인페이지로 이동
        } catch (error) {
            console.error("❌ 로그아웃 실패:", error);
            alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bg-[#F3F3F5] z-40 border-b border-gray-200 h-16 flex items-center justify-end px-6">
                <div className="flex items-center gap-8">
                    <div className="relative flex items-center gap-3">
                        <img
                            src={UserIcon}
                            alt="profile"
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="text-lg font-medium text-[#272F42]">{userInfo.name}</span>
                        <button onClick={toggleProfileDropdown} className="profile-button flex items-center justify-center">
                            <img src={DownIcon || "/placeholder.svg"} alt="드롭다운 아이콘" className="w-3 h-3 object-contain" />
                        </button>

                        {isProfileDropdownOpen && (
                            <div className="profile-dropdown absolute top-full right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                                <div className="p-4 flex items-center gap-3">
                                    <img
                                        src="https://via.placeholder.com/32"
                                        alt="profile"
                                        className="w-14 h-14 rounded-full border border-black"
                                    />
                                    <div>
                                        <p className="text-xl font-medium text-[#21262B]">{userInfo.name}</p>
                                        <p className="text-[#60697E]">ID: {userInfo.id}</p>
                                    </div>
                                </div>

                                {!showPasswordForm ? (
                                    <div className="p-3 flex flex-col gap-2">
                                        <button
                                            className="w-full py-2 bg-[#7A7F8A] text-white rounded-md hover:bg-gray-500 transition-colors"
                                            onClick={openPasswordForm}
                                        >
                                            비밀번호 변경
                                        </button>
                                        <button
                                            onClick={handleLogoutClick}
                                            className="w-full py-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors"
                                        >
                                            로그아웃
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <form onSubmit={handlePasswordSubmit}>
                                            <div className="space-y-3">
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={passwordForm.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="현재 비밀번호"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    required
                                                />
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={passwordForm.newPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="새 비밀번호"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    required
                                                />
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="새 비밀번호 확인"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                                >
                                                    확인
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={closePasswordForm}
                                                    className="flex-1 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative w-6 h-6 mr-4">
                        <button onClick={toggleNotificationSidebar} className="notification-button w-full h-full flex items-center justify-center">
                            <img src={AlarmIcon || "/placeholder.svg"} alt="알림 아이콘" className="w-full h-full object-contain" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={`notification-sidebar fixed top-16 right-0 h-[calc(100%-4rem)] w-80 bg-[#F3F3F5] shadow-lg z-30 transition-transform duration-300 ease-in-out ${
                    isNotificationSidebarOpen ? "transform-none" : "transform translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 pt-8">
                    <h2 className="font-bold text-[#21262B] text-lg">알림 4건</h2>
                </div>

                <div className="p-5 overflow-y-auto h-[calc(100%-60px)]">
                    <div className="flex flex-col gap-2">
                        {/* 알림 카드들 */}
                        <div className="bg-gray-800 text-white py-6 px-6 rounded-2xl shadow">
                            <div className="flex items-start gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <img src={FireInfoIcon || "/placeholder.svg"} alt="화재 알림 아이콘" className="w-5 h-5 object-contain" />
                                        <p className="font-semibold text-lg">화재가 감지됐어요.</p>
                                    </div>
                                    <p className="text-sm mt-1">서울특별시 송파구 가락로 111 수거함에서 화재가 감지됐어요.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white py-6 px-6 rounded-2xl shadow">
                            <div className="flex items-start gap-3">
                                <div>
                                    <div className="flex items-start gap-2">
                                        <img src={BoxIcon || "/placeholder.svg"} alt="수거함 아이콘" className="w-5 h-5 object-contain" />
                                        <p className="font-bold text-[#21262B]">수거함 추가</p>
                                    </div>
                                    <p className="text-sm text-[#60697E] mt-1">선문대 동문 앞 수거함이 추가되었어요</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white py-6 px-6 rounded-2xl shadow">
                            <div className="flex items-start gap-3">
                                <div>
                                    <div className="flex items-start gap-2">
                                        <img src={BoxIcon || "/placeholder.svg"} alt="수거함 아이콘" className="w-5 h-5 object-contain" />
                                        <p className="font-bold text-[#21262B]">수거함 제거</p>
                                    </div>
                                    <p className="text-sm text-[#60697E] mt-1">선문대 서문 앞 수거함이 제거되었어요</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white py-6 px-6 rounded-2xl shadow-md">
                            <div className="flex items-start gap-3">
                                <div>
                                    <div className="flex items-start gap-2">
                                        <img src={PlusIcon || "/placeholder.svg"} alt="가입신청 아이콘" className="w-5 h-5 object-contain" />
                                        <p className="font-bold text-[#21262B]">신규 수거자 가입신청</p>
                                    </div>
                                    <p className="text-sm text-[#60697E] mt-1">16건의 가입신청이 들어왔어요</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Topbar;
