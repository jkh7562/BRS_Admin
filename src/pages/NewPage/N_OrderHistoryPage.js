import { useState } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import HomeIcon from "../../assets/Home.png"
import BellIcon from "../../assets/가입알림.png"
import SearchIcon from "../../assets/검색.png"
import DownIcon from "../../assets/Down.png"
import BottomLine from "../../assets/Line_Bottom.png"

const N_OrderHistoryPage = () => {
    const [registrations, setRegistrations] = useState([])
    const [orders, setOrders] = useState([
        {
            id: 1,
            name: "홍길동",
            phone: "010-0000-0000",
            date: "2025/03/06",
            time: "오전 11:29",
            productCode: "101",
            productPrice: "5,000원",
            quantity: 2,
            totalPrice: "10,000 원",
            address: "충청남도 아산시 탕정면 선문로 221번길 70",
            isExpanded: false,
        },
        {
            id: 2,
            name: "홍길동",
            phone: "010-0000-0000",
            date: "2025/03/06",
            time: "오전 11:29",
            productCode: "104",
            productPrice: "5,000원",
            quantity: 1,
            totalPrice: "23,000 원",
            address: "충청남도 아산시 탕정면 선문로 221번길 70",
            isExpanded: false,
        },
        {
            id: 3,
            name: "홍길동",
            phone: "010-0000-0000",
            date: "2025/03/06",
            time: "오전 11:29",
            productCode: "101",
            productPrice: "5,000원",
            quantity: 2,
            totalPrice: "10,000 원",
            address: "충청남도 아산시 탕정면 선문로 221번길 70",
            isExpanded: false,
        },
        {
            id: 4,
            name: "홍길동",
            phone: "010-0000-0000",
            date: "2025/03/06",
            time: "오전 11:29",
            productCode: "104",
            productPrice: "5,000원",
            quantity: 1,
            totalPrice: "23,000 원",
            address: "충청남도 아산시 탕정면 선문로 221번길 70",
            isExpanded: false,
        },
        {
            id: 5,
            name: "홍길동",
            phone: "010-0000-0000",
            date: "2025/03/06",
            time: "오전 11:29",
            productCode: "101",
            productPrice: "5,000원",
            quantity: 2,
            totalPrice: "10,000 원",
            address: "충청남도 아산시 탕정면 선문로 221번길 70",
            isExpanded: false,
        },
    ])

    const toggleOrderDetails = (id: number) => {
        setOrders(orders.map((order) => (order.id === id ? { ...order, isExpanded: !order.isExpanded } : order)))
    }

    // 정렬 상태 추가 (true: 최신순, false: 오래된순)
    const [isNewest, setIsNewest] = useState(true)

    const handleApprove = (id: number) => {
        // 승인 처리 로직
        console.log(`사용자 ${id} 승인됨`)
    }

    // 정렬 방식 변경 함수
    const toggleSortOrder = (newest: boolean) => {
        setIsNewest(newest)
        // 여기에 실제 정렬 로직을 추가할 수 있습니다
    }

    return (
        <div className="flex min-h-screen w-full bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-6">
                    <p className="font-bold text-[#272F42] text-xl">주문내역</p>
                    <div>
                        <div className="bg-white shadow rounded-2xl flex items-center mb-3 px-8 py-1">
                            <div className="flex items-center font-nomal text-[#7A7F8A] mr-auto">
                                <img src={BellIcon || "/placeholder.svg"} alt="Bell"
                                     className="w-[13.49px] h-[15.65px] mr-2"/>
                                <span>총 {orders.length}건의 새로운 주문내역이 있습니다</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="사용자 이름, 전화번호 검색"
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
                                <button className="px-2 py-1 flex items-center" onClick={() => toggleSortOrder(true)}>
                                        <span
                                            className={`w-2 h-2 ${isNewest ? "bg-[#21262B]" : "bg-gray-400"} rounded-full mr-2`}></span>
                                    <span
                                        className={isNewest ? "text-[#21262B] font-medium" : "text-[#60697E]"}>최신순</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white shadow rounded-2xl overflow-hidden">
                                    <div className="flex justify-between pt-10 pb-4 bg-white px-8">
                                        <div className="flex space-x-28">
                                            <div className="space-y-1">
                                                <div className="flex gap-1">
                                                    <span className="text-[#7A7F8A] w-16">이름</span>
                                                    <span className="text-[#21262B] font-bold">{order.name}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="text-gray-500 w-16">전화번호</span>
                                                    <span className="text-[#21262B] font-bold">{order.phone}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex gap-1">
                                                    <span className="text-[#7A7F8A] w-16">주문 일자</span>
                                                    <span className="font-bold">{order.date}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="text-[#7A7F8A] w-16"></span>
                                                    <span className="font-bold">{order.time}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex gap-1">
                                                    <span className="text-[#7A7F8A] w-16">상품코드</span>
                                                    <span className="font-bold">
                                {order.productCode} ({order.productPrice})
                              </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="text-[#7A7F8A] w-16">수량</span>
                                                    <span className="font-bold">{order.quantity}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end">
                                            <div className="text-right font-bold text-xl">{order.totalPrice}</div>
                                        </div>
                                    </div>

                                    <div className="w-full bg-white px-6">
                                        <img src={BottomLine || "/placeholder.svg"} alt="Bottom Line"
                                             className="w-full h-[1px]"/>
                                    </div>

                                    <div className="p-6 bg-white flex items-center justify-between">
                                        <div className="flex items-center text-[#7A7F8A]">
                                            <img src={HomeIcon || "/placeholder.svg"} alt="Home"
                                                 className="w-[17px] h-[15px] mr-2"/>
                                            <span>{order.address}</span>
                                        </div>
                                        <button
                                            className="flex items-center text-[#60697E] hover:text-gray-700"
                                            onClick={() => toggleOrderDetails(order.id)}
                                        >
                                            <span>주문내역 상세보기</span>
                                            <img
                                                src={DownIcon || "/placeholder.svg"}
                                                alt="Down"
                                                className={`w-3 h-2 ml-2 transition-transform ${order.isExpanded ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    </div>

                                    {order.isExpanded && (
                                        <div className="px-8 py-6 bg-white border-t">
                                            <h3 className="font-bold mb-4">주문 상세 정보</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[#7A7F8A]">주문 번호</p>
                                                    <p className="font-medium">
                                                        ORD-{order.id}-{new Date().getFullYear()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[#7A7F8A]">결제 방법</p>
                                                    <p className="font-medium">신용카드</p>
                                                </div>
                                                <div>
                                                    <p className="text-[#7A7F8A]">주문 상태</p>
                                                    <p className="font-medium">배송 준비중</p>
                                                </div>
                                                <div>
                                                    <p className="text-[#7A7F8A]">배송 예정일</p>
                                                    <p className="font-medium">2025/03/08</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="pb-32"/>
                    </div>`
                </main>
            </div>
        </div>
    )
}

export default N_OrderHistoryPage