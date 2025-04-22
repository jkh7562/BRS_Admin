"use client"

import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import { useState } from "react"
import BellIcon from "../../assets/가입알림.png"
import HomeIcon from "../../assets/Home.png"
import SearchIcon from "../../assets/검색.png"
import DownIcon from "../../assets/Down.png"

const N_UserApprovalPage = () => {
    const [registrations, setRegistrations] = useState([
        {
            id: 1,
            name: "홍길동",
            phone: "010-0000-0000",
            date: "2025/03/06",
            time: "오전 11:29",
            userId: "kus1234",
            password: "kus1209!",
            address: "충청남도 아산시 탕정면 선문로 221번길 70",
        },
        {
            id: 2,
            name: "홍길동",
            phone: "010-0000-0000",
            date: "2025/03/06",
            time: "오전 11:29",
            userId: "kus1234",
            password: "kus1209!",
            address: "충청남도 아산시 탕정면 선문로 221번길 70",
        },
        {
            id: 3,
            name: "홍길동",
            phone: "010-0000-0000",
            date: "2025/03/06",
            time: "오전 11:29",
            userId: "kus1234",
            password: "kus1209!",
            address: "충청남도 아산시 탕정면 선문로 221번길 70",
        },
        {
            id: 4,
            name: "홍길동",
            phone: "010-0000-0000",
            date: "2025/03/06",
            time: "오전 11:29",
            userId: "kus1234",
            password: "kus1209!",
            address: "충청남도 아산시 탕정면 선문로 221번길 70",
        },
        {
            id: 5,
            name: "홍길동",
            phone: "010-0000-0000",
            date: "2025/03/06",
            time: "오전 11:29",
            userId: "kus1234",
            password: "kus1209!",
            address: "충청남도 아산시 탕정면 선문로 221번길 70",
        },
    ])

    const handleApprove = (id: number) => {
        // 승인 처리 로직
        console.log(`사용자 ${id} 승인됨`)
    }

    return (
        <div className="flex min-h-screen w-screen bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-6">
                    <p className="font-bold text-xl">가입관리</p>

                    <div>
                        <div className="bg-white shadow rounded-2xl flex items-center mb-3 px-8 py-1">
                            <div className="flex items-center font-nomal text-[#7A7F8A] mr-auto">
                                <img src={BellIcon || "/placeholder.svg"} alt="Bell" className="w-[13.49px] h-[15.65px] mr-2"/>
                                <span>총 {registrations.length}건의 새로운 가입신청이 있습니다</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="가입 신청자 이름, 전화번호 검색"
                                    className="w-[370px] h-[40px] px-6 py-2 pr-10 border rounded-2xl font-nomal text-sm focus:outline-none text-gray-900 placeholder:text-[#D5D8DE]"
                                />
                                <img
                                    src={SearchIcon || "/placeholder.svg"}
                                    alt="Search"
                                    className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                />
                            </div>
                            <div className="flex ml-8">
                                <button className="px-2 py-1 mr-2 flex items-center">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                    오래된순
                                </button>
                                <button className="px-2 py-1 flex items-center">
                                    <span className="w-2 h-2 bg-gray-900 rounded-full mr-2"></span>
                                    최신순
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {registrations.map((reg) => (
                                <div key={reg.id} className="shadow rounded-2xl overflow-hidden">
                                    <div className="grid grid-cols-3 pt-10 pb-4 bg-white px-8">
                                        <div className="space-y-1">
                                            <div className="flex gap-1">
                                                <span className="text-[#7A7F8A] w-16">이름</span>
                                                <span className="text-[#21262B] font-bold">{reg.name}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <span className="text-gray-500 w-16">전화번호</span>
                                                <span className="text-[#21262B] font-bold">{reg.phone}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex gap-1">
                                                <span className="text-[#7A7F8A] w-24">가입신청 일자</span>
                                                <span className="text-[#21262B] font-bold">{reg.date}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <span className="text-[#7A7F8A] w-24"></span>
                                                <span className="text-[#21262B] font-bold">{reg.time}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between">
                                            <div className="space-y-1">
                                                <div className="flex gap-1">
                                                    <span className="text-[#7A7F8A] w-16">아이디</span>
                                                    <span className="text-[#21262B] font-bold">{reg.userId}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="text-[#7A7F8A] w-16">비밀번호</span>
                                                    <span className="text-[#21262B] font-bold">{reg.password}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleApprove(reg.id)}
                                                    className="px-6 py-2 bg-[#E8F1F7] text-[#21262B] rounded-lg hover:bg-[#D8E3FA] transition-colors"
                                                >
                                                    승인
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="px-6 py-3 bg-white border-t flex justify-between items-center font-nomal text-[#7A7F8A]">
                                        <div className="flex items-center">
                                            <img src={HomeIcon || "/placeholder.svg"} alt="Home"
                                                 className="w-[17px] h-[15px] mr-2"/>
                                            <span>{reg.address}</span>
                                        </div>
                                        <button className="flex items-center text-[#60697E] hover:text-gray-700">
                                            <span>가입신청 반려하기</span>
                                            <img src={DownIcon || "/placeholder.svg"} alt="Down"
                                                 className="w-3 h-2 ml-1"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pb-32"/>
                </main>
            </div>
        </div>
    )
}

export default N_UserApprovalPage
