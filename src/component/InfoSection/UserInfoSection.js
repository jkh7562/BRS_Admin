import { useState, useEffect } from "react"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import InfoIcon from "../../assets/추가정보2.png"
import LineIcon from "../../assets/구분선.png"
import UserIcon from "../../assets/user.png"
import { findUserAll, getBoxLog } from "../../api/apiServices" // API 임포트
import UserDischargeChart from "../chart/UserDischargeChart" // 새로운 차트 컴포넌트 임포트

export default function UserInfoSection() {
    const [selectedPeriod, setSelectedPeriod] = useState("일")
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState({
        users: true,
    })
    const [boxLogs, setBoxLogs] = useState(null)
    const [copiedId, setCopiedId] = useState(null)

    // 상태 추가 (기존 상태들 아래에)
    const [selectedBatteryType, setSelectedBatteryType] = useState("전체")

    const handleCopy = (e, userId, text) => {
        e.stopPropagation() // 이벤트 버블링 방지

        try {
            // 임시 텍스트 영역 생성
            const textArea = document.createElement("textarea")
            textArea.value = text

            // 화면 밖으로 위치시키기
            textArea.style.position = "fixed"
            textArea.style.left = "-999999px"
            textArea.style.top = "-999999px"
            document.body.appendChild(textArea)

            // 텍스트 선택 및 복사
            textArea.focus()
            textArea.select()

            const successful = document.execCommand("copy")

            // 임시 요소 제거
            document.body.removeChild(textArea)

            if (successful) {
                // 복사 성공
                setCopiedId(userId)
                setTimeout(() => {
                    setCopiedId(null)
                }, 1500)
            } else {
                console.error("execCommand 복사 실패")
            }
        } catch (err) {
            console.error("복사 실패:", err)
        }
    }

    // 툴팁 상태 관리 추가
    const [tooltips, setTooltips] = useState({
        totalDisposal: false,
        currentPoints: false,
    })

    // 툴팁 토글 함수
    const toggleTooltip = (name, e) => {
        e.stopPropagation() // 이벤트 버블링 방지
        setTooltips((prev) => ({
            ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), // 모든 툴팁 닫기
            [name]: !prev[name], // 선택한 툴팁만 토글
        }))
    }

    // 툴팁 외부 클릭 시 닫기 함수
    const handleClickOutside = (e) => {
        if (!e.target.closest(".tooltip-container")) {
            setTooltips((prev) => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}))
        }
    }

    // 컴포넌트가 마운트될 때 document에 이벤트 리스너 추가
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside)

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // 사용자 목록 불러오기
    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading((prev) => ({ ...prev, users: true }))
                const allUsers = await findUserAll()
                // ROLE_USER만 필터링
                const filteredUsers = allUsers.filter((user) => user.role === "ROLE_USER")
                setUsers(filteredUsers)

                // 첫 번째 사용자를 기본 선택
                if (filteredUsers.length > 0 && !selectedUser) {
                    setSelectedUser(filteredUsers[0])
                }
            } catch (error) {
                console.error("사용자 목록 로딩 실패:", error)
            } finally {
                setLoading((prev) => ({ ...prev, users: false }))
            }
        }

        loadUsers()
    }, [])

    // 박스 로그 불러오기
    useEffect(() => {
        const loadBoxLogs = async () => {
            try {
                const logs = await getBoxLog()
                setBoxLogs(logs)
            } catch (error) {
                console.error("박스 로그 로딩 실패:", error)
            }
        }

        loadBoxLogs()
    }, [])

    // 사용자 선택 핸들러
    const handleUserSelect = (user) => {
        setSelectedUser(user)
    }

    // 검색어로 사용자 필터링
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // getUserTotalDisposal 함수 수정
    const getUserTotalDisposal = (userId, batteryType = "전체") => {
        if (!boxLogs) return 0

        const userLogs = boxLogs.filter((entry) => {
            const { boxLog } = entry
            return boxLog && boxLog.type === "분리" && boxLog.userId === userId
        })

        let totalDisposal = 0
        userLogs.forEach(({ items }) => {
            if (items && Array.isArray(items)) {
                if (batteryType === "전체") {
                    const totalCount = items.reduce((sum, item) => sum + (item.count || 0), 0)
                    totalDisposal += totalCount
                } else {
                    const batteryTypeMap = {
                        건전지: "battery",
                        "방전 배터리": "discharged",
                        "미방전 배터리": "notDischarged",
                    }

                    const targetType = batteryTypeMap[batteryType]
                    const targetItem = items.find((item) => item.name === targetType)
                    totalDisposal += targetItem ? targetItem.count || 0 : 0
                }
            }
        })

        return totalDisposal
    }

    // getUserTotalDisposal 함수 아래에 추가
    const getUserLastUsageDate = (userId) => {
        if (!boxLogs) return null

        const userLogs = boxLogs.filter((entry) => {
            const { boxLog } = entry
            return boxLog && boxLog.userId === userId
        })

        if (userLogs.length === 0) return null

        // 가장 최근 날짜 찾기
        const latestLog = userLogs.reduce((latest, current) => {
            const currentDate = new Date(current.boxLog.date)
            const latestDate = new Date(latest.boxLog.date)
            return currentDate > latestDate ? current : latest
        })

        return latestLog.boxLog.date
    }

    // 툴팁 컴포넌트
    const Tooltip = ({ isVisible, content, position = "right" }) => {
        if (!isVisible) return null

        const positionClass = position === "right" ? "right-0 mt-2" : position === "left" ? "left-0 mt-2" : "right-0 mt-2"

        // 화살표 위치 클래스 추가
        const arrowPositionClass = position === "left" ? "left-1" : "right-1"

        return (
            <div
                className={`absolute ${positionClass} w-64 bg-white text-gray-800 rounded-md shadow-lg p-4`}
                style={{ zIndex: 99999 }}
            >
                <div className={`absolute -top-2 ${arrowPositionClass} w-4 h-4 bg-white transform rotate-45`}></div>
                {content}
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row bg-white h-[525px] rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-full md:w-[350px] h-full flex flex-col shadow-lg">
                <div className="p-3 pt-8">
                    <div className="flex items-center justify-between mx-4">
                        <h2 className="text-2xl text-[#21262B] font-bold">총 사용자 수 {users.length}명</h2>
                    </div>
                    <div className="relative mt-4">
                        <input
                            type="text"
                            placeholder="사용자 이름 검색"
                            className="w-full pl-4 pr-4 py-2 text-sm border border border-black/20 rounded-2xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-5 top-2 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg"} alt="검색" className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* 사용자 목록 영역에만 스크롤바 적용 */}
                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    {loading.users ? (
                        <div className="p-4 text-center">사용자 목록을 불러오는 중...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-4 text-center">사용자가 없습니다.</div>
                    ) : (
                        filteredUsers.map((user) => (
                            <UserListItem
                                key={user.id}
                                userId={user.id} // userId prop 추가
                                name={user.name}
                                points={getUserTotalDisposal(user.id)} // 실제 배출량 계산
                                date={new Date(user.date)
                                    .toLocaleDateString("ko-KR", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    })
                                    .replace(/\. /g, ".")
                                    .replace(/\.$/, "")}
                                isActive={selectedUser && selectedUser.id === user.id}
                                onClick={() => handleUserSelect(user)}
                                handleCopy={handleCopy} // handleCopy 함수 전달
                                copiedId={copiedId} // 복사 상태 전달
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Main Content - 전체 너비로 확장 */}
            {selectedUser ? (
                <div className="flex-1 h-full flex flex-col overflow-hidden p-4">
                    <div className="p-4">
                        {/* User profile section styled to match the image */}
                        <div className="flex">
                            <div className="mr-4">
                                <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                                    <img
                                        src={UserIcon || "/placeholder.svg"}
                                        alt="프로필 이미지"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div>
                                <h2 className="font-bold text-[#21262B] text-lg">{selectedUser.name}</h2>
                                <div className="flex">
                                    <p className="text-sm text-[#60697E]">
                                        <span className="font-bold">가입일자</span>{" "}
                                        <span className="font-normal">
                      {new Date(selectedUser.date)
                          .toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                          })
                          .replace(/\. /g, ".")
                          .replace(/\.$/, "")}
                    </span>
                                    </p>
                                </div>
                            </div>
                            <div className="ml-auto pt-7 pr-2">
                                <p className="text-sm font-medium text-gray-500">
                                    마지막 이용일 {(() => {
                                    const lastUsageDate = getUserLastUsageDate(selectedUser.id)
                                    return lastUsageDate
                                        ? new Date(lastUsageDate)
                                            .toLocaleDateString("ko-KR", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })
                                            .replace(/\. /g, ".")
                                            .replace(/\.$/, "")
                                        : "이용 기록 없음"
                                })()}
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards - 수정된 부분: 마일리지 관련 카드를 하나로 통합 */}
                        <div className="flex items-center mt-6 mb-6">
                            <StatCard
                                title={`총 배출량 (${selectedBatteryType})`}
                                value={`${getUserTotalDisposal(selectedUser.id, selectedBatteryType) || 0}개`}
                                number="1"
                                tooltipVisible={tooltips.totalDisposal}
                                onTooltipToggle={(e) => toggleTooltip("totalDisposal", e)}
                                tooltipContent={
                                    <>
                                        <h3 className="font-bold text-sm mb-2">총 배출량</h3>
                                        <p className="text-xs">
                                            사용자가 지금까지 배출한 {selectedBatteryType === "전체" ? "모든 " : `${selectedBatteryType} `}
                                            배터리의 총 개수입니다.
                                        </p>
                                    </>
                                }
                                tooltipPosition="left"
                            />
                            <div className="h-12 flex items-center">
                                <img src={LineIcon || "/placeholder.svg"} alt="구분선" className="h-full mx-11" />
                            </div>
                            <StatCard
                                title="현재 마일리지"
                                value={`${selectedUser.point || 0}p`}
                                number="1"
                                tooltipVisible={tooltips.currentPoints}
                                onTooltipToggle={(e) => toggleTooltip("currentPoints", e)}
                                tooltipContent={
                                    <>
                                        <h3 className="font-bold text-sm mb-2">현재 마일리지</h3>
                                        <p className="text-xs">사용자가 현재 보유한 마일리지입니다.</p>
                                    </>
                                }
                            />
                        </div>

                        {/* Chart Section */}
                        <div className="mb-3">
                            <div className="tabs">
                                {/* 배터리 타입 선택 탭 - 밑줄 스타일로 개선 */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <div className="absolute bottom-0 left-0 w-full border-b border-gray-200" />
                                        <div className="flex gap-6">
                                            {["전체", "건전지", "방전 배터리", "미방전 배터리"].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setSelectedBatteryType(type)}
                                                    className={`pb-2 text-sm font-medium transition-colors ${
                                                        selectedBatteryType === type
                                                            ? "border-b-2 border-black text-[#21262B]"
                                                            : "text-[#60697E] hover:text-[#21262B]"
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 시간 단위 선택 - 크기 축소 및 스타일 개선 */}
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                        {["연", "월", "일"].map((period) => (
                                            <button
                                                key={period}
                                                onClick={() => setSelectedPeriod(period)}
                                                className={`px-3 py-1 text-sm font-medium transition-colors ${
                                                    selectedPeriod === period
                                                        ? "bg-[#21262B] text-white"
                                                        : "bg-white text-[#60697E] hover:bg-gray-50"
                                                }`}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="tab-content">
                                    {/* 실제 차트 컴포넌트로 교체 */}
                                    <UserDischargeChart
                                        boxLogs={boxLogs}
                                        userId={selectedUser.id}
                                        selectedPeriod={selectedPeriod}
                                        selectedBatteryType={selectedBatteryType}
                                    />

                                    {/* Slider pagination */}
                                    <div className="flex items-center justify-center mt-4">
                                        <button className="px-2 text-sm text-gray-400 hover:text-gray-600">&lt;</button>
                                        <div className="w-64 h-2 bg-gray-200 rounded-full relative mx-2">
                                            <div className="absolute left-0 w-1/3 h-full bg-gray-700 rounded-full"></div>
                                        </div>
                                        <button className="px-2 text-sm text-gray-400 hover:text-gray-600">&gt;</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p>사용자를 선택해주세요.</p>
                </div>
            )}

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

// 사용자 목록 아이템 컴포넌트
function UserListItem({ userId, name, points, date, isActive, onClick, handleCopy, copiedId }) {
    return (
        <div
            className={`p-4 border-b flex items-center justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div>
                <h3 className="text-base text-[#21262B] font-bold">{name}</h3>
                <p className="text-sm text-[#60697E] font-normal text-gray-500 mt-1">총 배출량 {points}개</p>
                <p className="text-sm text-[#60697E] font-normal text-gray-500">{date}</p>
            </div>
            <div className="pb-10 text-gray-400 relative">
                <button onClick={(e) => handleCopy(e, userId, name)}>
                    <img src={CopyIcon || "/placeholder.svg"} alt="복사" className="w-4 h-5" />
                </button>
                {copiedId === userId && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                        ✓
                    </div>
                )}
            </div>
        </div>
    )
}

