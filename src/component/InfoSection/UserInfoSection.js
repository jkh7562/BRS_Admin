import { useState } from "react"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import InfoIcon from "../../assets/추가정보2.png"
import LineIcon from "../../assets/구분선.png"
import VectorIcon from "../../assets/Vector.png"

export default function UserInfoSection() {
    const [selectedPeriod, setSelectedPeriod] = useState("일")

    return (
        <div className="flex flex-col md:flex-row bg-white h-[525px] rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-full md:w-[350px] h-full flex flex-col shadow-lg">
                <div className="p-3 pt-8">
                    <div className="flex items-center justify-between mx-4">
                        <h2 className="text-2xl font-bold">총 사용자 수 17,302명</h2>
                    </div>
                    <div className="relative mt-4">
                        <input
                            type="text"
                            placeholder="사용자 이름 검색"
                            className="w-full pl-4 pr-4 py-2 text-sm border border border-black/20 rounded-2xl"
                        />
                        <div className="absolute right-5 top-2 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg"} alt="검색" className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* 사용자 목록 영역에만 스크롤바 적용 */}
                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    <UserListItem name="이창진" points={1600} date="2025.02.03" isActive={false} />
                    <UserListItem name="정윤식" points={3200} date="2025.02.03" isActive={true} />
                    <UserListItem name="정규혁" points={1100} date="2025.02.03" isActive={false} />
                    <UserListItem name="홍길동" points={2000} date="2025.02.03" isActive={false} />
                    <UserListItem name="홍길동" points={2000} date="2025.02.03" isActive={false} />
                    <UserListItem name="홍길동" points={2000} date="2025.02.03" isActive={false} />
                    <UserListItem name="홍길동" points={2000} date="2025.02.03" isActive={false} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row h-full">
                {/* Center Section - User Stats */}
                <div className="flex-1 h-full flex flex-col overflow-hidden p-4">
                    <div className="p-4">
                        {/* User profile section styled to match the image */}
                        <div className="flex">
                            <div className="mr-4">
                                <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                                    <img
                                        src="/placeholder.svg?height=56&width=56"
                                        alt="프로필 이미지"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">정윤식</h2>
                                <div className="flex">
                                    <p className="text-sm text-gray-500">
                                        <span className="font-bold">가입일자</span> <span className="font-normal">2025.02.03</span>
                                    </p>
                                </div>
                            </div>
                            <div className="ml-auto pt-7 pr-2">
                                <p className="text-sm font-medium text-gray-500">마지막 이용일 2025.03.06</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex items-center mt-6 mb-6">
                            <StatCard title="총 배출량" value="3,200g" number="1" />
                            <div className="h-12 flex items-center">
                                <img src={LineIcon || "/placeholder.svg"} alt="구분선" className="h-full mx-11" />
                            </div>
                            <StatCard title="누적 마일리지" value="300p" number="1" />
                            <div className="h-12 flex items-center">
                                <img src={LineIcon || "/placeholder.svg"} alt="구분선" className="h-full mx-11" />
                            </div>
                            <StatCard title="사용 마일리지" value="240p" number="1" />
                            <div className="h-12 flex items-center">
                                <img src={LineIcon || "/placeholder.svg"} alt="구분선" className="h-full mx-11" />
                            </div>
                            <StatCard title="잔여 마일리지" value="60p" number="1" />
                        </div>

                        {/* Chart Section */}
                        <div className="mb-3">
                            <div className="tabs">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex border rounded-md overflow-hidden">
                                        <button
                                            className={`px-4 py-1.5 text-sm ${selectedPeriod === "연" ? "bg-gray-900 text-white font-medium" : ""}`}
                                            onClick={() => setSelectedPeriod("연")}
                                        >
                                            연
                                        </button>
                                        <button
                                            className={`px-4 py-1.5 text-sm ${selectedPeriod === "월" ? "bg-gray-900 text-white font-medium" : ""}`}
                                            onClick={() => setSelectedPeriod("월")}
                                        >
                                            월
                                        </button>
                                        <button
                                            className={`px-4 py-1.5 text-sm ${selectedPeriod === "일" ? "bg-gray-900 text-white font-medium" : ""}`}
                                            onClick={() => setSelectedPeriod("일")}
                                        >
                                            일
                                        </button>
                                    </div>
                                    <button className="text-sm font-medium text-gray-500">
                                        배출 로그 자세히보기{" "}
                                        <img
                                            src={VectorIcon || "/placeholder.svg"}
                                            alt="Vector Icon"
                                            className="ml-1 inline-block w-2 h-3 mb-1"
                                        />
                                    </button>
                                </div>

                                <div className="tab-content">
                                    {/* Chart with horizontal lines */}
                                    <div className="h-[200px] relative py-2 mt-2">
                                        {/* Horizontal grid lines */}
                                        <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col justify-between">
                                            <div className="border-b border-gray-100 w-full h-0"></div>
                                            <div className="border-b border-gray-100 w-full h-0"></div>
                                            <div className="border-b border-gray-100 w-full h-0"></div>
                                            <div className="border-b border-gray-100 w-full h-0"></div>
                                            <div className="border-b border-gray-100 w-full h-0"></div>
                                            <div className="border-b border-gray-100 w-full h-0"></div>
                                            <div className="border-b border-gray-100 w-full h-0"></div>
                                            <div className="border-b border-gray-100 w-full h-0"></div>
                                        </div>

                                        {/* Y-axis labels */}
                                        <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                                            <div>2000</div>
                                            <div>1500</div>
                                            <div>1250</div>
                                            <div>1000</div>
                                            <div>750</div>
                                            <div>500</div>
                                            <div>250</div>
                                            <div>0</div>
                                        </div>

                                        {/* Chart bars */}
                                        <div className="absolute bottom-0 left-10 right-0 flex justify-between h-full items-end">
                                            <ChartBar height={10} date="02.03" />
                                            <ChartBar height={8} date="02.04" />
                                            <ChartBar height={8} date="02.05" />
                                            <ChartBar height={0} date="02.06" />
                                            <ChartBar height={0} date="02.07" />
                                            <ChartBar height={20} date="02.08" />
                                            <ChartBar height={25} date="02.09" />
                                            <ChartBar height={0} date="02.10" />
                                            <ChartBar height={0} date="02.11" />
                                            <ChartBar height={30} date="02.12" />
                                            <ChartBar height={0} date="02.13" />
                                        </div>
                                    </div>

                                    {/* Slider pagination */}
                                    <div className="flex items-center justify-center mt-4">
                                        <button className="px-2 text-sm">&lt;</button>
                                        <div className="w-64 h-2 bg-gray-200 rounded-full relative mx-2">
                                            <div className="absolute left-0 w-1/3 h-full bg-gray-700 rounded-full"></div>
                                        </div>
                                        <button className="px-2 text-sm">&gt;</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Activity Log */}
                <div className="w-full md:w-[300px] h-full flex flex-col shadow-lg pl-7 pt-9">
                    <div className="pb-7">
                        <h2 className="font-bold text-xl">주문 내역</h2>
                    </div>

                    {/* 주문 내역 영역에만 스크롤바 적용 */}
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <ActivityItem
                            status="배송완료"
                            date="2025.03.01"
                            time="오전 10:31"
                            code="1ASEF"
                            amount="101 (수량2 : 120마일리지)"
                        />

                        <ActivityItem
                            status="배송완료"
                            date="2025.02.19"
                            time="오후 2:17"
                            code="1ZA7JK"
                            amount="101 (수량1 : 60마일리지)"
                        />

                        <ActivityItem
                            status="배송완료"
                            date="2025.02.11"
                            time="오전 11:23"
                            code="1KABPQ"
                            amount="101 (수량1 : 60마일리지)"
                        />
                        <ActivityItem
                            status="배송완료"
                            date="2025.02.11"
                            time="오전 11:23"
                            code="1KABPQ"
                            amount="101 (수량1 : 60마일리지)"
                        />
                        <ActivityItem
                            status="배송완료"
                            date="2025.02.11"
                            time="오전 11:23"
                            code="1KABPQ"
                            amount="101 (수량1 : 60마일리지)"
                        />
                        <ActivityItem
                            status="배송완료"
                            date="2025.02.11"
                            time="오전 11:23"
                            code="1KABPQ"
                            amount="101 (수량1 : 60마일리지)"
                        />
                    </div>
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
    )
}

