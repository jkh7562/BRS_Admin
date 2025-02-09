import { useState, useEffect } from "react";
import { getBoxLog } from "../api/apiServices";

const useGraph = () => {
    const [boxLogs, setBoxLogs] = useState([]);
    const [collectionCount, setCollectionCount] = useState(0);
    const [disposalCount, setDisposalCount] = useState(0);
    const [collectionData, setCollectionData] = useState([]);
    const [disposalData, setDisposalData] = useState([]);
    const [filterType, setFilterType] = useState("day"); // 기본 필터: 일별

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getBoxLog();
                console.log("📌 API 응답 데이터:", data); // 응답 데이터 확인
                if (!Array.isArray(data)) {
                    console.error("🚨 예상치 못한 데이터 형식:", data);
                    return;
                }

                setBoxLogs(data);

                // ✅ 초기 데이터 변환 (일별 기준)
                processChartData("day", data);
                setCollectionCount(data.filter((log) => log.type === 0).length);
                setDisposalCount(data.filter((log) => log.type === 1).length);
            } catch (error) {
                console.error("🚨 데이터 불러오기 실패:", error);
            }
        };

        fetchData();
    }, []);

    // ✅ 날짜별로 그룹화하는 함수
    const processChartData = (type, inputData = boxLogs) => {
        if (!Array.isArray(inputData)) {
            console.error("🚨 processChartData: 입력 데이터가 배열이 아닙니다.", inputData);
            return;
        }

        let groupedData = {};

        inputData.forEach((log) => {
            const date = new Date(log.boxLogId.date);
            let key;

            if (type === "day") {
                key = date.toISOString().split("T")[0]; // YYYY-MM-DD
            } else if (type === "month") {
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`; // YYYY-MM
            } else {
                key = `${date.getFullYear()}`; // YYYY
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

        const chartData = Object.values(groupedData);
        console.log(`📊 ${type} 기준 그래프 데이터:`, chartData);

        setCollectionData(chartData);
        setDisposalData(chartData);
        setFilterType(type);
    };

    return { collectionCount, disposalCount, collectionData, disposalData, processChartData };
};

export default useGraph;
