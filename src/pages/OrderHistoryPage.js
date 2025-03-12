import React, { useState, useEffect } from "react";
import NavigationBar from "../component/NavigationBar";
import { fetchOrderList, fetchOrderItemsByOrderId } from "../api/apiServices";

const OrderHistoryPage = () => {
    const [searchTerm, setSearchTerm] = useState(""); // ✅ 검색 상태
    const [orders, setOrders] = useState([]); // ✅ 주문 목록
    const [selectedOrder, setSelectedOrder] = useState(null); // ✅ 선택된 주문
    const [orderDetails, setOrderDetails] = useState([]); // ✅ 주문 상세 정보
    const [loading, setLoading] = useState(true); // ✅ 로딩 상태
    const [error, setError] = useState(null); // ✅ 오류 상태

    // ✅ 모든 주문 내역 가져오기
    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                const data = await fetchOrderList();
                setOrders(data);
            } catch (err) {
                setError("🚨 주문 데이터를 불러오는 중 오류 발생");
            }
            setLoading(false);
        };

        loadOrders();
    }, []);

    // ✅ 특정 주문 선택 시 상세 정보 불러오기
    const handleOrderClick = async (order) => {
        setSelectedOrder(order);
        setOrderDetails([]); // 기존 데이터 초기화

        try {
            const details = await fetchOrderItemsByOrderId(order.id);
            setOrderDetails(details);
        } catch (err) {
            setError("🚨 주문 상세 정보를 불러오는 중 오류 발생");
        }
    };

    // ✅ 검색어에 따라 주문 목록 필터링
    const filteredOrders = orders.filter((order) =>
        order.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
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
