import { useState, useEffect } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import { fetchOrderList, fetchOrderItemsByOrderId, fetchOrdersByUserId } from "../../api/apiServices" // API 함수 import

const N_OrderHistoryPage = () => {
    // 상태 관리
    const [users, setUsers] = useState([])
    const [allOrders, setAllOrders] = useState([])
    const [userOrders, setUserOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [copiedUserId, setCopiedUserId] = useState(null)

    // 초기 데이터 로딩
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // 모든 주문 내역 가져오기
                const orderListData = await fetchOrderList()
                console.log("주문 내역 데이터:", orderListData)

                // 주문 데이터 포맷팅
                const formattedOrders = formatOrderData(orderListData)
                setAllOrders(formattedOrders)

                // 사용자 목록 추출 및 포맷팅
                const uniqueUsers = extractUniqueUsers(orderListData)
                setUsers(uniqueUsers)

                // 첫 번째 사용자의 주문 내역 로드
                if (uniqueUsers.length > 0) {
                    await loadUserOrders(uniqueUsers[0].userId)
                }

                setIsLoading(false)
            } catch (err) {
                console.error("데이터 로딩 실패:", err)
                setError("주문 내역을 불러오는데 실패했습니다.")
                setIsLoading(false)
            }
        }

        loadInitialData()
    }, [])

    // 주문 데이터 포맷팅 함수
    const formatOrderData = (orders) => {
        return orders.map((order) => {
            // 날짜 및 시간 포맷팅
            const dateObj = new Date(order.date)
            const formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}`
            const hours = dateObj.getHours()
            const ampm = hours >= 12 ? "오후" : "오전"
            const hour12 = hours % 12 || 12
            const formattedTime = `${ampm} ${hour12}:${String(dateObj.getMinutes()).padStart(2, "0")}:${String(dateObj.getSeconds()).padStart(2, "0")}`

            return {
                id: order.id,
                userId: order.userId, // API 응답의 userId 필드 사용
                date: formattedDate,
                time: formattedTime,
                totalAmount: order.totalPrice,
                items: [],
                expanded: false,
                originalDate: order.date, // 정렬을 위해 원본 날짜 보존
            }
        })
    }

    // 고유 사용자 추출 함수
    const extractUniqueUsers = (orders) => {
        const userMap = new Map()

        orders.forEach((order) => {
            if (!userMap.has(order.userId)) {
                // userId 필드를 사용하여 사용자 정보 추출
                userMap.set(order.userId, {
                    userId: order.userId, // userId 필드 사용
                    name: `${order.userId}`, // ID: 접두사 없이 userId만 표시
                    date: "",
                    time: "",
                    selected: false,
                })
            }
        })

        // 첫 번째 사용자 선택 상태로 설정
        const userArray = Array.from(userMap.values())
        if (userArray.length > 0) {
            userArray[0].selected = true
        }

        return userArray
    }

    // 사용자별 최근 주문 정보 업데이트 함수
    const updateUsersWithLatestOrderDates = () => {
        setUsers((prevUsers) => {
            return prevUsers.map((user) => {
                // 해당 사용자의 모든 주문 찾기 (userId로 비교)
                const userOrders = allOrders.filter((order) => order.userId === user.userId)

                // 주문이 없는 경우 기존 날짜 유지
                if (userOrders.length === 0) {
                    return user
                }

                // 주문을 날짜순으로 정렬 (최신순)
                const sortedOrders = [...userOrders].sort((a, b) => {
                    const dateA = new Date(a.originalDate)
                    const dateB = new Date(b.originalDate)
                    return dateB - dateA // 내림차순 (최신순)
                })

                // 가장 최근 주문의 날짜와 시간 가져오기
                const latestOrder = sortedOrders[0]

                // 사용자 정보 업데이트
                return {
                    ...user,
                    date: latestOrder.date,
                    time: latestOrder.time,
                }
            })
        })
    }

    // 사용자 주문 내역 로드 함수
    const loadUserOrders = async (userId) => {
        try {
            setIsLoading(true)

            // 사용자별 주문 내역 가져오기
            const userOrdersData = await fetchOrdersByUserId(userId)
            console.log(`사용자 ${userId}의 주문 내역:`, userOrdersData)

            // 주문 데이터 포맷팅
            const formattedUserOrders = formatOrderData(userOrdersData)

            // 각 주문의 상품 정보 가져오기
            const ordersWithItems = await Promise.all(
                formattedUserOrders.map(async (order) => {
                    try {
                        const orderItems = await fetchOrderItemsByOrderId(order.id)
                        console.log(`주문 ${order.id}의 상품 정보:`, orderItems)

                        // 상품 정보 포맷팅
                        const formattedItems = orderItems.map((item) => ({
                            name: `상품 ID: ${item.itemId || item.item_id || "정보 없음"}`, // itemId 또는 item_id 필드 사용
                            price: item.price,
                            quantity: item.count,
                            totalPrice: item.price * item.count,
                        }))

                        return {
                            ...order,
                            items: formattedItems,
                            expanded: formattedUserOrders.length === 1, // 주문이 하나만 있으면 자동으로 펼치기
                        }
                    } catch (err) {
                        console.error(`주문 ${order.id}의 상품 정보 로딩 실패:`, err)
                        return {
                            ...order,
                            items: [],
                            expanded: false,
                        }
                    }
                }),
            )

            // 날짜순으로 정렬 (최신순)
            const sortedOrders = [...ordersWithItems].sort((a, b) => {
                const dateA = new Date(a.originalDate)
                const dateB = new Date(b.originalDate)
                return dateB - dateA // 내림차순 (최신순)
            })

            setUserOrders(sortedOrders)
            setIsLoading(false)
        } catch (err) {
            console.error(`사용자 ${userId}의 주문 내역 로딩 실패:`, err)
            setError(`사용자 ${userId}의 주문 내역을 불러오는데 실패했습니다.`)
            setUserOrders([])
            setIsLoading(false)
        }
    }

    // 선택된 사용자 변경 함수
    const selectUser = async (userId) => {
        // 이미 선택된 사용자면 무시
        if (users.find((user) => user.userId === userId && user.selected)) {
            return
        }

        // 사용자 선택 상태 업데이트
        setUsers(
            users.map((user) => ({
                ...user,
                selected: user.userId === userId,
            })),
        )

        // 선택된 사용자의 주문 내역 로드
        await loadUserOrders(userId)
    }

    // 사용자 ID 복사 함수
    const handleCopyUserId = (e, userId) => {
        e.stopPropagation() // 이벤트 버블링 방지 (사용자 선택 방지)

        navigator.clipboard
            .writeText(userId)
            .then(() => {
                // 복사 성공 시 상태 업데이트
                setCopiedUserId(userId)

                // 1.5초 후 복사 상태 초기화
                setTimeout(() => {
                    setCopiedUserId(null)
                }, 1500)
            })
            .catch((err) => {
                console.error("복사 실패:", err)
            })
    }

    // 주문 상세 토글 함수
    const toggleOrderDetails = (orderId) => {
        setUserOrders(userOrders.map((order) => (order.id === orderId ? { ...order, expanded: !order.expanded } : order)))
    }

    // 선택된 사용자
    const selectedUser = users.find((user) => user.selected) || (users.length > 0 ? users[0] : null)

    // 검색 처리 함수
    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    // 검색어로 필터링된 사용자 목록
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // 사용자 데이터와 주문 데이터가 로드되면 사용자별 최근 주문 정보 업데이트
    useEffect(() => {
        if (allOrders.length > 0 && users.length > 0) {
            updateUsersWithLatestOrderDates()
        }
    }, [allOrders])

    return (
        <div className="flex min-h-screen w-full bg-[#F3F3F5]">
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
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6">
                    <p className="font-bold text-[#272F42] text-xl mb-6">주문내역</p>

                    {error && (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                            {error}
                            <button
                                className="ml-2 underline"
                                onClick={() => {
                                    setError(null)
                                    window.location.reload()
                                }}
                            >
                                다시 시도
                            </button>
                        </div>
                    )}

                    {isLoading && users.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#21262B]"></div>
                        </div>
                    ) : (
                        <div className="flex h-[calc(100vh-200px)]">
                            {/* 좌측 사용자 목록 */}
                            <div className="w-[390px] bg-white shadow overflow-hidden rounded-l-2xl h-full">
                                <div className="p-4 h-full flex flex-col">
                                    <div className="relative mb-4">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            placeholder="사용자 ID 검색"
                                            className="w-full h-[40px] px-4 py-2 pr-10 border rounded-lg font-normal text-sm focus:outline-none text-gray-900 placeholder:text-[#D5D8DE]"
                                        />
                                        <img
                                            src={SearchIcon || "/placeholder.svg"}
                                            alt="Search"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                        />
                                    </div>

                                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <div
                                                    key={user.userId}
                                                    onClick={() => selectUser(user.userId)}
                                                    className={`flex justify-between items-center p-3 cursor-pointer mb-2 rounded ${
                                                        user.selected ? "bg-[#F0F7FF]" : "hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="font-medium text-[#21262B]">{user.name}</p>
                                                        {user.date && user.time ? (
                                                            <>
                                                                <p className="text-xs text-[#7A7F8A]">{user.date}</p>
                                                                <p className="text-xs text-[#7A7F8A]">{user.time}</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-xs text-[#7A7F8A]">주문 내역 없음</p>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-400 relative">
                                                        <button onClick={(e) => handleCopyUserId(e, user.userId)}>
                                                            <img src={CopyIcon || "/placeholder.svg"} alt="Copy" className="w-4 h-5" />
                                                            {copiedUserId === user.userId && (
                                                                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                                                                    ✓
                                                                </div>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-[#7A7F8A]">
                                                {searchTerm ? "검색 결과가 없습니다." : "사용자가 없습니다."}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 우측 주문 상세 */}
                            <div className="flex-1 h-full">
                                <div className="bg-white shadow p-6 rounded-r-2xl h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="font-bold text-lg">주문 상세 내역</h2>
                                        {selectedUser && (
                                            <span className="text-sm text-[#7A7F8A]">
                        {selectedUser.name}님의 주문 내역 ({userOrders.length}건)
                      </span>
                                        )}
                                    </div>

                                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-64">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#21262B]"></div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {userOrders.length > 0 ? (
                                                    userOrders.map((order) => (
                                                        <div key={order.id} className="border rounded-lg overflow-hidden">
                                                            <div className="p-4 bg-white">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <div>
                                                                        <h3 className="font-medium">주문번호 - {order.id}</h3>
                                                                        <p className="text-sm text-[#7A7F8A]">
                                                                            주문일자 - {order.date} {order.time}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <span className="text-sm text-[#7A7F8A] mr-2">주문 상품</span>
                                                                        <button
                                                                            onClick={() => toggleOrderDetails(order.id)}
                                                                            className="text-[#60697E] flex items-center"
                                                                        >
                                                                            <span className="mr-1">{order.expanded ? "접기" : "펼치기"}</span>
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                width="12"
                                                                                height="12"
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                strokeWidth="2"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                className={`transition-transform ${order.expanded ? "rotate-180" : ""}`}
                                                                            >
                                                                                <polyline points="6 9 12 15 18 9"></polyline>
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {order.expanded && (
                                                                    <div className="border rounded-lg p-4 bg-[#FAFAFA]">
                                                                        {order.items.length > 0 ? (
                                                                            <div className="space-y-4">
                                                                                {order.items.map((item, index) => (
                                                                                    <div key={index} className="flex justify-between items-center">
                                                                                        <div className="flex items-center">
                                                                                            <div className="w-12 h-12 bg-[#E8F1F7] rounded flex items-center justify-center mr-4">
                                                                                                <span className="text-xs">이미지</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <p className="font-medium">{item.name}</p>
                                                                                                <p className="text-sm text-[#7A7F8A]">
                                                                                                    가격: {item.price} P 수량: {item.quantity}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="font-bold">소계: {item.totalPrice} P</div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-center text-[#7A7F8A] py-4">상품 정보가 없습니다.</p>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <div className="flex justify-start mt-4">
                                                                    <div className="font-bold text-lg">총액: {order.totalAmount} P</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-[#7A7F8A]">주문 내역이 없습니다.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default N_OrderHistoryPage