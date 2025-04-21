import { useState } from "react"
import { Map } from "react-kakao-maps-sdk"
import SearchIcon from "../assets/검색.png"
import CopyIcon from "../assets/copy.png"
import Sample from "../assets/Sample.png"
import DownIcon from "../assets/Down.png"
import Expansion from "../assets/Expansion.png"

export default function RemoveMonitoring() {
    const [selectedOption, setSelectedOption] = useState("전체")
    const [isOpen, setIsOpen] = useState(false)

    const options = ["전체", "제거요청", "제거 진행중", "제거 완료", "제거 확정"]

    const toggleDropdown = () => setIsOpen(!isOpen)

    const selectOption = (option) => {
        setSelectedOption(option)
        setIsOpen(false)
    }

    return (
        <div className="flex h-[555px] bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-[386px] h-full flex flex-col border-r">
                <div className="flex items-center gap-2 mx-2 my-4 pl-3">
                    {/* 검색 입력 필드 */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="수거자 이름 검색"
                            className="w-full py-2 px-5 rounded-2xl border border-gray-300 text-sm focus:outline-none"
                        />
                        <div className="absolute right-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg"} alt="검색"/>
                        </div>
                    </div>

                    {/* 드롭다운 */}
                    <div className="relative min-w-[140px] pr-3">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center justify-between w-full py-2 px-5 rounded-2xl border border-[#7A7F8A] text-sm"
                        >
                            <span>{selectedOption}</span>
                            <img src={DownIcon || "/placeholder.svg"} alt="Down" className="w-3 h-2 ml-2"/>
                        </button>

                        {isOpen && (
                            <div
                                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                                {options.map((option) => (
                                    <div
                                        key={option}
                                        className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
                                        onClick={() => selectOption(option)}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* User list with scrollbar */}
                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    <UserListItem name="홍길동" status="제거 완료" date="2025.03.17" isActive={false}/>
                    <UserListItem name="김유신" status="제거 진행중" date="2025.03.16" isActive={true}/>
                    <UserListItem name="이순신" status="제거 완료" date="2025.03.13" isActive={false}/>
                    <UserListItem name="공자철" status="제거 확정" date="2025.03.09" isActive={false}/>
                    <UserListItem name="공자철" status="제거 확정" date="2025.03.09" isActive={false}/>
                    <UserListItem name="공자철" status="제거 확정" date="2025.03.09" isActive={false}/>
                    <UserListItem name="공자철" status="제거 확정" date="2025.03.09" isActive={false}/>
                </div>
            </div>

            {/* Center Section - Map View */}
            <div className="flex-1 relative flex flex-col">
                {/* Map title overlay */}
                <div className="p-10 pb-9 bg-white">
                    <h2 className="text-2xl font-bold mb-1">[제거 진행중] 선문대학교 인문관 1층 수거함</h2>
                    <p className="text-[#60697E]">
                        <span className="font-bold">제거 좌표</span>{" "}
                        <span className="font-normal">36.8082 / 127.009</span>
                        <span className="float-right text-sm">알림 일자 2025.03.16</span>
                    </p>
                </div>

                {/* Map */}
                <div className="flex-1 w-full px-10 pb-14">
                    <Map
                        center={{lat: 36.8082, lng: 127.009}}
                        style={{width: "100%", height: "100%"}}
                        level={3}
                        className={"border rounded-2xl"}
                    />
                </div>
            </div>

            {/* Right Sidebar - User Info */}
            <div className="w-[290px] h-full flex flex-col border-l p-8">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold pb-1">김유신</h2>
                    <p className="text-[#60697E]">
                        <span className="font-bold">가입일자</span>
                        <span className="ml-3 font-normal">2025.02.03</span>
                    </p>
                </div>

                <div className="space-y-2 text-sm text-[#60697E]">
                    <div className="flex items-center">
                        <span className="font-bold w-[70px]">광역시/도</span>
                        <span className="font-nomal">충청남도</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-bold w-[70px]">담당지역</span>
                        <span className="font-nomal">아산시</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-bold w-[70px]">상태</span>
                        <span className="font-nomal">제거 진행중</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-bold w-[70px]">알림일자</span>
                        <span className="font-nomal">2025.03.16</span>
                    </div>
                </div>
                <div className="relative inline-block">
                    <img
                        src={Sample || "/placeholder.svg"}
                        alt="사진"
                        width="234px"
                        height="189px"
                        className="rounded-2xl mt-7"
                    />
                    <img
                        src={Expansion || "/placeholder.svg"}
                        alt="확대"
                        width="20px"
                        height="20px"
                        className="absolute bottom-4 right-4"
                    />
                </div>
                <span className="mt-2 flex gap-2">
                    <button className="bg-[#21262B] text-white rounded-2xl py-2 px-14">
                    수락
                    </button>
                    <button className="bg-[#FF7571] text-white rounded-2xl py-2 px-6">
                        거절
                    </button>
                </span>
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

function UserListItem({name, status, date, isActive}) {
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
                <img src={CopyIcon || "/placeholder.svg"} alt="복사" width={16} height={16}/>
            </button>
        </div>
    )
}

function InfoItem({label, value}) {
    return (
        <div className="flex justify-between">
            <span className="text-[#21262B] font-bold">{label}</span>
            <span className="font-nomal">{value}</span>
        </div>
    )
}