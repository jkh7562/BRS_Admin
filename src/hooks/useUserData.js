import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchBoxLog } from "../slices/boxLogSlice";
import { fetchBoxes } from "../slices/boxSlice";
import { fetchOrdersByUserId, fetchOrderItemsByOrderId } from "../api/apiServices";

const useUserData = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const users = useSelector(state => state.users.users);
    const boxLogs = useSelector(state => state.boxLog.logs);
    const boxList = useSelector(state => state.boxes.list);
    const status = useSelector(state => state.boxLog.status);

    const [userLogs, setUserLogs] = useState([]);
    const [graphData, setGraphData] = useState([]);
    const [filterType, setFilterType] = useState("day");
    const [userOrders, setUserOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const userData = users.find(user => user.id === id);

    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchBoxLog());
        }
        if (boxList.length === 0) {
            dispatch(fetchBoxes());
        }

        if (userData && boxLogs.length > 0) {
            const filteredLogs = boxLogs
                .filter(log => log.userId === userData.id)
                .map(log => ({
                    ...log,
                    boxName: boxList.find(box => box.id === log.boxId)?.name || "알 수 없음",
                }));

            setUserLogs(filteredLogs);
            processChartData(filteredLogs, filterType);
        }
    }, [userData, boxLogs, boxList, status, dispatch, id, filterType]);

    const processChartData = (data, type) => {
        let groupedData = {};

        data.forEach(log => {
            const date = new Date(log.date);
            let key;

            if (type === "day") {
                key = date.toISOString().split("T")[0];
            } else if (type === "month") {
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
            } else {
                key = `${date.getFullYear()}`;
            }

            if (!groupedData[key]) {
                groupedData[key] = { date: key, disposal: 0 };
            }

            if (log.type === 1) {
                groupedData[key].disposal += log.value;
            }
        });

        const chartData = Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
        setGraphData(chartData);
    };

    useEffect(() => {
        const loadOrders = async () => {
            if (userData?.id) {
                try {
                    setLoadingOrders(true);
                    const orders = await fetchOrdersByUserId(userData.id);
                    setUserOrders(orders);

                    const details = await Promise.all(
                        orders.map(async (order) => {
                            const items = await fetchOrderItemsByOrderId(order.id);
                            return items;
                        })
                    );

                    setOrderDetails(details.flat());
                } catch (error) {
                    console.error(" 사용자 주문 내역 조회 실패:", error);
                } finally {
                    setLoadingOrders(false);
                }
            }
        };

        loadOrders();
    }, [userData]);

    return {
        userData,
        userLogs,
        graphData,
        filterType,
        setFilterType,
        userOrders,
        orderDetails,
        loadingOrders,
    };
};

export default useUserData;