import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { logout } from "../api/apiServices"
import logoImage from "../assets/로고.png"
import mainIcon_on from "../assets/Main_on.png"
import mainIcon from "../assets/Main.png"
import installIcon_on from "../assets/설치_제거_on.png"
import installIcon from "../assets/설치_제거.png"
import logIcon_on from "../assets/제어_로그_on.png"
import logIcon from "../assets/제어_로그.png"
import assignIcon_on from "../assets/배치_on.png"
import assignIcon from "../assets/배치.png"
import monitorIcon_on from "../assets/모니터링_on.png"
import monitorIcon from "../assets/모니터링.png"
import joinIcon_on from "../assets/가입관리_on.png"
import joinIcon from "../assets/가입관리.png"
import orderIcon_on from "../assets/주문내역_on.png"
import orderIcon from "../assets/주문내역.png"
import springIcon from "../assets/spring.png"
import SQLIcon from "../assets/SQL.png"
import reactIcon from "../assets/React.png"
import flaskIcon from "../assets/Flask.png"
import logoutIcon from "../assets/logout.png"
import infoIcon from "../assets/추가정보.png"

const Sidebar = () => {
    const [activeMenu, setActiveMenu] = useState("main")
    const navigate = useNavigate()
    const location = useLocation()
    const [openSection, setOpenSection] = useState({
        spring: true,
        mysql: true,
        react: true,
        flask: true,
    })

    const toggleSection = (key) => {
        setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }))
    }

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
            className: "w-6 h-5", // 크기 조정
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
            className: "w-6 h-5", // 크기 조정
            route: "/n_MonitoringPage",
        },
        {
            key: "join",
            label: "가입관리",
            icon: joinIcon,
            iconOn: joinIcon_on,
            route: "/n_UserApprovalPage"
        },
        {
            key: "order",
            label: "주문내역",
            icon: orderIcon,
            iconOn: orderIcon_on,
            route: "/n_OrderHistoryPage"
        },
    ]

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
        <aside className="w-[340px] sticky top-0 z-50 h-screen text-white" style={{ backgroundColor: "#101213" }}>
            <div className="sidebar-content h-full overflow-y-auto p-5">
                {/* 로고 클릭 시 메인으로 이동 */}
                <div className="mb-20 pl-8 mt-2 cursor-pointer" onClick={() => navigate("/n_MainPage")}>
                    <img src={logoImage || "/placeholder.svg"} alt="batter logo" className="w-[93px]"/>
                </div>

                <ul className="space-y-10 text-base pl-8">
                    {menuList.map((menu) => {
                        const isActive = location.pathname === menu.route
                        return (
                            <li
                                key={menu.key}
                                onClick={() => {
                                    if (menu.route) navigate(menu.route)
                                }}
                                className={`flex items-center gap-5 cursor-pointer ${
                                    isActive ? "text-white" : "text-[#A5ACBA]"
                                }`}
                            >
                                <img
                                    src={isActive ? menu.iconOn : menu.icon}
                                    alt={menu.label}
                                    className={menu.className ? menu.className : "w-6 h-6"}
                                />
                                {menu.label}
                            </li>
                        )
                    })}
                </ul>

                <div className="mt-12 pt-4 text-base space-y-2 pl-6">
                    <div className="flex items-center gap-44 text-[#A5ACBA]">
                        <p>서버 관리</p>
                        <img src={infoIcon || "/placeholder.svg"} alt="info" className="w-4 h-4"/>
                    </div>

                    {/* Spring Boot */}
                    <p
                        className="pt-6 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer"
                        onClick={() => toggleSection("spring")}
                    >
                        <img src={springIcon || "/placeholder.svg"} alt="Spring Boot" className="w-8 h-8"/>
                        Spring Boot
                    </p>
                    {openSection.spring && (
                        <>
                            <p className="ml-10 pb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> App
                            </p>
                            <p className="ml-10 pb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> Web
                            </p>
                        </>
                    )}

                    {/* MySQL */}
                    <p
                        className="pt-4 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer"
                        onClick={() => toggleSection("mysql")}
                    >
                        <img src={SQLIcon || "/placeholder.svg"} alt="MySQL" className="w-8 h-8"/>
                        MySQL
                    </p>
                    {openSection.mysql && (
                        <p className="ml-10 pb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> DataBase
                        </p>
                    )}

                    {/* React */}
                    <p
                        className="pt-4 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer"
                        onClick={() => toggleSection("react")}
                    >
                        <img src={reactIcon || "/placeholder.svg"} alt="React" className="w-8 h-8"/>
                        React
                    </p>
                    {openSection.react && (
                        <>
                            <p className="ml-10 pb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> 관리자
                            </p>
                        </>
                    )}

                    {/* Flask */}
                    <p
                        className="pt-4 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer"
                        onClick={() => toggleSection("flask")}
                    >
                        <img src={flaskIcon || "/placeholder.svg"} alt="Flask" className="w-8 h-8"/>
                        Flask
                    </p>
                    {openSection.flask && (
                        <p className="ml-10 pb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> AI
                        </p>
                    )}
                </div>
                {/* 로그아웃 + 버전 */}
                <div className="mt-12 pl-6 pr-6 flex items-center justify-between text-[#A5ACBA] text-sm">
                    <div onClick={handleLogoutClick} className="flex items-center gap-4 cursor-pointer">
                        <img src={logoutIcon || "/placeholder.svg"} alt="logout" className="w-5 h-5"/>
                        <span>로그아웃</span>
                    </div>
                    <span className="text-xs text-[#7A7F8A]">version 25.3.1</span>
                </div>
            </div>

            {/* 스크롤바 스타일 */}
            <style jsx>{`
                .sidebar-content::-webkit-scrollbar {
                    width: 0px;  /* 스크롤바 너비를 0으로 설정하여 보이지 않게 함 */
                }
                
                .sidebar-content {
                    scrollbar-width: none;  /* Firefox에서 스크롤바 숨기기 */
                    -ms-overflow-style: none;  /* IE와 Edge에서 스크롤바 숨기기 */
                }
                
                /* IE에서 스크롤바 숨기기 */
                .sidebar-content::-webkit-scrollbar-thumb {
                    background-color: transparent;
                }
                
                .sidebar-content::-webkit-scrollbar-track {
                    background-color: transparent;
                }
            `}</style>
        </aside>
    )
}

export default Sidebar