// Sidebar.js
import React, { useState } from "react";
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

const Sidebar = () => {
    const [activeMenu, setActiveMenu] = useState("main");
    const [openSection, setOpenSection] = useState({
        spring: true,
        mysql: true,
        react: true,
        flask: true,
    });

    const toggleSection = (key) => {
        setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const menuList = [
        {
            key: "main",
            label: "메인 대시보드",
            icon: mainIcon,
            iconOn: mainIcon_on,
        },
        {
            key: "install",
            label: "수거함 설치/제거",
            icon: installIcon,
            iconOn: installIcon_on,
            className: "w-6 h-7",
        },
        {
            key: "log",
            label: "수거함 제어/로그",
            icon: logIcon,
            iconOn: logIcon_on,
            className: "w-6 h-5", // 크기 조정
        },
        {
            key: "assign",
            label: "수거자 배치",
            icon: assignIcon,
            iconOn: assignIcon_on,
        },
        {
            key: "monitor",
            label: "모니터링",
            icon: monitorIcon,
            iconOn: monitorIcon_on,
            className: "w-6 h-5", // 크기 조정
        },
        {
            key: "join",
            label: "가입관리",
            icon: joinIcon,
            iconOn: joinIcon_on,
        },
        {
            key: "order",
            label: "주문내역",
            icon: orderIcon,
            iconOn: orderIcon_on,
        },
    ];

    return (
        <aside className="w-[340px] min-h-screen text-white p-5" style={{ backgroundColor: "#101213" }}>
            <div className="mb-12 pl-6 mt-2">
                <img src={logoImage} alt="batter logo" className="w-[93px]" />
            </div>

            <ul className="space-y-8 text-base pl-6">
                {menuList.map((menu) => (
                    <li
                        key={menu.key}
                        onClick={() => setActiveMenu(menu.key)}
                        className={`flex items-center gap-5 cursor-pointer ${
                            activeMenu === menu.key ? "text-white" : "text-[#A5ACBA]"
                        }`}
                    >
                        <img
                            src={activeMenu === menu.key ? menu.iconOn : menu.icon}
                            alt={menu.label}
                            className={menu.className ? menu.className : "w-6 h-6"}
                        />
                        {menu.label}
                    </li>
                ))}
            </ul>

            <div className="mt-12 pt-4 text-base space-y-2 pl-6">
                <p className="text-[#A5ACBA]">서버 관리</p>

                {/* Spring Boot */}
                <p
                    className="pt-4 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer"
                    onClick={() => toggleSection("spring")}
                >
                    <img src={springIcon} alt="Spring Boot" className="w-8 h-8" />
                    Spring Boot
                </p>
                {openSection.spring && (
                    <>
                        <p className="ml-6 pb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> App
                        </p>
                        <p className="ml-6 pb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> Web
                        </p>
                    </>
                )}

                {/* MySQL */}
                <p
                    className="pt-4 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer"
                    onClick={() => toggleSection("mysql")}
                >
                    <img src={SQLIcon} alt="MySQL" className="w-8 h-8" />
                    MySQL
                </p>
                {openSection.mysql && (
                    <p className="ml-6 pb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> DataBase
                    </p>
                )}

                {/* React */}
                <p
                    className="pt-4 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer"
                    onClick={() => toggleSection("react")}
                >
                    <img src={reactIcon} alt="React" className="w-8 h-8" />
                    React
                </p>
                {openSection.react && (
                    <>
                        <p className="ml-6 pb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> 사용자
                        </p>
                        <p className="ml-6 pb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> 수거자
                        </p>
                        <p className="ml-6 pb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> 관리자
                        </p>
                    </>
                )}

                {/* Flask */}
                <p
                    className="pt-4 pb-2 flex items-center gap-2 text-[#A5ACBA] cursor-pointer"
                    onClick={() => toggleSection("flask")}
                >
                    <img src={flaskIcon} alt="Flask" className="w-8 h-8" />
                    Flask
                </p>
                {openSection.flask && (
                    <p className="ml-6 pb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#6DDFC0] inline-block"></span> AI
                    </p>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;