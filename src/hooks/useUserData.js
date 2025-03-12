import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchBoxLog } from "../slices/boxLogSlice";
import { fetchBoxes } from "../slices/boxSlice"; // ✅ 박스 정보 불러오기 추가
import { fetchOrdersByUserId, fetchOrderItemsByOrderId } from "../api/apiServices"; // ✅ 주문 내역 관련 API 추가

const useUserData = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const users = useSelector(state => state.users.users);
    const boxLogs = useSelector(state => state.boxLog.logs);
    const boxList = useSelector(state => state.boxes.list); // ✅ 박스 리스트 추가
    const status = useSelector(state => state.boxLog.status);

    const [userLogs, setUserLogs] = useState([]);
    const [graphData, setGraphData] = useState([]);
    const [filterType, setFilterType] = useState("day");
    const [userOrders, setUserOrders] = useState([]); // ✅ 주문 내역
    const [orderDetails, setOrderDetails] = useState([]); // ✅ 주문 상세 정보
    const [loadingOrders, setLoadingOrders] = useState(true); // ✅ 주문 데이터 로딩 상태

    const userData = users.find(user => user.id === id);

    useEffect(() => {
        console.log("📌 Redux 상태 - users:", users);
        console.log("📌 Redux 상태 - boxLogs:", boxLogs);

        if (status === "idle") {
            dispatch(fetchBoxLog());
        }
        if (boxList.length === 0) {
            dispatch(fetchBoxes()); // ✅ 박스 정보 요청
        }

        if (userData && boxLogs.length > 0) {
            console.log("🔎 현재 사용자 ID:", userData.id);

            const filteredLogs = boxLogs
                .filter(log => log.userId === userData.id) // ✅ `boxLogId?.userId` 대신 `userId` 직접 사용
                .map(log => ({
                    ...log,
                    boxName: boxList.find(box => box.id === log.boxId)?.name || "알 수 없음", // ✅ 박스 ID 직접 참조
                }));

            console.log("📌 필터링된 배출 로그:", filteredLogs);
            setUserLogs(filteredLogs);

            processChartData(filteredLogs, filterType);
        }
    }, [userData, boxLogs, boxList, status, dispatch, id, filterType]);

    // ✅ 선택된 필터(일/월/년)에 맞게 데이터 처리
    const processChartData = (data, type) => {
        let groupedData = {};

        data.forEach(log => {
            const date = new Date(log.date); // ✅ `boxLogId.date` 대신 `log.date` 직접 사용
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
                groupedData[key].disposal += log.value; // ✅ `value` 또는 `weight` 사용
            }
        });

        const chartData = Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log("📌 생성된 그래프 데이터:", chartData);
        setGraphData(chartData);
    };

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

    return {
        userData,
        userLogs,
        graphData,
        filterType,
        setFilterType,
        userOrders,
        orderDetails,
        loadingOrders
    };
};

export default useUserData;
