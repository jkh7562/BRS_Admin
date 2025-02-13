import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchBoxLog } from "../slices/boxLogSlice";
import { fetchBoxes } from "../slices/boxSlice"; // ✅ 박스 정보 불러오기 추가

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
                .filter(log => log.boxLogId?.userId === userData.id)
                .map(log => ({
                    ...log,
                    boxName: boxList.find(box => box.id === log.boxLogId.boxId)?.name || "알 수 없음", // ✅ 박스 이름 매핑
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
            const date = new Date(log.boxLogId.date);
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
                groupedData[key].disposal += log.weight;
            }
        });

        const chartData = Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log("📌 생성된 그래프 데이터:", chartData);
        setGraphData(chartData);
    };

    return { userData, userLogs, graphData, filterType, setFilterType };
};

export default useUserData;
