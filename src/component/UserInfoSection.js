import React from "react";

// 더미 데이터 (필요한 경우 props로 전달받을 수도 있음)
const dummyUsers = [
    { id: 1, name: "정윤식", amount: 3200, date: "2025-02-03" },
    { id: 2, name: "김민수", amount: 1500, date: "2025-01-15" },
    { id: 3, name: "이영희", amount: 2300, date: "2025-03-10" },
];

const dummyOrders = [
    { id: 1, status: "배송준비중", date: "2025.03.01", productCode: "101", quantity: "1200ml일지" },
    { id: 2, status: "배송완료", date: "2025.02.19", productCode: "101", quantity: "600ml일지" },
];

const UserInfoSection = () => {
    return (
        <div className="grid grid-cols-3 gap-4">
            {/* 사용자 목록 */}
            <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg mb-3">사용자 (총 17,302명)</h3>
                <input
                    type="text"
                    placeholder="사용자 이름 검색"
                    className="w-full border rounded px-2 py-1 mb-3 text-sm"
                />
                <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
                    {dummyUsers.map((user) => (
                        <li key={user.id} className="p-2 border rounded hover:bg-gray-100 cursor-pointer">
                            <p>{user.name}</p>
                            <p className="text-xs text-gray-500">총 배출량 {user.amount}g</p>
                            <p className="text-xs text-gray-500">{user.date}</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 사용자 상세 정보 */}
            <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center gap-4 mb-4">
                    <img
                        src="https://via.placeholder.com/64"
                        alt="profile"
                        className="rounded-full w-16 h-16"
                    />
                    <div>
                        <p className="text-lg">정윤식</p>
                        <p className="text-sm text-gray-500">가입일자: 2025-02-03</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 text-sm text-center mb-4">
                    <div>
                        <p>3,200g</p>
                        <p className="text-gray-500">총 배출량</p>
                    </div>
                    <div>
                        <p>300p</p>
                        <p className="text-gray-500">누적 마일리지</p>
                    </div>
                    <div>
                        <p>60p</p>
                        <p className="text-gray-500">잔여 마일리지</p>
                    </div>
                </div>
                <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-400">
                    배출로그 차트 영역
                </div>
            </div>

            {/* 주문 내역 */}
            <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg mb-2">주문 내역</h3>
                <div className="text-sm space-y-2 max-h-[320px] overflow-y-auto">
                    {dummyOrders.map((order) => (
                        <div key={order.id} className="border rounded p-2">
                            <p
                                className={`text-xs mb-1 ${
                                    order.status === "배송준비중" ? "text-green-600" : "text-blue-600"
                                }`}
                            >
                                {order.status}
                            </p>
                            <p>주문일자: {order.date}</p>
                            <p>상품코드: {order.productCode} (수량 {order.quantity})</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserInfoSection;