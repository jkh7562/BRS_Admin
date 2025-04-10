import { Search, Copy, MapPin } from "lucide-react"

export default function LocationTracking() {
    return (
        <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-[350px] h-full flex flex-col border-r">
                <div className="p-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="수거자 이름 검색"
                            className="w-full pl-4 pr-10 py-2 text-sm border rounded-full"
                        />
                        <div className="absolute right-3 top-2 text-gray-400">
                            <Search className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* User list with scrollbar */}
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <UserListItem name="홍길동" status="설치 완료" date="2025.03.17" isActive={false} />
                    <UserListItem name="김유신" status="설치 진행중" date="2025.03.16" isActive={true} />
                    <UserListItem name="이순신" status="설치 완료" date="2025.03.13" isActive={false} />
                    <UserListItem name="공자철" status="설치 확인" date="2025.03.09" isActive={false} />
                </div>
            </div>

            {/* Center Section - Map View */}
            <div className="flex-1 relative">
                {/* Map */}
                <div className="w-full h-full bg-blue-50">

                    {/* Location marker */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-black text-white px-2 py-1 rounded text-xs mb-1">설치 진행중</div>
                        <MapPin className="w-6 h-6 text-red-500 mx-auto" />
                    </div>

                    {/* Other map markers */}
                    <div className="absolute top-[30%] left-[20%]">
                        <MapPin className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="absolute top-[40%] left-[40%]">
                        <MapPin className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="absolute bottom-[30%] right-[30%]">
                        <MapPin className="w-4 h-4 text-blue-500" />
                    </div>
                </div>

                {/* Map title overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-white bg-opacity-90">
                    <h2 className="text-lg font-bold">[설치 진행중] 선문대학교 인문관 1층 수거함</h2>
                    <p className="text-sm text-gray-600">
                        설치 좌표 36.8082 / 127.009
                        <span className="float-right">발행 일자 2025.03.16</span>
                    </p>
                </div>
            </div>

            {/* Right Sidebar - User Info */}
            <div className="w-[280px] h-full flex flex-col border-l p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold">김유신</h2>
                    <p className="text-sm text-gray-500">가입일자 2025.02.03</p>
                </div>

                <div className="space-y-4 text-sm">
                    <InfoItem label="광역시/도" value="충청남도" />
                    <InfoItem label="담당지역" value="아산시" />
                    <InfoItem label="상태" value="설치 진행중" />
                    <InfoItem label="알림일자" value="2025.03.16" />
                </div>

                <div className="mt-auto">
                    <button className="w-full py-3 bg-gray-900 text-white rounded-md font-medium">수거자 상세정보 보기</button>
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

function UserListItem({ name, status, date, isActive }) {
    return (
        <div className={`p-4 border-b flex items-center justify-between ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}>
            <div>
                <h3 className="text-base font-bold">{name}</h3>
                <p className="text-sm font-normal text-gray-500">{status}</p>
                <p className="text-sm font-normal text-gray-500">{date}</p>
            </div>
            <button className="text-gray-400">
                <Copy className="w-4 h-4" />
            </button>
        </div>
    )
}

function InfoItem({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}