// 통계 카드 컴포넌트 - 툴팁 기능 추가
function StatCard({
                      title,
                      value,
                      number,
                      tooltipVisible,
                      onTooltipToggle,
                      tooltipContent,
                      tooltipPosition = "right",
                  }) {
    return (
        <div className="py-4 relative">
            <div className="flex items-center justify-start gap-2 mb-2">
                <span className="text-sm font-normal text-[#60697E]">{title}</span>
                <div className="tooltip-container relative">
                    <img
                        src={InfoIcon || "/placeholder.svg"}
                        alt="정보"
                        className="w-4 h-4 object-contain cursor-pointer"
                        onClick={onTooltipToggle}
                    />
                    {tooltipVisible && (
                        <div
                            className={`absolute ${tooltipPosition === "left" ? "left-0" : "right-0"} mt-2 w-64 bg-white text-gray-800 rounded-md shadow-lg p-4`}
                            style={{ zIndex: 99999, position: "absolute" }}
                        >
                            <div
                                className={`absolute -top-2 ${tooltipPosition === "left" ? "left-1" : "right-1"} w-4 h-4 bg-white transform rotate-45`}
                            ></div>
                            {tooltipContent}
                        </div>
                    )}
                </div>
            </div>
            <div className="text-[22px] text-[#21262B] font-bold">{value}</div>
        </div>
    )
}