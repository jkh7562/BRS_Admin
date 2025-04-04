import { useState } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import MapWithSidebar from "../../component/MapWithSidebar"
import UserInfoSection from "../../component/UserInfoSection";
import joinIcon from "../../assets/가입관리2.png"
import dayIcon from "../../assets/일간.png"
import infoIcon from "../../assets/추가정보2.png"
import customerIcon from "../../assets/고객관리.png"
import lineIcon from "../../assets/구분선.png"
import FireInfoIcon from "../../assets/FireInfo.png"

// 수거함 더미 데이터
const dummyBoxes = [
    {
        id: 1,
        name: "선문대학교 공학관 1층 수거함",
        lat: 36.8082,
        lng: 127.009,
        status: "normal",
    },
    {
        id: 2,
        name: "선문대학교 CU 수거함",
        lat: 36.8084,
        lng: 127.0093,
        status: "need-collect",
    },
    {
        id: 3,
        name: "선문대 인문관 1층 수거함",
        lat: 36.8086,
        lng: 127.0095,
        status: "fire",
    },
]

// 사용자 더미 데이터
const dummyUsers = [
    { id: 1, name: "정윤식", amount: 3200, date: "2025-02-03" },
    { id: 2, name: "김민수", amount: 1500, date: "2025-01-15" },
    { id: 3, name: "이영희", amount: 2300, date: "2025-03-10" },
]

