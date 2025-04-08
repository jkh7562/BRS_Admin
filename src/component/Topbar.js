"use client"

import { useState } from "react"
import AlarmIcon from "../assets/알림.png"
import DownIcon from "../assets/Down.png"

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    return (
        <div className="fixed top-0 left-[340px] right-0 bg-white z-40 border-b border-gray-200 h-16 flex items-center justify-end px-6">
            <div className="flex items-center gap-8">
                <div className="relative flex items-center gap-3">
                    <img src="https://via.placeholder.com/32" alt="profile" className="w-8 h-8 rounded-full border border-black"/>
                    <span className="text-lg font-medium text-gray-700">재민</span>
                    <button onClick={toggleDropdown} className="flex items-center justify-center">
                        <img src={DownIcon || "/placeholder.svg"} alt="드롭다운 아이콘" className="w-3 h-3 object-contain" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                            <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                                <img src="https://via.placeholder.com/32" alt="profile" className="w-14 h-14 rounded-full border border-black" />
                                <div>
                                    <p className="text-xl font-medium text-gray-800">재민</p>
                                    <p className="text-gray-500">ID: q1w2e3r4</p>
                                </div>
                            </div>
                            <div className="p-3 flex flex-col gap-2">
                                <button className="w-full py-2 bg-[#7A7F8A] text-white rounded-md hover:bg-gray-500 transition-colors">
                                    비밀번호 변경
                                </button>
                                <button className="w-full py-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors">
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative w-6 h-6 mr-4">
                    <img src={AlarmIcon || "/placeholder.svg"} alt="알림 아이콘" className="w-full h-full object-contain" />
                    {/*<span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>*/}
                </div>
            </div>
        </div>
    )
}

export default Topbar
