import React, { useEffect, useState } from "react";
import NavigationBar from "../component/NavigationBar";
import useUserData from "../hooks/useUserData";
import { fetchOrdersByUserId, fetchOrderItemsByOrderId } from "../api/apiServices";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const UserPage = () => {
    const { userData, userLogs, graphData, filterType, setFilterType } = useUserData();
    const [userOrders, setUserOrders] = useState([]); // ✅ 주문 내역
    const [orderDetails, setOrderDetails] = useState([]); // ✅ 주문 상세 정보
    const [loadingOrders, setLoadingOrders] = useState(true);

    // ✅ 사용자 주문 내역 가져오기
    useEffect(() => {
        const loadOrders = async () => {
            if (userData?.id) {
                try {
                    setLoadingOrders(true);
                    const orders = await fetchOrdersByUserId(userData.id);
                    setUserOrders(orders);

                    // ✅ 각 주문의 상세 정보 가져오기
                    const details = await Promise.all(
                        orders.map(async (order) => {
                            const items = await fetchOrderItemsByOrderId(order.id);
                            return items;
                        })
                    );

                    // ✅ 주문 상세 정보 저장 (배열 평탄화)
                    setOrderDetails(details.flat());
                } catch (error) {
                    console.error("🚨 사용자 주문 내역 조회 실패:", error);
                } finally {
                    setLoadingOrders(false);
                }
            }
        };

        loadOrders();
    }, [userData]);

    if (!userData) return <div className="h-screen w-screen flex justify-center items-center">⏳ 로딩 중...</div>;

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-100">
            <NavigationBar />

            <div className="mt-16 p-4">
                {/* ✅ 사용자 정보 섹션 */}
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

                {/* ✅ 배출 그래프 + 배출 로그 + 주문 내역 */}
                <div className="grid grid-cols-7 gap-4">
                    {/* ✅ 배출 그래프 */}
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

                    {/* ✅ 배출 로그 (표 복원) */}
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

                    {/* 주문 내역 */}
                    <div className="bg-white shadow-md p-4 border col-span-2">
                        <p className="font-bold mb-2">주문 내역</p>
                        {loadingOrders ? (
                            <p className="text-sm">⏳ 주문 내역 불러오는 중...</p>
                        ) : orderDetails.length > 0 ? (
                            orderDetails.map(order => (
                                <div key={order.id} className="border p-4 mb-2 bg-gray-50 shadow-sm rounded-md">
                                    <p className="text-sm"><strong>id:</strong> {order.id}</p>
                                    <p className="text-sm"><strong>주문번호:</strong> {order.orderId}</p>
                                    <p className="text-sm"><strong>아이템 번호:</strong> {order.itemId}</p>
                                    <p className="text-sm"><strong>수량:</strong> {order.count}</p>
                                    <p className="text-sm font-bold"><strong>가격:</strong> {order.price}원</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm">📌 주문 내역이 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPage;
