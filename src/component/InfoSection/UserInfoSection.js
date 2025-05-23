"use client"

import { useState, useEffect } from "react"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import InfoIcon from "../../assets/추가정보2.png"
import LineIcon from "../../assets/구분선.png"
import VectorIcon from "../../assets/Vector.png"
import UserIcon from "../../assets/user.png"
import { findUserAll, getBoxLog, fetchOrdersByUserId } from "../../api/apiServices" // API 임포트

export default function UserInfoSection() {
    const [selectedPeriod, setSelectedPeriod] = useState("일")
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [userOrders, setUserOrders] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState({
        users: true,
        orders: false,
    })
    const [boxLogs, setBoxLogs] = useState(null)
    const [copiedId, setCopiedId] = useState(null)

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
                    loadUserOrders(filteredUsers[0].id)
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

    // 선택된 사용자의 주문 내역 불러오기
    const loadUserOrders = async (userId) => {
        if (!userId) return

        try {
            setLoading((prev) => ({ ...prev, orders: true }))
            const ordersData = await fetchOrdersByUserId(userId)
            console.log(`=== fetchOrdersByUserId(${userId}) API 응답 구조 확인 ===`)
            console.log("전체 데이터:", ordersData)
            console.log("데이터 타입:", typeof ordersData)
            console.log("배열 여부:", Array.isArray(ordersData))
            if (ordersData && ordersData.length > 0) {
                console.log("첫 번째 항목 구조:", JSON.stringify(ordersData[0], null, 2))
                console.log("첫 번째 항목의 키들:", Object.keys(ordersData[0]))
            }
            console.log("=======================================")

            // 새 API 구조 처리 (order와 items 구조)
            const formattedOrders = ordersData.map((orderData) => {
                const order = orderData.order || orderData
                const items = orderData.items || []

                // 상품 정보 추출
                const productInfo = items.length > 0 ? items[0] : {}

                return {
                    id: order.id,
                    date: order.date,
                    orderNumber: order.id,
                    productCode: productInfo.itemId || "정보 없음",
                    quantity: productInfo.count || 0,
                    usedPoints: order.totalPrice || 0,
                }
            })

            setUserOrders(formattedOrders || [])
        } catch (error) {
            console.error("주문 내역 로딩 실패:", error)
            setUserOrders([])
        } finally {
            setLoading((prev) => ({ ...prev, orders: false }))
        }
    }

    // 사용자 선택 핸들러
    const handleUserSelect = (user) => {
        setSelectedUser(user)
        loadUserOrders(user.id)
    }

    // 검색어로 사용자 필터링
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // 사용자의 총 배출량 계산 (예시 - 실제 데이터에 맞게 수정 필요)
    const getUserTotalDisposal = (userId) => {
        if (!boxLogs) return 0

        // 해당 사용자의 배출량 합산 로직 (예시)
        const userLogs = boxLogs.filter((log) => log.userId === userId)
        return userLogs.reduce((total, log) => total + (log.amount || 0), 0)
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
                                points={user.point || 0}
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

            {/* Main Content */}
            {selectedUser ? (
                <div className="flex-1 flex flex-col md:flex-row h-full">
                    {/* Center Section - User Stats */}
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
                                        마지막 이용일{" "}
                                        {userOrders.length > 0
                                            ? new Date(userOrders[0].date)
                                                .toLocaleDateString("ko-KR", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                })
                                                .replace(/\. /g, ".")
                                                .replace(/\.$/, "")
                                            : "이용 기록 없음"}
                                    </p>
                                </div>
                            </div>

                            {/* Stats Cards - 수정된 부분: 마일리지 관련 카드를 하나로 통합 */}
                            <div className="flex items-center mt-6 mb-6">
                                <StatCard
                                    title="총 배출량"
                                    value={`${getUserTotalDisposal(selectedUser.id) || 0}g`}
                                    number="1"
                                    tooltipVisible={tooltips.totalDisposal}
                                    onTooltipToggle={(e) => toggleTooltip("totalDisposal", e)}
                                    tooltipContent={
                                        <>
                                            <h3 className="font-bold text-sm mb-2">총 배출량</h3>
                                            <p className="text-xs">사용자가 지금까지 배출한 배터리의 총량입니다.</p>
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
                                        <button className="text-sm font-medium text-[#60697E]">
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

                                            {/* Chart bars - 실제 데이터로 대체 필요 */}
                                            <div className="absolute bottom-0 left-10 right-0 flex justify-between h-full items-end">
                                                {generateChartData(boxLogs, selectedUser.id, selectedPeriod).map((item, index) => (
                                                    <ChartBar key={index} height={item.height} date={item.date} />
                                                ))}
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
                        <div className="pb-4">
                            <h2 className="font-bold text-[#21262B] text-xl">주문 내역</h2>
                        </div>

                        {/* 주문 내역 영역에만 스크롤바 적용 */}
                        <div className="overflow-auto flex-1 custom-scrollbar">
                            {loading.orders ? (
                                <div className="text-center p-4">주문 내역을 불러오는 중...</div>
                            ) : userOrders.length === 0 ? (
                                <div className="text-center p-4">주문 내역이 없습니다.</div>
                            ) : (
                                userOrders.map((order, index) => (
                                    <ActivityItem
                                        key={index}
                                        date={new Date(order.date)
                                            .toLocaleDateString("ko-KR", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })
                                            .replace(/\. /g, ".")
                                            .replace(/\.$/, "")}
                                        time={new Date(order.date).toLocaleTimeString("ko-KR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                        code={order.orderNumber || order.id}
                                        amount={`${order.productCode || "정보 없음"} (수량${order.quantity || 0} : ${order.usedPoints || 0}마일리지)`}
                                    />
                                ))
                            )}
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
                <p className="text-sm text-[#60697E] font-normal text-gray-500 mt-1">총 배출량 {points}</p>
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

// 차트 바 컴포넌트
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

// 활동 내역 아이템 컴포넌트
function ActivityItem({ date, time, code, amount }) {
    return (
        <div>
            <table className="w-full text-sm border-collapse mt-4 mb-8">
                <tbody>
                <tr>
                    <td className="w-16 text-[#60697E] ">주문일자</td>
                    <td className="text-[#21262B]">
                        {date} {time}
                    </td>
                </tr>
                <tr>
                    <td className="w-16 text-[#60697E]">주문번호</td>
                    <td className="text-[#21262B]">{code}</td>
                </tr>
                <tr>
                    <td className="w-16 text-[#60697E]">상품코드</td>
                    <td className="text-[#21262B]">{amount}</td>
                </tr>
                </tbody>
            </table>
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

// 차트 데이터 생성 함수
function generateChartData(logs, userId, period) {
    if (!logs) {
        // 더미 데이터 반환
        return [
            {height: 10, date: "02.03"},
            {height: 8, date: "02.04"},
            {height: 8, date: "02.05"},
            {height: 0, date: "02.06"},
            {height: 0, date: "02.07"},
            {height: 20, date: "02.08"},
            {height: 25, date: "02.09"},
            {height: 0, date: "02.10"},
            {height: 0, date: "02.11"},
            {height: 30, date: "02.12"},
            {height: 0, date: "02.13"},
        ]
    }

    // 실제 로그 데이터를 기반으로 차트 데이터 생성 로직
    // 여기서는 예시로 더미 데이터를 반환합니다.
    // 실제 구현 시에는 logs 데이터를 분석하여 적절한 차트 데이터를 생성해야 합니다.
    const userLogs = logs.filter((log) => log.userId === userId)

    // 기간별 데이터 처리 로직 (예시)
    if (period === "일") {
        // 일별 데이터
        return [
            {height: 10, date: "02.03"},
            {height: 8, date: "02.04"},
            {height: 8, date: "02.05"},
            {height: 0, date: "02.06"},
            {height: 0, date: "02.07"},
            {height: 20, date: "02.08"},
            {height: 25, date: "02.09"},
            {height: 0, date: "02.10"},
            {height: 0, date: "02.11"},
            {height: 30, date: "02.12"},
            {height: 0, date: "02.13"},
        ]
    } else if (period === "월") {
        // 월별 데이터
        return [
            {height: 15, date: "01"},
            {height: 25, date: "02"},
            {height: 30, date: "03"},
            {height: 20, date: "04"},
            {height: 35, date: "05"},
            {height: 40, date: "06"},
            {height: 30, date: "07"},
            {height: 25, date: "08"},
            {height: 20, date: "09"},
            {height: 15, date: "10"},
            {height: 10, date: "11"},
        ]
    } else {
        // 연별 데이터
        return [
            {height: 20, date: "2020"},
            {height: 30, date: "2021"},
            {height: 40, date: "2022"},
            {height: 50, date: "2023"},
            {height: 60, date: "2024"},
            {height: 45, date: "2025"},
        ]
    }
}