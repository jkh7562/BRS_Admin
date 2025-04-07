import { Search } from "lucide-react"
// Remove shadcn imports and use regular HTML elements instead

export default function UserInfoSection() {
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
                            className="w-full pl-4 pr-4 py-2 text-sm border rounded-2xl"
                        />
                        <div className="absolute right-4 top-1.5 h-4 w-4 text-gray-400">
                            <Search />
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
                                    <p className="text-sm text-gray-500">기업담당자 2025.02.03</p>
                                </div>
                            </div>
                            <div className="ml-auto">
                                <p className="text-sm text-gray-500">마지막 이용일 2025.03.06</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-4 gap-4 mt-6 mb-6">
                            <StatCard title="총 배출량" value="3,200g" number="1" />
                            <StatCard title="누적 마일리지" value="300p" number="1" />
                            <StatCard title="사용 마일리지" value="240p" number="1" />
                            <StatCard title="잔여 마일리지" value="60p" number="1" />
                        </div>

                        {/* Chart Section */}
                        <div className="mb-3">
                            <div className="tabs">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex border rounded-md overflow-hidden">
                                        <button className="px-4 py-1.5 text-sm">연</button>
                                        <button className="px-4 py-1.5 text-sm">일</button>
                                        <button className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium">월</button>
                                    </div>
                                    <button className="text-sm text-gray-500 px-2 py-1">배송 로그 자세히보기 &gt;</button>
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
                <div className="w-full md:w-[300px] h-full flex flex-col shadow-lg">
                    <div className="p-3">
                        <h2 className="font-medium">주문 내역</h2>
                    </div>

                    {/* 주문 내역 영역에만 스크롤바 적용 */}
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <ActivityItem
                            status="배송완료"
                            date="2025.03.01"
                            time="오전 10:31"
                            code="1ASEF"
                            amount="10↑ (약할인 : 1200원일치)"
                        />

                        <ActivityItem
                            status="배송완료"
                            date="2025.02.19"
                            time="오후 2:17"
                            code="1ZA7JK"
                            amount="10↑ (약할인 : 600원일치)"
                        />

                        <ActivityItem
                            status="배송완료"
                            date="2025.02.11"
                            time="오전 11:23"
                            code="1KABPQ"
                            amount="10↑ (약할인 : 600원일치)"
                        />
                        <ActivityItem
                            status="배송완료"
                            date="2025.02.11"
                            time="오전 11:23"
                            code="1KABPQ"
                            amount="10↑ (약할인 : 600원일치)"
                        />
                        <ActivityItem
                            status="배송완료"
                            date="2025.02.11"
                            time="오전 11:23"
                            code="1KABPQ"
                            amount="10↑ (약할인 : 600원일치)"
                        />
                        <ActivityItem
                            status="배송완료"
                            date="2025.02.11"
                            time="오전 11:23"
                            code="1KABPQ"
                            amount="10↑ (약할인 : 600원일치)"
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
            <button className="text-gray-400">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
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

// Component for activity items
function ActivityItem({ status, date, time, code, amount }) {
    return (
        <div className="p-4">
            <div className="mb-2">
        <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md font-medium">
          {status}
        </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="text-gray-500">주문일자</div>
                <div>
                    {date} {time}
                </div>
                <div className="text-gray-500">주문번호</div>
                <div>{code}</div>
                <div className="text-gray-500">상품코드</div>
                <div>{amount}</div>
            </div>
        </div>
    )
}

// Component for stat cards
function StatCard({ title, value, number }) {
    return (
        <div className="p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-normal text-gray-500">{title}</span>
                <span className="text-xs bg-gray-200 w-5 h-5 rounded-full flex items-center justify-center">{number}</span>
            </div>
            <div className="text-[22px] font-bold">{value}</div>
        </div>
    )
}