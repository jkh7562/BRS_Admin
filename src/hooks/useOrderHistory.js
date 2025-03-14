import { useState, useEffect } from "react";
import { fetchOrderList, fetchOrderItemsByOrderId } from "../api/apiServices";

const useOrderHistory = (searchTerm) => {
    const [orders, setOrders] = useState([]);
    const [selectedUserOrders, setSelectedUserOrders] = useState([]);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                const data = await fetchOrderList();
                const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(sortedData);
            } catch (err) {
                setError("주문 데이터를 불러오는 중 오류 발생");
            }
            setLoading(false);
        };
        loadOrders();
    }, []);

    const handleUserClick = (userId) => {
        const userOrders = orders.filter(order => order.userId === userId);
        setSelectedUserOrders(userOrders);
        setSelectedOrderDetails(null);
    };

    const handleOrderClick = (orderId) => {
        fetchOrderDetails(orderId);
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const details = await fetchOrderItemsByOrderId(orderId);
            const groupedDetails = details.reduce((acc, detail) => {
                const key = `${detail.orderId}-${detail.itemId}`;
                if (!acc[key]) {
                    acc[key] = { ...detail, count: 0, totalPrice: 0 }; // totalPrice 초기화
                }
                acc[key].count += detail.count;
                acc[key].totalPrice += detail.price * detail.count; // 총 가격 계산
                return acc;
            }, {});
            setSelectedOrderDetails(Object.values(groupedDetails));
        } catch (err) {
            setError("주문 상세 정보를 불러오는 중 오류 발생");
        }
    };

    const getTimeDifference = (date) => {
        const now = new Date();
        const orderDate = new Date(date);
        const diff = now - orderDate;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        return `${days}일 전`;
    };

    const getOrderState = (state) => {
        switch (state) {
            case 0: return "주문 요청";
            case 1: return "주문 처리 중";
            case 2: return "주문 완료";
            default: return "알 수 없음";
        }
    };

    const filteredUsers = [...new Set(orders.map(order => order.userId))]
        .filter(userId => userId.toLowerCase().includes(searchTerm.toLowerCase()));

    return {
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
    };
};

export default useOrderHistory;