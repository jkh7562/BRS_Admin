import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchBoxLog } from "../slices/boxLogSlice";
import { fetchBoxes } from "../slices/boxSlice"; // ✅ 박스 데이터 가져오기

const useCollectorData = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    // ✅ Redux 상태 가져오기
    const collectors = useSelector(state => state.users.collectors);
    const boxLogs = useSelector(state => state.boxLog.logs);
    const boxes = useSelector(state => state.boxes.list); // ✅ 박스 데이터 가져오기
    const boxLogStatus = useSelector(state => state.boxLog.status);
    const boxStatus = useSelector(state => state.boxes.status);

    const [collectorLogs, setCollectorLogs] = useState([]);
    const [graphData, setGraphData] = useState([]);
    const [filterType, setFilterType] = useState("day");

    const collectorData = collectors.find(collector => collector.id === id);

    useEffect(() => {
        console.log("📌 Redux 상태 - collectors:", collectors);
        console.log("📌 Redux 상태 - boxLogs:", boxLogs);
        console.log("📦 Redux 상태 - boxes:", boxes);

        if (boxLogStatus === "idle") {
            dispatch(fetchBoxLog());
        }

        if (boxStatus === "idle") {
            dispatch(fetchBoxes()); // ✅ 박스 데이터도 불러오기
        }

        if (collectorData && boxLogs.length > 0 && boxes.length > 0) {
            console.log("🔎 현재 수거자 ID:", collectorData.id);

            // ✅ userId로 필터링
            const filteredLogs = boxLogs.filter(log => log.userId === collectorData.id);
            console.log("📌 필터링된 수거 로그:", filteredLogs);

            // ✅ 수거함 ID를 이름으로 변환하여 저장
            const logsWithBoxNames = filteredLogs.map(log => ({
                ...log,
                boxName: boxes.find(box => box.id === log.boxId)?.name || "알 수 없음",
            }));
            setCollectorLogs(logsWithBoxNames);

            // ✅ 필터 유형 반영하여 그래프 데이터 생성
            processChartData(logsWithBoxNames, filterType);
        }
    }, [collectorData, boxLogs, boxes, boxLogStatus, boxStatus, dispatch, id, filterType]);

    // ✅ 그래프 데이터를 필터 유형에 따라 가공하는 함수
    const processChartData = (logs, type) => {
        let groupedData = {};

        logs.forEach((log) => {
            try {
                if (!log.date) {
                    console.warn("🚨 날짜가 없는 로그 발견:", log);
                    log.date = "1970-01-01"; // ✅ 기본값 설정하여 오류 방지
                }

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
                    groupedData[key] = { date: key, collection: 0, disposal: 0 };
                }

                if (log.type === 0) {
                    groupedData[key].collection += log.value;
                } else {
                    groupedData[key].disposal += log.value;
                }
            } catch (error) {
                console.warn("🚨 오류 발생: 무시됨", error, log);
            }
        });

        setGraphData(Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date)));
    };

    return { collectorData, collectorLogs, graphData, filterType, setFilterType };
};

export default useCollectorData;
