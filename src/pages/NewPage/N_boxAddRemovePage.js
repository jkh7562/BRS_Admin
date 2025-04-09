"use client"

import { useState } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import MapWithSidebar from "../../component/MapWithSidebar"
import { ChevronDown } from "lucide-react"

const N_boxAddRemovePage = () => {
    const [activeTab, setActiveTab] = useState("전체")
    const tabs = ["전체", "설치", "제거", "설치 추천 위치"]

    // 예시 데이터 - 실제 데이터는 API에서 가져오거나 props로 전달받아야 합니다
    const boxesData = [
        {
            id: 1,
            name: "수거함 A",
            address: "서울시 강남구 테헤란로 123",
            lat: 37.5665,
            lng: 126.978,
            status: "설치",
        },
        {
            id: 2,
            name: "수거함 B",
            address: "서울시 서초구 서초대로 456",
            lat: 37.4969,
            lng: 127.0278,
            status: "설치",
        },
        {
            id: 3,
            name: "수거함 C",
            address: "서울시 송파구 올림픽로 789",
            lat: 37.514,
            lng: 127.0565,
            status: "제거",
        },
    ]

    // 선택된 탭에 따라 데이터 필터링
    const filteredBoxes = activeTab === "전체" ? boxesData : boxesData.filter((box) => box.status === activeTab)

    // 필터 상태
    const [filters, setFilters] = useState({
        type: "현황",
        region: "광역시/도",
        city: "시/군/구",
    })

    // 필터 변경 핸들러
    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
        }))
    }

    return (
        <div className="flex min-h-screen w-screen bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl">설치/제거 수거함 현황</p>
                    <div>
                        <div className="relative mb-6">
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0" />
                            <div className="flex gap-6 relative z-10">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-1 bg-transparent ${
                                            activeTab === tab ? "border-b-[3px] border-black text-black font-bold" : "text-gray-500"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* filteredBoxes 데이터를 전달 */}
                    <MapWithSidebar filteredBoxes={filteredBoxes} />

                    <div className="pt-8"></div>
                    <p className="font-bold text-xl">설치/제거 수거함 목록</p>

                    {/* 필터 UI 추가 */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        <div className="relative">
                            <button
                                className="flex items-center gap-1 text-base"
                                onClick={() => {
                                    // 드롭다운 토글 로직 추가
                                }}
                            >
                                {filters.type}
                                <ChevronDown size={16} />
                            </button>
                            {/* 드롭다운 메뉴 */}
                        </div>

                        <div className="relative">
                            <button
                                className="flex items-center gap-1"
                                onClick={() => {
                                    // 드롭다운 토글 로직 추가
                                }}
                            >
                                {filters.region}
                                <ChevronDown size={16} />
                            </button>
                            {/* 드롭다운 메뉴 */}
                        </div>

                        <div className="relative">
                            <button
                                className="flex items-center gap-1"
                                onClick={() => {
                                    // 드롭다운 토글 로직 추가
                                }}
                            >
                                {filters.city}
                                <ChevronDown size={16} />
                            </button>
                            {/* 드롭다운 메뉴 */}
                        </div>
                    </div>


                </main>
            </div>
        </div>
    )
}

export default N_boxAddRemovePage