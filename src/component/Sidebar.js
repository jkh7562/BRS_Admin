import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout, fetchServerStatus } from "../api/apiServices";

import logoImage from "../assets/로고.png";
import mainIcon_on from "../assets/Main_on.png";
import mainIcon from "../assets/Main.png";
import installIcon_on from "../assets/설치_제거_on.png";
import installIcon from "../assets/설치_제거.png";
import logIcon_on from "../assets/제어_로그_on.png";
import logIcon from "../assets/제어_로그.png";
import assignIcon_on from "../assets/배치_on.png";
import assignIcon from "../assets/배치.png";
import monitorIcon_on from "../assets/모니터링_on.png";
import monitorIcon from "../assets/모니터링.png";
import joinIcon_on from "../assets/가입관리_on.png";
import joinIcon from "../assets/가입관리.png";
import orderIcon_on from "../assets/주문내역_on.png";
import orderIcon from "../assets/주문내역.png";
import springIcon from "../assets/spring.png";
import SQLIcon from "../assets/SQL.png";
import reactIcon from "../assets/React.png";
import flaskIcon from "../assets/Flask.png";
import logoutIcon from "../assets/logout.png";
import infoIcon from "../assets/추가정보.png";

const Sidebar = () => {
    const [activeMenu, setActiveMenu] = useState("main");
    const [openSection, setOpenSection] = useState({
        spring: false,
        mysql: false,
        react: false,
        flask: false,
    });
    const [showTooltip, setShowTooltip] = useState(false);
    const [serverStatus, setServerStatus] = useState({
        appServer: "UNKNOWN",
        database: "UNKNOWN",
        userApp: "UNKNOWN",
        employeeApp: "UNKNOWN",
        flaskServer: "UNKNOWN",
    });

    const navigate = useNavigate();
    const location = useLocation();

    const menuList = [
        {
            key: "main",
            label: "메인 대시보드",
            icon: mainIcon,
            iconOn: mainIcon_on,
            route: "/n_MainPage",
        },
        {
            key: "install",
            label: "수거함 설치 / 제거",
            icon: installIcon,
            iconOn: installIcon_on,
            className: "w-6 h-7",
            route: "/n_BoxAddRemovePage",
        },
        {
            key: "log",
            label: "수거함 제어 / 로그",
            icon: logIcon,
            iconOn: logIcon_on,
            className: "w-6 h-5",
            route: "/n_BoxControlLogPage",
        },
        {
            key: "assign",
            label: "수거자 배치",
            icon: assignIcon,
            iconOn: assignIcon_on,
            route: "/n_collectorAssignmentPage",
        },
        {
            key: "monitor",
            label: "모니터링",
            icon: monitorIcon,
            iconOn: monitorIcon_on,
            className: "w-6 h-5",
            route: "/n_MonitoringPage",
        },
        {
            key: "join",
            label: "가입관리",
            icon: joinIcon,
            iconOn: joinIcon_on,
            route: "/n_UserApprovalPage",
        },
        {
            key: "order",
            label: "주문내역",
            icon: orderIcon,
            iconOn: orderIcon_on,
            route: "/n_OrderHistoryPage",
        },
    ];

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        const interval = setInterval(loadServerStatus, 5 * 60 * 1000);
        loadServerStatus();
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            clearInterval(interval);
        };
    }, []);

    const loadServerStatus = async () => {
        try {
            const status = await fetchServerStatus();
            setServerStatus(status);
        } catch (error) {
            console.error("서버 상태 로드 실패:", error);
        }
    };

    const getStatusDotColor = (status) => {
        if (status === "UP") return "bg-[#6DDFC0]";
        if (status === "DOWN") return "bg-[#FF6B6B]";
        return "bg-gray-400";
    };

    const isGroupUp = (...services) => {
        return services.every((key) => serverStatus[key] === "UP");
    };

    const toggleSection = (key) => {
        setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleTooltip = (e) => {
        e.stopPropagation();
        setShowTooltip(!showTooltip);
    };

    const handleClickOutside = (e) => {
        if (showTooltip && !e.target.closest(".tooltip-container")) {
            setShowTooltip(false);
        }
    };

    const handleLogoutClick = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("❌ 로그아웃 실패:", error);
            alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <aside className="w-[340px] sticky top-0 z-50 h-screen text-white" style={{ backgroundColor: "#101213" }}>
            <div className="sidebar-content h-full overflow-y-auto p-5">
                <div className="mb-20 pl-8 mt-2 cursor-pointer" onClick={() => navigate("/n_MainPage")}>
                    <img src={logoImage} alt="batter logo" className="w-[93px]" />
                </div>

                <ul className="space-y-10 text-base pl-8">
                    {menuList.map((menu) => {
                        const isActive = location.pathname === menu.route;
                        return (
                            <li
                                key={menu.key}
                                onClick={() => navigate(menu.route)}
                                className={`flex items-center gap-5 cursor-pointer ${
                                    isActive ? "text-white" : "text-[#A5ACBA]"
                                }`}
                            >
                                <img
                                    src={isActive ? menu.iconOn : menu.icon}
                                    alt={menu.label}
                                    className={menu.className || "w-6 h-6"}
                                />
                                {menu.label}
                            </li>
                        );
                    })}
                </ul>

                {/* 서버 상태 */}
                <div className="mt-12 pt-4 text-base space-y-2 pl-6">
                    <div className="flex items-center gap-44 text-[#A5ACBA] relative">
                        <p>서버 관리</p>
                        <div className="tooltip-container relative">
                            <img src={infoIcon} alt="info" className="w-4 h-4 cursor-pointer" onClick={toggleTooltip} />
                            {showTooltip && (
                                <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-md shadow-lg p-4 z-50">
                                    <div className="absolute -top-2 right-1 w-4 h-4 bg-white transform rotate-45"></div>
                                    <h3 className="font-bold text-sm mb-2">서버 관리 안내</h3>
                                    <p className="text-xs mb-2">각 서버의 상태를 확인할 수 있습니다.</p>
                                    <ul className="text-xs list-disc pl-4">
                                        <li>초록색 점: 정상 작동 중</li>
                                        <li>빨간색 점: 오류 발생</li>
                                    </ul>
                                    <p className="text-xs mt-2">각 항목을 클릭하면 세부 정보를 확인할 수 있습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Spring Boot */}
                    <p className="pt-6 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer" onClick={() => toggleSection("spring")}>
                        <img src={springIcon} alt="Spring Boot" className="w-8 h-8" />
                        Spring Boot
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(isGroupUp("appServer", "userApp") ? "UP" : "DOWN")} ml-2`}></span>
                    </p>
                    {openSection.spring && (
                        <>
                            <p className="ml-10 pb-2 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${getStatusDotColor(serverStatus.appServer)} inline-block`}></span> App
                            </p>
                            <p className="ml-10 pb-2 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${getStatusDotColor(serverStatus.userApp)} inline-block`}></span> Web
                            </p>
                        </>
                    )}

                    {/* MySQL */}
                    <p className="pt-4 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer" onClick={() => toggleSection("mysql")}>
                        <img src={SQLIcon} alt="MySQL" className="w-8 h-8" />
                        MySQL
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(isGroupUp("database") ? "UP" : "DOWN")} ml-2`}></span>
                    </p>
                    {openSection.mysql && (
                        <p className="ml-10 pb-2 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getStatusDotColor(serverStatus.database)} inline-block`}></span> DataBase
                        </p>
                    )}

                    {/* React */}
                    <p className="pt-4 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer" onClick={() => toggleSection("react")}>
                        <img src={reactIcon} alt="React" className="w-8 h-8" />
                        React
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(isGroupUp("userApp") ? "UP" : "DOWN")} ml-2`}></span>
                    </p>
                    {openSection.react && (
                        <p className="ml-10 pb-2 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getStatusDotColor(serverStatus.userApp)} inline-block`}></span> 관리자
                        </p>
                    )}

                    {/* Flask */}
                    <p className="pt-4 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer" onClick={() => toggleSection("flask")}>
                        <img src={flaskIcon} alt="Flask" className="w-8 h-8" />
                        Flask
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(isGroupUp("flaskServer") ? "UP" : "DOWN")} ml-2`}></span>
                    </p>
                    {openSection.flask && (
                        <p className="ml-10 pb-2 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getStatusDotColor(serverStatus.flaskServer)} inline-block`}></span> AI
                        </p>
                    )}
                </div>

                {/* 로그아웃 및 버전 */}
                <div className="mt-12 pl-6 pr-6 flex items-center justify-between text-[#A5ACBA] text-sm">
                    <div onClick={handleLogoutClick} className="flex items-center gap-4 cursor-pointer">
                        <img src={logoutIcon} alt="logout" className="w-5 h-5" />
                        <span>로그아웃</span>
                    </div>
                    <span className="text-xs text-[#7A7F8A]">version 25.3.1</span>
                </div>
            </div>

            <style jsx>{`
        .sidebar-content::-webkit-scrollbar {
          width: 0px;
        }

        .sidebar-content {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .sidebar-content::-webkit-scrollbar-thumb {
          background-color: transparent;
        }

        .sidebar-content::-webkit-scrollbar-track {
          background-color: transparent;
        }
      `}</style>
        </aside>
    );
};

export default Sidebar;