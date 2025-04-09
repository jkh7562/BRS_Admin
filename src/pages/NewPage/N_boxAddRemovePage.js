"use client"

import { useState } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"

const N_boxAddRemovePage = () => {
    const [activeTab, setActiveTab] = useState("전체")
    const tabs = ["전체", "설치", "제거"]

    return (
        <div className="flex min-h-screen w-screen bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl">설치/제거 수거함 현황</p>

                    <div>
                        <div className="relative text-sm mb-6">
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
                </main>
            </div>
        </div>
    )
}

export default N_boxAddRemovePage
