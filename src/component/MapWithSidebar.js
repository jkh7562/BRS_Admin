import { useState } from "react"
import { Map } from "react-kakao-maps-sdk"
import ArrowLeftIcon from "../assets/arrow_left.png"
import ArrowRightIcon from "../assets/arrow_right.png"
import SearchIcon from "../assets/검색.png"
import CopyIcon from "../assets/copy.png"

const MapWithSidebar = ({ filteredBoxes }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [selectedBoxId, setSelectedBoxId] = useState(3) // 기본적으로 세 번째 항목 선택
    const [searchTerm, setSearchTerm] = useState("")

    // 검색어에 따라 필터링
    const displayedBoxes = searchTerm
        ? filteredBoxes.filter((box) => box.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : filteredBoxes

    return (
        <div className="flex bg-white rounded-2xl shadow-md overflow-hidden h-[570px] relative">
            {/* 토글 화살표 (사이드바 바깥에 위치) */}
            <img
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                src={isSidebarOpen ? ArrowLeftIcon : ArrowRightIcon}
                alt="toggle arrow"
                className={`absolute top-1/2 -translate-y-1/2 cursor-pointer rounded-r transition-all duration-300 w-5 h-10 z-20 ${
                    isSidebarOpen ? "left-[350px]" : "left-0"
                }`}
                style={{ boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)" }} // 오른쪽 그림자
            />

            {/* 좌측 패널 */}
            <div
                className={`transition-all duration-300 ${isSidebarOpen ? "w-[350px]" : "w-0"} overflow-hidden shadow-md h-full relative z-10 bg-white`}
            >
                <div className="h-full">
                    {/* 검색창 */}
                    <div className="relative mx-2 mt-4 p-3">
                        <input
                            type="text"
                            placeholder="장소, 주소, 수거함 코드 검색"
                            className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <img
                            src={SearchIcon || "/placeholder.svg"}
                            alt="검색 아이콘"
                            className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        />
                    </div>

                    {/* 리스트 - 이미지와 동일하게 스타일 적용 */}
                    <div className="overflow-y-auto h-[calc(100%-60px)] mx-4">
                        {displayedBoxes.map((box) => (
                            <div
                                key={box.id}
                                className={`border-b border-gray-100 p-3 cursor-pointer ${selectedBoxId === box.id ? "bg-blue-50" : "hover:bg-gray-50"}`}
                                onClick={() => setSelectedBoxId(box.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-[#21262B]">{box.name}</h3>
                                        <p className="font-nomal text-sm text-[#60697E] mt-2">충남 아산시 탕정면 선문로 221번길 70</p>
                                        <p className="font-nomal text-sm text-[#60697E] mt-1">
                                            {typeof box.lat === "number" ? box.lat.toFixed(8) : box.lat} /{" "}
                                            {typeof box.lng === "number" ? box.lng.toFixed(8) : box.lng}
                                        </p>
                                    </div>
                                    <button className="text-gray-400 p-1">
                                        <img src={CopyIcon || "/placeholder.svg"} alt="복사" className="w-4 h-5"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 지도 (항상 전체 화면 차지, 사이드바와 독립) */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <Map center={{ lat: 36.8082, lng: 127.009 }} style={{ width: "100%", height: "100%" }} level={3} />
            </div>
        </div>
    )
}

export default MapWithSidebar