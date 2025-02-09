import { useEffect, useState } from "react";
import { getBoxLog } from "../api/apiServices";

const useGraph = () => {
    const [boxLogs, setBoxLogs] = useState([]);
    const [collectionData, setCollectionData] = useState([]);
    const [disposalData, setDisposalData] = useState([]);
    const [collectionCount, setCollectionCount] = useState(0);
    const [disposalCount, setDisposalCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getBoxLog();
                setBoxLogs(data);
                processChartData(data, "day");

                const today = new Date();
                const todayString = today.toISOString().split("T")[0];

                console.log("📌 오늘 날짜:", todayString);
                console.log("📌 API 데이터:", data);

                const todayLogs = data.filter((log) => {
                    const logDate = new Date(log.boxLogId.date).toISOString().split("T")[0];
                    return logDate === todayString;
                });

                console.log("📌 오늘 필터링된 로그:", todayLogs);

                const todayCollection = todayLogs
                    .filter((log) => log.type === 0)
                    .reduce((sum, log) => sum + log.weight, 0);

                const todayDisposal = todayLogs
                    .filter((log) => log.type === 1)
                    .reduce((sum, log) => sum + log.weight, 0);

                console.log("📌 오늘 수거량:", todayCollection);
                console.log("📌 오늘 배출량:", todayDisposal);

                setCollectionCount(todayCollection);
                setDisposalCount(todayDisposal);
            } catch (error) {
                console.error("🚨 데이터 불러오기 실패:", error);
            }
        };

        fetchData();
    }, []);

    // ✅ processChartData에 **데이터 인수 추가**
    const processChartData = (data, type) => {
        if (!Array.isArray(data)) {
            console.error("❌ processChartData에 배열이 아닌 값이 전달됨:", data);
            return;
        }

        let groupedData = {};

        data.forEach((log) => {
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

        // ✅ 날짜순 정렬
        const chartData = Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));

        setCollectionData(chartData);
        setDisposalData(chartData);
    };

    return { boxLogs, collectionData, disposalData, processChartData, collectionCount, disposalCount };
};

export default useGraph;
