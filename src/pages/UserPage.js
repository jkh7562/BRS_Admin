import React from "react";
import NavigationBar from "../component/NavigationBar";
import useUserData from "../hooks/useUserData";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const UserPage = () => {
    const {
        userData,
        userLogs,
        graphData,
        filterType,
        setFilterType,
        userOrders,
        orderDetails,
        loadingOrders,
    } = useUserData();

    if (!userData) return <div className="h-screen w-screen flex justify-center items-center">⏳ 로딩 중...</div>;

    const groupedOrders = orderDetails.reduce((acc, order) => {
        const orderId = order.orderId;
        if (!acc[orderId]) {
            acc[orderId] = { items: [], date: null, state: null };
        }
        acc[orderId].items.push(order);
        return acc;
    }, {});

    Object.keys(groupedOrders).forEach(orderId => {
        const order = userOrders.find(o => o.id === parseInt(orderId));
        if (order) {
            groupedOrders[orderId].date = order.date;
            groupedOrders[orderId].state = order.state;
        }
    });

    const getOrderState = (state) => {
        switch (state) {
            case 0: return "주문 요청";
            case 1: return "주문 확정";
            case 2: return "주문 완료";
            default: return "알 수 없음";
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-100">
            <NavigationBar />

            <div className="mt-16 p-4">
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white shadow-md p-4 text-center border">
                        <p className="font-bold">이름 :</p>
                        <p>{userData.name}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center border">
                        <p className="font-bold">가입일자 :</p>
                        <p>{userData.date ? userData.date.split("T")[0] : "정보 없음"}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center border">
                        <p className="font-bold">총 배출량 :</p>
                        <p>{userLogs.reduce((acc, log) => acc + log.value, 0)}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center border">
                        <p className="font-bold">누적 마일리지 :</p>
                        <p>{userData.point || 0}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center border">
                        <p className="font-bold">현재 마일리지 :</p>
                        <p>{userData.currentMileage || 0}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center border">
                        <p className="font-bold">사용한 마일리지 :</p>
                        <p>{userData.usedMileage || 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-4">
                    <div className="bg-white shadow-md p-4 border col-span-3">
                        <div className="flex justify-between items-center mb-4">
                            <p className="font-bold">배출 정보</p>
                            <div className="flex space-x-2">
                                <button className={`px-4 py-2 border rounded ${filterType === "day" ? "bg-gray-300" : ""}`}
                                        onClick={() => setFilterType("day")}>
                                    일
                                </button>
                                <button className={`px-4 py-2 border rounded ${filterType === "month" ? "bg-gray-300" : ""}`}
                                        onClick={() => setFilterType("month")}>
                                    월
                                </button>
                                <button className={`px-4 py-2 border rounded ${filterType === "year" ? "bg-gray-300" : ""}`}
                                        onClick={() => setFilterType("year")}>
                                    년
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={graphData}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="disposal" stroke="#FF5733" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white shadow-md p-4 border col-span-2">
                        <p className="font-bold mb-2">배출 로그</p>
                        <table className="w-full table-auto border-collapse border border-gray-200 text-sm">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-2 py-1">수거함 이름</th>
                                <th className="border border-gray-300 px-2 py-1">배출량</th>
                                <th className="border border-gray-300 px-2 py-1">배출 일자</th>
                            </tr>
                            </thead>
                            <tbody>
                            {userLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="border border-gray-300 px-2 py-1">{log.boxName}</td>
                                    <td className="border border-gray-300 px-2 py-1">{log.value}</td>
                                    <td className="border border-gray-300 px-2 py-1">{log.date ? log.date.split("T")[0] : "N/A"}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white shadow-md p-4 border col-span-2">
                        <p className="font-bold mb-2">주문 내역</p>
                        {loadingOrders ? (
                            <p className="text-sm">⏳ 주문 내역 불러오는 중...</p>
                        ) : Object.keys(groupedOrders).length > 0 ? (
                            Object.keys(groupedOrders).map(orderId => {
                                const order = groupedOrders[orderId];
                                const totalCount = order.items.reduce((acc, item) => acc + item.count, 0);
                                const totalPrice = order.items.reduce((acc, item) => acc + item.price * item.count, 0);

                                return (
                                    <div key={orderId} className="border p-4 mb-2 bg-gray-50 shadow-sm rounded-md">
                                        <p className="text-sm"><strong>주문번호:</strong> {orderId}</p>
                                        <p className="text-sm"><strong>주문일자:</strong> {order.date ? new Date(order.date).toLocaleString() : "정보 없음"}</p>
                                        <p className="text-sm"><strong>주문상태:</strong> {getOrderState(order.state)}</p>
                                        {order.items.map(item => (
                                            <div key={item.id} className="text-sm">
                                                <span>{item.itemId} (수량: {item.count}, 가격: {item.price}원)</span>
                                            </div>
                                        ))}
                                        <p className="text-sm font-bold"><strong>총 수량:</strong> {totalCount}</p>
                                        <p className="text-sm font-bold"><strong>총 가격:</strong> {totalPrice}원</p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm"> 주문 내역이 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPage;