import { Map } from "react-kakao-maps-sdk"
import SearchIcon from "../assets/검색.png"
import CopyIcon from "../assets/copy.png"

export default function LocationTracking() {
    return (
        <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-[350px] h-full flex flex-col border-r">
                <div>
                    <div className="relative mx-2 my-4 p-3">
                        <input
                            type="text"
                            placeholder="수거자 이름 검색"
                            className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                        />
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg"} alt="검색"/>
                        </div>
                    </div>
                </div>

                {/* User list with scrollbar */}
                <div className="overflow-auto flex-1 custom-scrollbar mx-4">
                    <UserListItem name="홍길동" status="설치 완료" date="2025.03.17" isActive={false} />
                    <UserListItem name="김유신" status="설치 진행중" date="2025.03.16" isActive={true} />
                    <UserListItem name="이순신" status="설치 완료" date="2025.03.13" isActive={false} />
                    <UserListItem name="공자철" status="설치 확인" date="2025.03.09" isActive={false} />
                    <UserListItem name="공자철" status="설치 확인" date="2025.03.09" isActive={false} />
                    <UserListItem name="공자철" status="설치 확인" date="2025.03.09" isActive={false} />
                    <UserListItem name="공자철" status="설치 확인" date="2025.03.09" isActive={false} />
                </div>
            </div>

            {/* Center Section - Map View */}
            <div className="flex-1 relative flex flex-col">
                {/* Map title overlay */}
                <div className="p-10 bg-white">
                    <h2 className="text-2xl font-bold">[설치 진행중] 선문대학교 인문관 1층 수거함</h2>
                    <p className="text-[#60697E]">
                        <span className="font-bold">설치 좌표</span>{" "}
                        <span className="font-normal">36.8082 / 127.009</span>
                        <span className="float-right text-sm">알림 일자 2025.03.16</span>
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

            {/* Right Sidebar - User Info */}
            <div className="w-[280px] h-full flex flex-col border-l p-6">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold">김유신</h2>
                    <p className="text-[#60697E]">
                        <span className="font-bold">가입일자</span>{" "}
                        <span className="font-normal">2025.02.03</span>
                    </p>
                </div>

                <div className="space-y-2 text-sm">
                    <InfoItem label="광역시/도" value="충청남도" />
                    <InfoItem label="담당지역" value="아산시" />
                    <InfoItem label="상태" value="설치 진행중" />
                    <InfoItem label="알림일자" value="2025.03.16" />
                </div>

                <div className="mt-6">
                    <button className="w-full py-2 bg-gray-900 text-white rounded-2xl font-medium">수거자 상세정보 보기</button>
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
        <div className={`p-4 border-b flex justify-between ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}>
            <div className="flex items-start">
                <div>
                    <h3 className="text-base font-bold">{name}</h3>
                    <p className="text-sm font-normal text-gray-500">{status}</p>
                    <p className="text-sm font-normal text-gray-500">{date}</p>
                </div>
            </div>
            <button className="text-gray-400 self-start">
                <img src={CopyIcon || "/placeholder.svg"} alt="복사" width={16} height={16} />
            </button>
        </div>
    )
}

function InfoItem({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-[#21262B] font-bold">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}