const N_mainPage = () => {
    const tabs = ["전체 수거함", "건전지", "방전 배터리", "잔여 용량 배터리"];
    const [selectedEmissionTab, setSelectedEmissionTab] = useState("전체 수거함");
    const [selectedCollectionTab, setSelectedCollectionTab] = useState("전체 수거함");
    const [selectedTab, setSelectedTab] = useState("전체 수거함");
    const memberTabs = ["사용자", "수거자"];
    const [memberselectedTab, setMemberSelectedTab] = useState("사용자");

    const filteredBoxes = selectedTab === "전체 수거함"
        ? dummyBoxes
        : dummyBoxes.filter((box) =>
            selectedTab === "수거 필요"
                ? box.status === "need-collect"
                : box.status === "fire"
        );

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl">대시 보드</p>
                    <div className="flex gap-4">
                        {/* 신규 수거자 가입신청 */}
                        <div className="w-1/5 bg-[#21262B] rounded-2xl p-4 shadow">
                            <div className="flex items-center gap-2 mt-4 mb-4 ml-4 mr-4">
                                <img src={joinIcon || "/placeholder.svg"} alt="신규 수거자 아이콘" className="w-6 h-6"/>
                                <h2 className="font-bold text-xl text-white whitespace-nowrap">신규 수거자 가입신청</h2>
                            </div>
                            <p className="text-sm text-[#A5ACBA] ml-4 mr-4 mb-6">
                                가입신청이 들어왔어요! 여기를 눌러 <span className="text-blue-400 underline cursor-pointer">확인</span>
                                해주세요!
                            </p>
                            <p className="font-bold text-[22px] text-white mt-3 ml-4 mr-4 mb-2">16건</p>
                        </div>

                        {/* 일간 이용 현황 */}
                        <div className="flex-1 bg-white rounded-2xl p-4 shadow">
                            <div className="flex items-center justify-between mb-14">
                                <div className="flex items-center gap-2 mt-4 ml-6 mr-4">
                                    <img src={dayIcon || "/placeholder.svg"} alt="일간 아이콘" className="w-5 h-5"/>
                                    <h2 className="pl-1 text-xl font-bold whitespace-nowrap">일간 이용 현황</h2>
                                </div>
                                <p className="text-sm font-medium text-[#7A7F8A] whitespace-nowrap pr-3 mt-4">
                                    마지막 업데이트 2025.03.31
                                </p>
                            </div>
                            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center text-sm text-left">
                                <div className="ml-4 min-w-[90px]">
                                    <div className="flex items-center justify-center gap-1 text-nowrap">
                                        <p className="font-normal text-gray-500 mr-2">일간 배출량</p>
                                        <img src={infoIcon || "/placeholder.svg"} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] mt-2 pl-2 text-left">1,197g</p>
                                </div>
                                <div className="flex justify-center pl-8 pr-8">
                                    <img src={lineIcon || "/placeholder.svg"} alt="line" className="h-8"/>
                                </div>
                                <div className="min-w-[90px]">
                                    <div className="flex items-center justify-center gap-1 text-nowrap">
                                        <p className="font-normal text-gray-500 mr-2">일간 수거량</p>
                                        <img src={infoIcon || "/placeholder.svg"} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] mt-2 pl-4 text-left">1,062g</p>
                                </div>
                                <div className="flex justify-center pl-8 pr-8">
                                    <img src={lineIcon || "/placeholder.svg"} alt="line" className="h-8"/>
                                </div>
                                <div className="mr-4 min-w-[90px]">
                                    <div className="flex items-center justify-center gap-1 text-nowrap">
                                        <p className="font-normal text-gray-500 mr-2">일간 이용자수</p>
                                        <img src={infoIcon || "/placeholder.svg"} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] mt-2 text-left">31명</p>
                                </div>
                            </div>
                        </div>

                        {/* 고객 관리 */}
                        <div className="flex-1 bg-white rounded-2xl p-4 shadow">
                            <div className="flex items-center justify-between mb-14">
                                <div className="flex items-center gap-2 mt-4 ml-6 mr-4">
                                    <img src={customerIcon || "/placeholder.svg"} alt="고객 관리 아이콘" className="w-5 h-5"/>
                                    <h2 className="font-bold text-xl whitespace-nowrap">고객 관리</h2>
                                </div>
                                <p className="font-medium text-sm text-[#7A7F8A] whitespace-nowrap pr-3 mt-4">
                                    마지막 업데이트 2025.03.31
                                </p>
                            </div>
                            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center text-sm text-left">
                                <div className="ml-4 min-w-[90px]">
                                    <div className="flex items-center justify-center gap-1 text-nowrap">
                                        <p className="font-normal text-gray-500 mr-2">사용자 문의</p>
                                        <img src={infoIcon || "/placeholder.svg"} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] mt-2 pl-2 text-left">13건</p>
                                </div>
                                <div className="flex justify-center pl-8 pr-8">
                                    <img src={lineIcon || "/placeholder.svg"} alt="line" className="h-8"/>
                                </div>
                                <div className="min-w-[90px]">
                                    <div className="flex items-center justify-center gap-1 text-nowrap">
                                        <p className="font-normal text-gray-500 mr-2">수거자 문의</p>
                                        <img src={infoIcon || "/placeholder.svg"} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] mt-2 pl-4 text-left">5건</p>
                                </div>
                                <div className="flex justify-center pl-8 pr-8">
                                    <img src={lineIcon || "/placeholder.svg"} alt="line" className="h-8"/>
                                </div>
                                <div className="mr-4 min-w-[90px]">
                                    <div className="flex items-center justify-center gap-1 text-nowrap">
                                        <p className="font-normal text-gray-500 mr-2">일반 민원</p>
                                        <img src={infoIcon || "/placeholder.svg"} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] mt-2 pl-4 text-left">0건</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 수거함 현황 */}
                    <div className="pt-12 mb-4">
                        <h3 className="font-bold text-xl mb-4">수거함 현황</h3>
                        <div className="relative text-sm mb-9">
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0"/>
                            <div className="flex items-center gap-4 relative">
                                {["전체 수거함", "수거 필요", "화재감지"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setSelectedTab(tab)}
                                        className={`pb-1 flex items-center gap-1 bg-transparent ${
                                            selectedTab === tab
                                                ? `border-b-[3px] ${
                                                    tab === "화재감지"
                                                        ? "border-black text-[#940000] font-bold"
                                                        : "border-black text-black font-bold"
                                                }`
                                                : tab === "화재감지"
                                                    ? "text-[#940000]"
                                                    : "text-gray-500"
                                        }`}
                                    >
                                        {tab}
                                        {tab === "화재감지" && (
                                            <img
                                                src={FireInfoIcon || "/placeholder.svg"}
                                                alt="화재 정보 아이콘"
                                                className="w-[14px] h-[14px] ml-[2px]"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <MapWithSidebar filteredBoxes={filteredBoxes}/>

                    {/* 탭 영역: 배출량 + 수거량 */}
                    <div className="grid grid-cols-2 gap-6 pt-9 bg-gray-50 mb-2">
                        {/* 배출량 */}
                        <div>
                            <h3 className="text-xl font-bold mb-3">배출량</h3>
                            <div className="relative text-sm mb-6">
                                <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0"/>
                                <div className="flex gap-6 relative z-10">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setSelectedEmissionTab(tab)}
                                            className={`pb-1 bg-transparent ${
                                                selectedEmissionTab === tab
                                                    ? "border-b-[3px] border-black text-black font-semibold"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 수거량 */}
                        <div>
                            <h3 className="text-xl font-bold mb-3">수거량</h3>
                            <div className="relative text-sm mb-6">
                                <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0"/>
                                <div className="flex gap-6 relative z-10">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setSelectedCollectionTab(tab)}
                                            className={`pb-1 bg-transparent ${
                                                selectedCollectionTab === tab
                                                    ? "border-b-[3px] border-black text-black font-semibold"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 차트 영역: 배출량 + 수거량 */}
                    <div className="grid grid-cols-2 gap-4 pb-10">
                        <div className="bg-white rounded-lg p-4 shadow">
                            <div
                                className="h-52 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                                배출량 차트 영역
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow">
                            <div
                                className="h-52 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                                수거량 차트 영역
                            </div>
                        </div>
                    </div>

                    <div className="pb-6">
                        <h3 className="text-xl font-bold mb-4">회원 정보 검색</h3>

                        <div className="relative text-sm">
                            {/* 얇은 하단 선 */}
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0"/>

                            {/* 탭 버튼 */}
                            <div className="flex gap-6 relative z-10">
                                {memberTabs.map((memberTabs) => (
                                    <button
                                        key={memberTabs}
                                        onClick={() => setMemberSelectedTab(memberTabs)}
                                        className={`pb-1 bg-transparent ${
                                            memberselectedTab === memberTabs
                                                ? "border-b-[3px] border-black text-black font-semibold"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {memberTabs}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 사용자 정보 섹션 */}
                    <UserInfoSection/>
                    <div className="pb-32" />
                </main>
            </div>
        </div>
    )
}

export default N_mainPage