// Update the UserListItem component to apply text-base and font-bold to the name, and text-sm and font-normal to the other text
function UserListItem({ name, points, date, isActive }) {
    return (
        <div className={`p-4 border-b flex items-center justify-between hover:bg-[#D1E3EE] hover:bg-opacity-50`}>
            <div>
                <h3 className="text-base font-bold">{name}</h3>
                <p className="text-sm font-normal text-gray-500">총 배출량 {points}</p>
                <p className="text-sm font-normal text-gray-500">{date}</p>
            </div>
            <button className="pb-10 text-gray-400">
                <img src={CopyIcon || "/placeholder.svg"} alt="복사" className="w-4 h-5" />
            </button>
        </div>
    )
}

// Component for point cards
function PointCard({ title, value, icon }) {
    return (
        <div className="p-3 rounded-md shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{title}</span>
                <span className="text-xs bg-gray-200 w-5 h-5 rounded-full flex items-center justify-center">{icon}</span>
            </div>
            <div className="text-xl font-medium">{value}</div>
        </div>
    )
}

// Component for chart bars
function ChartBar({ height, date }) {
    const barHeight = `${height}%`

    return (
        <div className="flex flex-col items-center w-8">
            <div className="w-full flex justify-center h-[80%]">
                <div className="w-5 bg-rose-500 rounded-sm" style={{ height: barHeight }}></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{date}</div>
        </div>
    )
}

function ActivityItem({ status, date, time, code, amount }) {
    return (
        <div>
            <div>
                <span className="inline-block px-2 py-0.5 bg-[#21262B] text-white text-sm rounded-md font-nomal">{status}</span>
            </div>
            <table className="w-full text-sm border-collapse mt-4 mb-8">
                <tbody>
                <tr>
                    <td className="w-16 text-gray-500 ">주문일자</td>
                    <td>
                        {date} {time}
                    </td>
                </tr>
                <tr>
                    <td className="w-16 text-gray-500">주문번호</td>
                    <td>{code}</td>
                </tr>
                <tr>
                    <td className="w-16 text-gray-500">상품코드</td>
                    <td>{amount}</td>
                </tr>
                </tbody>
            </table>
        </div>
    )
}

// Component for stat cards
function StatCard({ title, value, number }) {
    return (
        <div className="py-4">
            <div className="flex items-center justify-start gap-2 mb-2">
                <span className="text-sm font-normal text-gray-500">{title}</span>
                <span>
          <img src={InfoIcon || "/placeholder.svg"} alt="정보" className="w-4 h-4 object-contain" />
        </span>
            </div>
            <div className="text-[22px] font-bold">{value}</div>
        </div>
    )
}