import React from "react";
import NavigationBar from "../component/NavigationBar";
import useOrderHistory from "../hooks/useOrderHistory";

const OrderHistoryPage = () => {
    const {
        searchTerm,
        setSearchTerm,
        orders,
        selectedOrder,
        orderDetails,
        loading,
        error,
        handleOrderClick,
    } = useOrderHistory();

    return (
        <div className="min-h-screen w-screen flex flex-col bg-gray-100">
            {/* ✅ 네비게이션 바 */}
            <NavigationBar />

            <div className="mt-16 p-4 flex justify-center">
                <div className="w-4/5 flex space-x-4">
                    {/* ✅ 좌측 - 주문 목록 */}
                    <div className="w-2/5 bg-white shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4">📋 주문 내역</h2>

                        {/* ✅ 검색 입력 필드 */}
                        <input
                            type="text"
                            placeholder="사용자 ID 검색"
                            className="w-full px-4 py-2 border rounded mb-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* ✅ 로딩 및 오류 메시지 */}
                        {loading && <p>⏳ 데이터를 불러오는 중...</p>}
                        {error && <p className="text-red-500">🚨 {error}</p>}

                        {/* ✅ 주문 목록 */}
                        {!loading && !error && (
                            <div className="bg-gray-50 shadow-md rounded p-2">
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className={`flex justify-between items-center border-b p-2 cursor-pointer ${
                                                selectedOrder?.id === order.id ? "bg-blue-100" : ""
                                            }`}
                                            onClick={() => handleOrderClick(order)}
                                        >
                                            <span>{order.userId} - {new Date(order.date).toLocaleString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>📋 일치하는 주문이 없습니다.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ✅ 우측 - 주문 상세 정보 */}
                    <div className="w-3/5 bg-white shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4">📦 상세 정보</h2>

                        {selectedOrder ? (
                            <div className="bg-gray-50 shadow-md rounded p-4">
                                {orderDetails.length > 0 ? (
                                    orderDetails.map((detail) => (
                                        <div key={detail.id} className="border rounded p-4 mb-4">
                                            <p className="mb-2"><strong>id:</strong> {detail.id}</p>
                                            <p className="mb-2"><strong>주문번호:</strong> {detail.orderId}</p>
                                            <p className="mb-2"><strong>아이템 번호:</strong> {detail.itemId}</p>
                                            <p className="mb-2"><strong>수량:</strong> {detail.count}</p>
                                            <p className="mb-2"><strong>가격:</strong> {detail.price}원</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>📌 해당 주문의 상세 정보가 없습니다.</p>
                                )}
                            </div>
                        ) : (
                            <p>📌 주문 내역을 선택하세요.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryPage;
