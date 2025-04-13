"use client"

import { useState } from "react"
import { Map } from "react-kakao-maps-sdk"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"

const N_boxControlLogPage = () => {
    const [selectedBox, setSelectedBox] = useState({
        name: "선문대학교 동문 앞 수거함",
        status: "정상",
        location: "36.8082 / 127.009",
        date: "2025/03/16",
    })

    // Sample data for collection boxes
    const boxList = [
        {
            id: 1,
            name: "선문대학교 동문 앞 수거함",
            status: "정상",
            location: "36.8082 / 127.009",
            date: "2025/03/16",
            isActive: true,
        },
        {
            id: 2,
            name: "선문대학교 서문 앞 수거함",
            status: "점검 필요",
            location: "36.8082 / 127.009",
            date: "2025/03/17",
            isActive: false,
        },
        {
            id: 3,
            name: "선문대학교 상봉마을 수거함",
            status: "정상",
            location: "36.8082 / 127.009",
            date: "2025/03/13",
            isActive: false,
        },
        {
            id: 4,
            name: "선문대학교 인문관 1층 수거함",
            status: "점검 필요",
            location: "36.8082 / 127.009",
            date: "2025/03/09",
            isActive: false,
        },
        {
            id: 5,
            name: "선문대학교 도서관 앞 수거함",
            status: "정상",
            location: "36.8082 / 127.009",
            date: "2025/03/05",
            isActive: false,
        },
    ]

    // Stats data
    const statsData = {
        totalBoxes: 63,
        batteryCount: 263,
        activeBatteries: 32,
    }

    return (
        <div className="flex min-h-screen w-screen bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl">수거함 제어</p>

                    {/* Collection Box Control Interface */}
                    <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden">
                        {/* Left Sidebar - Box List */}
                        <div className="w-[350px] h-full flex flex-col border-r">
                            <div>
                                <div className="relative mx-2 my-4 p-3">
                                    <input
                                        type="text"
                                        placeholder="함, 주소, 수거함 코드 입력"
                                        className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                                    />
                                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                        <img src={SearchIcon || "/placeholder.svg?height=20&width=20"} alt="검색" />
                                    </div>
                                </div>
                            </div>

                            {/* Box list with scrollbar */}
                            <div className="overflow-auto flex-1 custom-scrollbar mx-4">
                                {boxList.map((box) => (
                                    <BoxListItem
                                        key={box.id}
                                        name={box.name}
                                        status={box.status}
                                        date={box.date}
                                        isActive={box.id === 1}
                                        onClick={() => setSelectedBox(box)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Center Section - Map View */}
                        <div className="flex-1 relative flex flex-col">
                            {/* Map title overlay */}
                            <div className="p-10 pb-9 bg-white">
                                <h2 className="text-2xl font-bold mb-1">{selectedBox.name}</h2>
                                <p className="text-[#60697E]">
                                    <span className="font-bold">좌표정보</span>{" "}
                                    <span className="font-normal">{selectedBox.location}</span>
                                    <span className="float-right text-sm">설치일자 {selectedBox.date}</span>
                                </p>
                            </div>

                            {/* Map */}
                            <div className="flex-1 w-full px-10 pb-10">
                                <Map
                                    center={{ lat: 36.8082, lng: 127.009 }}
                                    style={{ width: "100%", height: "100%" }}
                                    level={3}
                                    className={"border rounded-2xl"}
                                />
                            </div>
                        </div>

                        {/* Right Sidebar - Box Info */}
                        <div className="w-[290px] h-full flex flex-col border-l p-8">
                            <div className="mb-10">
                                <h2 className="text-2xl font-bold pb-1">수거함 정보</h2>
                                <p className="text-[#60697E]">
                                    <span className="font-bold">설치일자</span>
                                    <span className="ml-3 font-normal">{selectedBox.date}</span>
                                </p>
                            </div>

                            <div className="space-y-2 text-sm text-[#60697E]">
                                <div className="flex items-center">
                                    <span className="font-bold w-[70px]">건전지</span>
                                    <span className="font-normal">{statsData.totalBoxes}개</span>
                                    <span className="ml-auto">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-bold w-[70px]">방전 배터리</span>
                                    <span className="font-normal">{statsData.batteryCount}개</span>
                                    <span className="ml-auto">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-bold w-[70px]">잔여 용량 배터리</span>
                                    <span className="font-normal">{statsData.activeBatteries}개</span>
                                    <span className="ml-auto">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-bold w-[70px]">수거자 입구</span>
                                    <span className="font-normal">개폐 제어</span>
                                    <span className="ml-auto">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  </span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <button className="w-full py-2 bg-[#21262B] text-white rounded-2xl font-medium">수거함 차단</button>
                            </div>
                        </div>

                        {/* 스크롤바 스타일 */}
                        <style jsx>{`
                            .custom-scrollbar::-webkit-scrollbar {
                                width: 6px;
                            }

                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: #f1f1f1;
                                border-radius: 10px;
                            }

                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: #c1c1c1;
                                border-radius: 10px;
                                height: 50px;
                            }

                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: #a1a1a1;
                            }
                        `}</style>
                    </div>
                </main>
            </div>
        </div>
    )
}

function BoxListItem({ name, status, date, isActive, onClick }) {
    return (
        <div
            className={`p-4 border-b flex justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div className="flex items-start">
                <div>
                    <h3 className="text-base font-bold">{name}</h3>
                    <p className="text-sm font-normal text-gray-500">{status}</p>
                    <p className="text-sm font-normal text-gray-500">{date}</p>
                </div>
            </div>
            <button className="text-gray-400 self-start">
                <img src={CopyIcon || "/placeholder.svg?height=16&width=16"} alt="복사" width={16} height={16} />
            </button>
        </div>
    )
}

export default N_boxControlLogPage
