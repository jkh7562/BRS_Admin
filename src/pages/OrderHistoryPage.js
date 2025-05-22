import React, { useState, useEffect } from "react";
import NavigationBar from "../component/NavigationBar";
import useOrderHistory from "../hooks/useOrderHistory";

const OrderHistoryPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const {
        orders,
        selectedUserOrders,
        selectedOrderDetails,
        loading,
        error,
        handleUserClick,
        handleOrderClick,
        getTimeDifference,
        getOrderState,
        filteredUsers,
    } = useOrderHistory(searchTerm);

    const [orderTotals, setOrderTotals] = useState({});

    useEffect(() => {
        if (selectedOrderDetails) {
            const totals = selectedOrderDetails.reduce((acc, detail) => {
                if (!acc[detail.orderId]) {
                    acc[detail.orderId] = {
                        totalCount: 0,
                        totalPrice: 0,
                    };
                }
                acc[detail.orderId].totalCount += detail.count;
                acc[detail.orderId].totalPrice += detail.price * detail.count;
                return acc;
            }, {});
            setOrderTotals(totals);
        } else {
            setOrderTotals({});
        }
    }, [selectedOrderDetails]);

    const renderOrderActions = (order) => {
        switch (order.state) {
            case 0: // 주문 요청
                return (
                    <div>
                        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">수락</button>
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">거절</button>
                    </div>
                );
            case 1: // 주문 처리 중
                return (
                    <div>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">완료</button>
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">취소</button>
                    </div>
                );
            case 2: // 주문 완료
            default:
                return null; // 버튼 없음
        }
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-gray-100">
            <NavigationBar />
            <div className="mt-16 p-4 flex justify-center">
                <div className="w-4/5 flex space-x-4">
                    <div className="w-2/5 bg-white shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4">사용자별 주문 내역</h2>
                        <input
                            type="text"
                            placeholder="사용자 ID 검색"
                            className="w-full px-4 py-2 border rounded mb-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {loading && <p>⏳ 데이터를 불러오는 중...</p>}
                        {error && <p className="text-red-500"> {error}</p>}
                        {!loading && !error && (
                            <div className="bg-gray-50 shadow-md rounded p-2">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(userId => {
                                        const latestOrder = orders.find(order => order.userId === userId);
                                        return (
                                            <div
                                                key={userId}
                                                className="border-b p-2 cursor-pointer"
                                                onClick={() => handleUserClick(userId)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span>{userId}</span>
                                                    <span className="text-sm">
                                                        {latestOrder ? getTimeDifference(latestOrder.date) : " "}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p> 일치하는 사용자가 없습니다.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="w-3/5 bg-white shadow-md rounded p-6">
                        <h2 className="text-lg font-bold mb-4">상세 정보{/* - {selectedUserOrders[0]?.userId}*/}</h2>
                        {selectedUserOrders.length > 0 ? (
                            selectedUserOrders.map(order => {
                                const orderItems = selectedOrderDetails?.filter(detail => detail.orderId === order.id);
                                const total = orderTotals[order.id];

                                return (
                                    <div key={order.id} className="bg-gray-50 shadow-md rounded p-4 mb-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="mb-2 font-bold cursor-pointer" onClick={() => handleOrderClick(order.id)}>
                                                주문번호: {order.id} - {getOrderState(order.state)}
                                            </h3>
                                            {renderOrderActions(order)}
                                        </div>
                                        <p>주문 일자: {new Date(order.date).toLocaleString()}</p>
                                        {orderItems?.map((detail, index) => (
                                            <p key={index} className="mb-2">
                                                <strong>아이템 번호:</strong> {detail.itemId} - <strong>가격:</strong> {detail.price}원 - <strong>수량:</strong> {detail.count}
                                            </p>
                                        ))}
                                        {order.totalPrice && <p><strong>총 주문 가격:</strong> {order.totalPrice}원</p>}
                                    </div>
                                );
                            })
                        ) : (
                            <p>사용자를 선택하세요.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryPage;