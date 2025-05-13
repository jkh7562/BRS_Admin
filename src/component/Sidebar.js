import { useState, useEffect } from "react"  // useEffect 추가
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
    // 툴팁 표시 여부를 관리하는 상태 추가
    const [showTooltip, setShowTooltip] = useState(false)

    const toggleSection = (key) => {
        setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    // 툴팁 토글 함수
    const toggleTooltip = (e) => {
        e.stopPropagation() // 이벤트 버블링 방지
        setShowTooltip(!showTooltip)
    }

    // 툴팁 외부 클릭 시 닫기 함수
    const handleClickOutside = (e) => {
        if (showTooltip && !e.target.closest('.tooltip-container')) {
            setShowTooltip(false)
        }
    }

    // 컴포넌트가 마운트될 때 document에 이벤트 리스너 추가 (useState -> useEffect로 수정)
    useEffect(() => {
        // 이벤트 리스너 추가
        document.addEventListener('mousedown', handleClickOutside)

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showTooltip]) // showTooltip이 변경될 때마다 이펙트 재실행

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
                    <div className="flex items-center gap-44 text-[#A5ACBA] relative">
                        <p>서버 관리</p>
                        {/* 툴팁 컨테이너 */}
                        <div className="tooltip-container relative">
                            <img
                                src={infoIcon || "/placeholder.svg"}
                                alt="info"
                                className="w-4 h-4 cursor-pointer"
                                onClick={toggleTooltip}
                            />

                            {/* 툴팁 말풍선 */}
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