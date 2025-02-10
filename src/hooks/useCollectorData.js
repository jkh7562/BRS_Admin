import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchBoxLog } from "../slices/boxLogSlice";

const useCollectorData = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const collectors = useSelector(state => state.users.collectors);
    const boxLogs = useSelector(state => state.boxLog.logs);
    const status = useSelector(state => state.boxLog.status);

    const [collectorLogs, setCollectorLogs] = useState([]);
    const [graphData, setGraphData] = useState([]);
    const [filterType, setFilterType] = useState("day"); // 필터 상태 추가

    const collectorData = collectors.find(collector => collector.id === id);

    useEffect(() => {
        console.log("📌 Redux 상태 - collectors:", collectors);
        console.log("📌 Redux 상태 - boxLogs:", boxLogs);

        if (status === "idle") {
            dispatch(fetchBoxLog());
        }

        if (collectorData && boxLogs.length > 0) {
            console.log("🔎 현재 수거자 ID:", collectorData.id);

            // ✅ userId로 필터링
            const filteredLogs = boxLogs.filter(log => log.boxLogId?.userId === collectorData.id);
            console.log("📌 필터링된 수거 로그:", filteredLogs);
            setCollectorLogs(filteredLogs);

            // ✅ 필터 유형 반영하여 그래프 데이터 생성
            processChartData(filteredLogs, filterType);
        }
    }, [collectorData, boxLogs, status, dispatch, id, filterType]); // filterType이 변경될 때마다 실행

    // ✅ 그래프 데이터를 필터 유형에 따라 가공하는 함수
    const processChartData = (logs, type) => {
        let groupedData = {};

        logs.forEach((log) => {
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
                groupedData[key] = { date: key, collection: 0, disposal: 0 };
            }

            if (log.type === 0) {
                groupedData[key].collection += log.weight;
            } else {
                groupedData[key].disposal += log.weight;
            }
        });

        setGraphData(Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date)));
    };

    return { collectorData, collectorLogs, graphData, filterType, setFilterType };
};

export default useCollectorData;
