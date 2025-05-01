"use client"

import { useState, useEffect } from "react"
import { Map, MapMarker } from "react-kakao-maps-sdk"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import RedIcon from "../../assets/아이콘 RED.png"

// 컴포넌트를 수정하여 부모 컴포넌트에서 처리된 데이터를 받도록 함
export default function RemoveStatus({ statuses, addressData = {}, processedBoxes = [] }) {
    const [selectedBox, setSelectedBox] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [displayedBoxes, setDisplayedBoxes] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    // 초기 데이터 설정
    useEffect(() => {
        setIsLoading(true)
        if (processedBoxes && processedBoxes.length > 0) {
            setDisplayedBoxes(processedBoxes)
            if (!selectedBox && processedBoxes.length > 0) {
                setSelectedBox(processedBoxes[0])
            }
        }
        setIsLoading(false)
    }, [processedBoxes])

    // 검색어에 따른 필터링
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setDisplayedBoxes(processedBoxes)
        } else {
            const filtered = processedBoxes.filter(
                (box) =>
                    (box.user && box.user.name && box.user.name.includes(searchTerm)) ||
                    (box.name && box.name.includes(searchTerm)),
            )
            setDisplayedBoxes(filtered)
        }
    }, [searchTerm, processedBoxes])

    // 제거 상태 한글 변환
    const getStatusText = (status) => {
        const statusMap = {
            REMOVE_REQUEST: "제거 요청",
            REMOVE_IN_PROGRESS: "제거 진행중",
            REMOVE_CONFIRMED: "제거 확인",
            REMOVE_COMPLETED: "제거 완료",
        }
        return statusMap[status] || status
    }

    // 좌표 복사 함수
    const copyCoordinates = () => {
        if (selectedBox) {
            const coordText = `${selectedBox.lat} / ${selectedBox.lng}`
            navigator.clipboard
                .writeText(coordText)
                .then(() => alert("좌표가 클립보드에 복사되었습니다."))
                .catch((err) => console.error("좌표 복사 실패:", err))
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (displayedBoxes.length === 0 && !searchTerm) {
        return (
            <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden justify-center items-center">
                <div className="text-center">
                    <p className="text-xl font-bold text-gray-700">데이터가 없습니다</p>
                    <p className="text-gray-500 mt-2">해당 상태의 수거함이 없습니다.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-[350px] h-full flex flex-col border-r">
                <div>
                    <div className="relative mx-2 my-4 p-3">
                        <input
                            type="text"
                            placeholder="ID 검색"
                            className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg"} alt="검색" />
                        </div>
                    </div>
                </div>

                {/* User list with scrollbar */}
                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    {displayedBoxes.map((box) => (
                        <UserListItem
                            key={box.id}
                            boxId={box.id}
                            name={box.user?.name || "미지정"}
                            status={getStatusText(box.removeStatus || box.alarmType || "REMOVE_REQUEST")}
                            date={box.createdAt || "정보 없음"}
                            isActive={selectedBox && selectedBox.id === box.id}
                            onClick={() => setSelectedBox(box)}
                        />
                    ))}
                </div>
            </div>

            {/* Center Section - Map View */}
            {selectedBox && (
                <div className="flex-1 relative flex flex-col">
                    {/* Map title overlay */}
                    <div className="p-10 pb-9 bg-white">
                        <h2 className="text-2xl text-[#21262B] font-bold mb-1">
                            [{getStatusText(selectedBox.removeStatus || selectedBox.alarmType || "REMOVE_REQUEST")}]{" "}
                            {selectedBox.name}
                        </h2>
                        <p className="text-[#60697E]">
                            <span className="font-bold">제거 좌표</span>{" "}
                            <span className="font-normal cursor-pointer hover:text-blue-500" onClick={copyCoordinates}>
                {selectedBox.lat} / {selectedBox.lng}
              </span>
                            <span className="float-right text-sm">
                알림 일자 {selectedBox.alarmDate || selectedBox.createdAt || "정보 없음"}
              </span>
                        </p>
                    </div>

                    {/* Map */}
                    <div className="flex-1 w-full px-10 pb-10">
                        <Map
                            center={{ lat: selectedBox.lat, lng: selectedBox.lng }}
                            style={{ width: "100%", height: "100%" }}
                            level={3}
                            className={"border rounded-2xl"}
                        >
                            <MapMarker
                                position={{ lat: selectedBox.lat, lng: selectedBox.lng }}
                                image={{
                                    src: RedIcon,
                                    size: {
                                        width: 44,
                                        height: 50,
                                    },
                                }}
                            />
                        </Map>
                    </div>
                </div>
            )}

            {/* Right Sidebar - User Info */}
            {selectedBox && (
                <div className="w-[290px] h-full flex flex-col border-l p-8">
                    <div className="mb-10">
                        <h2 className="text-2xl text-[#21262B] font-bold pb-1">{selectedBox.user?.name || "미지정"}</h2>
                        <p className="text-[#60697E]">
                            <span className="font-bold">가입일자</span>
                            <span className="ml-3 font-normal">{selectedBox.user?.createdAt || "정보 없음"}</span>
                        </p>
                    </div>

                    <div className="space-y-2 text-sm text-[#60697E]">
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">광역시/도</span>
                            <span className="font-nomal">{addressData[selectedBox.id]?.region || "정보 없음"}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">담당지역</span>
                            <span className="font-nomal">{addressData[selectedBox.id]?.city || "정보 없음"}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">상태</span>
                            <span className="font-nomal">
                {getStatusText(selectedBox.removeStatus || selectedBox.alarmType || "REMOVE_REQUEST")}
              </span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">알림일자</span>
                            <span className="font-nomal">{selectedBox.alarmDate || selectedBox.createdAt || "정보 없음"}</span>
                        </div>
                    </div>
                </div>
            )}

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
    )
}

function UserListItem({ boxId, name, status, date, isActive, onClick }) {
    return (
        <div
            className={`p-4 border-b flex justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div className="flex items-start">
                <div>
                    <h3 className="text-base text-[#21262B] font-bold">{name}</h3>
                    <p className="text-sm text-[#60697E] font-normal text-gray-500 mt-1">{status}</p>
                    <p className="text-sm text-[#60697E] font-normal text-gray-500">{date}</p>
                </div>
            </div>
            <button
                className="text-gray-400 self-start"
                onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(name)
                }}
            >
                <img src={CopyIcon || "/placeholder.svg"} alt="복사" width={16} height={16} />
            </button>
        </div>
    )
}
