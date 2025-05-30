import { useEffect, useState } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import BellIcon from "../../assets/가입알림.png"
import HomeIcon from "../../assets/Home.png"
import SearchIcon from "../../assets/검색.png"
import DownIcon from "../../assets/Down.png"
import BottomLine from "../../assets/Line_Bottom.png"
import { fetchEmployeeRequests, approveUserRequest, rejectUserJoin } from "../../api/apiServices" // API 함수 import

const N_UserApprovalPage = () => {
    // 상태 관리
    const [registrations, setRegistrations] = useState([])
    const [filteredRegistrations, setFilteredRegistrations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [isNewest, setIsNewest] = useState(true)

    // 데이터 로딩 함수
    const loadEmployeeRequests = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const data = await fetchEmployeeRequests()
            console.log("API 응답 데이터:", data) // 디버깅용 로그

            // API 응답 데이터 포맷팅
            const formattedData = data.map((item) => {
                // 날짜 및 시간 포맷팅
                const dateObj = new Date(item.date || item.createdAt || new Date())
                const date = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}`
                const hours = dateObj.getHours()
                const ampm = hours >= 12 ? "오후" : "오전"
                const hour12 = hours % 12 || 12
                const time = `${ampm} ${hour12}:${String(dateObj.getMinutes()).padStart(2, "0")}`

                return {
                    id: item.id,
                    name: item.name,
                    phone: item.phone_number || item.phoneNumber || item.phone,
                    date,
                    time,
                    userId: item.id,
                    password: item.pw,
                    // 수정된 주소 매핑 로직
                    address: item.location1 && item.location2
                        ? `${item.location1} ${item.location2}`
                        : item.location1 || item.location2 || "주소 정보 없음",
                    createdAt: item.date || item.createdAt,
                }
            })

            // 최신순으로 정렬
            const sortedData = sortRegistrations(formattedData, isNewest)

            setRegistrations(sortedData)
            setFilteredRegistrations(sortedData)
            setIsLoading(false)
        } catch (err) {
            console.error("가입 요청 목록 로딩 실패:", err)
            setError("가입 요청 목록을 불러오는데 실패했습니다.")
            setIsLoading(false)
        }
    }

    // 컴포넌트 마운트 시 데이터 로딩
    useEffect(() => {
        loadEmployeeRequests()
    }, [])

    // 승인 처리 함수
    const handleApprove = async (userId) => {
        try {
            await approveUserRequest(userId)

            // 성공 시 목록에서 제거
            const updatedRegistrations = registrations.filter((reg) => reg.userId !== userId)
            setRegistrations(updatedRegistrations)
            setFilteredRegistrations(filteredRegistrations.filter((reg) => reg.userId !== userId))

            // 성공 알림 - window.alert 사용하여 ESLint 오류 방지
            window.alert(`${userId} 사용자의 가입이 승인되었습니다.`)
        } catch (err) {
            console.error(`사용자 ${userId} 승인 실패:`, err)
            setError("가입 승인에 실패했습니다.")
        }
    }

    // 반려 처리 함수
    const handleReject = async (userId) => {
        // 사용자 확인 - window.confirm 사용하여 ESLint 오류 해결
        if (!window.confirm(`${userId} 사용자의 가입 신청을 반려하시겠습니까?`)) {
            return
        }

        try {
            await rejectUserJoin(userId)

            // 성공 시 목록에서 제거
            const updatedRegistrations = registrations.filter((reg) => reg.userId !== userId)
            setRegistrations(updatedRegistrations)
            setFilteredRegistrations(filteredRegistrations.filter((reg) => reg.userId !== userId))

            // 성공 알림 - window.alert 사용
            window.alert(`${userId} 사용자의 가입이 반려되었습니다.`)
        } catch (err) {
            console.error(`사용자 ${userId} 반려 실패:`, err)
            setError("가입 반려에 실패했습니다.")
        }
    }

    // 정렬 함수
    const sortRegistrations = (data, newest) => {
        return [...data].sort((a, b) => {
            const dateA = new Date(a.createdAt || `${a.date} ${a.time}`).getTime()
            const dateB = new Date(b.createdAt || `${b.date} ${b.time}`).getTime()
            return newest ? dateB - dateA : dateA - dateB
        })
    }

    // 정렬 방식 변경 함수
    const toggleSortOrder = (newest) => {
        setIsNewest(newest)
        const sorted = sortRegistrations(filteredRegistrations, newest)
        setFilteredRegistrations(sorted)
    }

    // 검색 처리 함수
    const handleSearch = (e) => {
        const term = e.target.value
        setSearchTerm(term)

        if (!term.trim()) {
            setFilteredRegistrations(registrations)
            return
        }

        const filtered = registrations.filter(
            (reg) => reg.name.includes(term) || reg.phone.includes(term) || (reg.userId && reg.userId.includes(term)),
        )

        setFilteredRegistrations(filtered)
    }

    return (
        <div className="flex min-h-screen w-full bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-6">
                    <p className="font-bold text-[#272F42] text-xl">가입관리</p>
                    <span className="text-sm text-gray-500">가입신청한 예비 수거자에 대해 승인하거나 반려할 수 있습니다.</span>

                    {error && (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                            {error}
                            <button
                                className="ml-2 underline"
                                onClick={() => {
                                    setError(null)
                                    loadEmployeeRequests()
                                }}
                            >
                                다시 시도
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#21262B]"></div>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-white shadow rounded-2xl flex items-center mb-3 px-8 py-1">
                                <div className="flex items-center font-nomal text-[#7A7F8A] mr-auto">
                                    <img src={BellIcon || "/placeholder.svg"} alt="Bell"
                                         className="w-[13.49px] h-[15.65px] mr-2"/>
                                    <span>총 {filteredRegistrations.length}건의 새로운 가입신청이 있습니다</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        placeholder="가입 신청자 이름, 전화번호, 아이디 검색"
                                        className="w-[370px] h-[40px] px-6 py-2 pr-10 border rounded-2xl font-nomal text-sm focus:outline-none text-gray-900 placeholder:text-[#D5D8DE]"
                                    />
                                    <img
                                        src={SearchIcon || "/placeholder.svg"}
                                        alt="Search"
                                        className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                    />
                                </div>
                                <div className="flex ml-8">
                                    <button className="px-2 py-1 mr-2 flex items-center"
                                            onClick={() => toggleSortOrder(false)}>
                                        <span
                                            className={`w-2 h-2 ${!isNewest ? "bg-[#21262B]" : "bg-gray-400"} rounded-full mr-2`}></span>
                                        <span
                                            className={!isNewest ? "text-[#21262B] font-medium" : "text-[#60697E]"}>오래된순</span>
                                    </button>
                                    <button className="px-2 py-1 flex items-center"
                                            onClick={() => toggleSortOrder(true)}>
                                        <span
                                            className={`w-2 h-2 ${isNewest ? "bg-[#21262B]" : "bg-gray-400"} rounded-full mr-2`}></span>
                                        <span
                                            className={isNewest ? "text-[#21262B] font-medium" : "text-[#60697E]"}>최신순</span>
                                    </button>
                                </div>
                            </div>

                            {filteredRegistrations.length === 0 ? (
                                <div className="bg-white shadow rounded-2xl p-8 text-center text-gray-500">
                                    {searchTerm ? "검색 결과가 없습니다." : "가입 신청 내역이 없습니다."}
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {filteredRegistrations.map((reg) => (
                                        <div key={reg.id} className="shadow rounded-2xl overflow-hidden">
                                            <div className="flex justify-between pt-10 pb-4 bg-white px-8">
                                                <div className="flex space-x-28">
                                                    <div className="space-y-1">
                                                        <div className="flex gap-1">
                                                            <span className="text-[#7A7F8A] w-16">이름</span>
                                                            <span className="text-[#21262B] font-bold">{reg.name}</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <span className="text-gray-500 w-16">전화번호</span>
                                                            <span
                                                                className="text-[#21262B] font-bold">{reg.phone}</span>
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

                                                    <div className="space-y-1">
                                                        <div className="flex gap-1">
                                                            <span className="text-[#7A7F8A] w-16">아이디</span>
                                                            <span
                                                                className="text-[#21262B] font-bold">{reg.userId || "정보 없음"}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => handleApprove(reg.userId)}
                                                        className="px-6 py-2 bg-[#E8F1F7] text-[#21262B] rounded-lg hover:bg-[#D8E3FA] transition-colors"
                                                    >
                                                        승인
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="w-full bg-white px-6">
                                                <img src={BottomLine || "/placeholder.svg"} alt="Bottom Line"
                                                     className="w-full h-[1px]"/>
                                            </div>

                                            <div
                                                className="p-6 bg-white flex justify-between items-center font-nomal text-[#7A7F8A]">
                                                <div className="flex items-center">
                                                    <img src={HomeIcon || "/placeholder.svg"} alt="Home"
                                                         className="w-[17px] h-[15px] mr-2"/>
                                                    <span>{reg.address}</span>
                                                </div>
                                                <button
                                                    className="flex items-center text-[#60697E] hover:text-red-600 pr-3 transition-colors"
                                                    onClick={() => handleReject(reg.userId)}
                                                >
                                                    <span>가입신청 반려하기</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="pb-32"/>
                </main>
            </div>
        </div>
    )
}

export default N_UserApprovalPage