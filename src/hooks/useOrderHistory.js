import { useState, useEffect } from "react";
import { fetchOrderList, fetchOrderItemsByOrderId } from "../api/apiServices";

const useOrderHistory = () => {
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

    return {
        searchTerm,
        setSearchTerm,
        orders: filteredOrders,
        selectedOrder,
        orderDetails,
        loading,
        error,
        handleOrderClick,
    };
};

export default useOrderHistory;
