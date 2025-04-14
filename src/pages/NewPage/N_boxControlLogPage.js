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
        location: "36.8082 / 127.009",
        date: "2025/03/16",
    })

    // Sample data for collection boxes
    const boxList = [
        {
            id: 1,
            name: "선문대학교 동문 앞 수거함",
            location: "36.8082 / 127.009",
            date: "2025/03/16",
            isActive: true,
        },
        {
            id: 2,
            name: "선문대학교 서문 앞 수거함",
            location: "36.8082 / 127.009",
            date: "2025/03/17",
            isActive: false,
        },
        {
            id: 3,
            name: "선문대학교 상봉마을 수거함",
            location: "36.8082 / 127.009",
            date: "2025/03/13",
            isActive: false,
        },
        {
            id: 4,
            name: "선문대학교 인문관 1층 수거함",
            location: "36.8082 / 127.009",
            date: "2025/03/09",
            isActive: false,
        },
        {
            id: 5,
            name: "선문대학교 도서관 앞 수거함",
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

    const [controlStates, setControlStates] = useState({
        battery: {
            isOpen: false,
        },
        dischargedBattery: {
            isOpen: false,
        },
        remainingCapacityBattery: {
            isOpen: false,
        },
        collectorEntrance: {
            isOpen: false,
        },
    })

    const [isBoxBlocked, setIsBoxBlocked] = useState(false)

    return (
        <div className="flex min-h-screen w-screen bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <div className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl">수거함 제어</p>

                    <div className="flex">
                        {/* Collection Box Control Interface - Left and Center sections */}
                        <div className="flex w-[1100px] h-[520px] bg-white rounded-2xl shadow-md overflow-hidden">
                            {/* Left Sidebar - Box List */}
                            <div className="w-[350px] h-full flex flex-col border-r">
                                <div>
                                    <div className="relative mx-2 my-4 p-3">
                                        <input
                                            type="text"
                                            placeholder="장소, 주소, 수거함 코드 검색"
                                            className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                                        />
                                        <div
                                            className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                            <img src={SearchIcon || "/placeholder.svg?height=20&width=20"} alt="검색"/>
                                        </div>
                                    </div>
                                </div>

                                {/* Box list with scrollbar */}
                                <div className="overflow-auto flex-1 custom-scrollbar mx-4">
                                    {boxList.map((box) => (
                                        <BoxListItem
                                            key={box.id}
                                            name={box.name}
                                            location={box.location}
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
                                        center={{lat: 36.8082, lng: 127.009}}
                                        style={{width: "100%", height: "100%"}}
                                        level={3}
                                        className={"border rounded-2xl"}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Box Info - Now as a separate element */}
                        <div className="w-[280px] space-y-4 pl-6">
                            {/* 건전지 (Battery Boxes) */}
                            <div
                                className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">건전지</div>
                                        <div className="text-xl font-bold">{statsData.totalBoxes}개</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방
                                            </div>
                                            <RadioButton
                                                selected={controlStates.battery.isOpen}
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        battery: {isOpen: true},
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄
                                            </div>
                                            <RadioButton
                                                selected={!controlStates.battery.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        battery: {isOpen: false},
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 방전 배터리 (Discharged Batteries) */}
                            <div
                                className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">방전 배터리</div>
                                        <div className="text-xl font-bold">{statsData.batteryCount}개</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방
                                            </div>
                                            <RadioButton
                                                selected={controlStates.dischargedBattery.isOpen}
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        dischargedBattery: {isOpen: true},
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄
                                            </div>
                                            <RadioButton
                                                selected={!controlStates.dischargedBattery.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        dischargedBattery: {isOpen: false},
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 잔여 용량 배터리 (Remaining Capacity Batteries) */}
                            <div
                                className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">잔여 용량 배터리</div>
                                        <div className="text-xl font-bold">{statsData.activeBatteries}개</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방
                                            </div>
                                            <RadioButton
                                                selected={controlStates.remainingCapacityBattery.isOpen}
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        remainingCapacityBattery: {isOpen: true},
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄
                                            </div>
                                            <RadioButton
                                                selected={!controlStates.remainingCapacityBattery.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        remainingCapacityBattery: {isOpen: false},
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 수거자 입구 (Collector Entrance) */}
                            <div
                                className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">수거자 입구</div>
                                        <div className="text-[#60697E]">개폐 제어</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방
                                            </div>
                                            <RadioButton
                                                selected={controlStates.collectorEntrance.isOpen}
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        collectorEntrance: {isOpen: true},
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄
                                            </div>
                                            <RadioButton
                                                selected={!controlStates.collectorEntrance.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        collectorEntrance: {isOpen: false},
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 수거함 차단 Button (Collection Box Block) */}
                            <button
                                onClick={() => setIsBoxBlocked(!isBoxBlocked)}
                                className={`w-full py-6 ${isBoxBlocked ? "bg-red-600" : "bg-[#21262B]"} text-white rounded-2xl font-medium flex items-center justify-start pl-6 hover:${isBoxBlocked ? "bg-red-700" : "bg-[#1a1f23]"} transition-colors`}
                            >
                                수거함 차단
                                <div className="pl-[90px]">{isBoxBlocked ? "차단됨" : "차단"}</div>
                                <div
                                    className={`w-4 h-4 rounded-full ml-2 ${isBoxBlocked ? "bg-white" : "border-2 border-white"}`}
                                ></div>
                            </button>
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

                    <p className="font-bold text-xl pt-10">수거함 로그</p>
                </div>
            </div>
        </div>
    )
}

function BoxListItem({ name, location, date, isActive, onClick }) {
    return (
        <div
            className={`p-4 border-b flex justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div className="flex items-start">
                <div>
                    <h3 className="text-base font-bold pb-2">{name}</h3>
                    <p className="text-sm font-normal text-gray-500">설치좌표 {location}</p>
                    <p className="text-sm font-normal text-gray-500">설치일자 {date}</p>
                </div>
            </div>
            <button className="text-gray-400 self-start">
                <img src={CopyIcon || "/placeholder.svg?height=16&width=16"} alt="복사" width={16} height={16} />
            </button>
        </div>
    )
}

// Radio button component
function RadioButton({ selected, color = "green", onClick, disabled = false }) {
    return (
        <div
            className={`relative w-5 h-5 rounded-full ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onClick={disabled ? undefined : onClick}
        >
            {selected ? (
                <div className="w-full h-full rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <div className={`w-[14px] h-[14px] rounded-full bg-${color}-400`}></div>
                </div>
            ) : (
                <div className="w-full h-full rounded-full border-2 border-gray-300"></div>
            )}
        </div>
    )
}

export default N_boxControlLogPage
