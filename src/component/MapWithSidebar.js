import React, { useState } from "react";
import { Map } from "react-kakao-maps-sdk";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ArrowLeftIcon from "../assets/arrow_left.png"
import ArrowRightIcon from "../assets/arrow_right.png"
import SearchIcon from "../assets/검색.png"

const MapWithSidebar = ({ filteredBoxes }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex bg-white rounded-2xl shadow overflow-hidden h-[570px] relative">
            {/* 토글 화살표 (사이드바 바깥에 위치) */}
            <img
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                src={isSidebarOpen ? ArrowLeftIcon : ArrowRightIcon}
                alt="toggle arrow"
                className={`absolute top-1/2 -translate-y-1/2 cursor-pointer rounded-r transition-all duration-300 w-5 h-10 z-20 ${
                    isSidebarOpen ? "left-[390px]" : "left-0"
                }`}
                style={{ boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)" }} // 오른쪽 그림자
            />

            {/* 좌측 패널 */}
            <div
                className={`transition-all duration-300 ${isSidebarOpen ? "w-[390px]" : "w-0"} overflow-hidden shadow-md h-full relative z-10 bg-white`}>
                <div className="h-full p-4 pr-0">
                    {/* 검색창 */}
                    <div className="relative mb-4 pr-4">
                        <input
                            type="text"
                            placeholder="장소, 주소, 수거함 코드 검색"
                            className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm placeholder:text-gray-400"
                        />
                        <img
                            src={SearchIcon}
                            alt="검색 아이콘"
                            className="absolute right-8 top-2.5 w-4 h-4 text-gray-400"
                        />
                    </div>

                    {/* 리스트 */}
                    <ul className="overflow-y-auto h-[calc(100%-60px)] pr-4 space-y-2 custom-scroll">
                        {filteredBoxes.map((box) => (
                            <li
                                key={box.id}
                                className="p-4 rounded-xl bg-white shadow hover:shadow-md cursor-pointer transition duration-150"
                            >
                                <p className="font-semibold text-sm">{box.name}</p>
                                <p className="text-xs text-gray-500 mt-1">충남 아산시 탕정면 선문로 221번길 70</p>
                                <p className="text-xs text-gray-500">{box.lat} / {box.lng}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 지도 (항상 전체 화면 차지, 사이드바와 독립) */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <Map
                    center={{lat: 36.8082, lng: 127.009}}
                    style={{width: "100%", height: "100%"}}
                    level={3}
                />
            </div>
        </div>
    );
};

export default MapWithSidebar;