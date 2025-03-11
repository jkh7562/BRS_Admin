import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBoxLog } from "../slices/boxLogSlice";

const useGraph = () => {
    const dispatch = useDispatch();

    // ✅ Redux 상태 가져오기
    const { logs: boxLogs, status, error } = useSelector((state) => state.boxLog);

    // ✅ 일별, 월별, 연도별 데이터 저장
    const collectionData = [];
    const disposalData = [];

    let collectionCount = 0;
    let disposalCount = 0;

    // ✅ 데이터 불러오기
    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchBoxLog());
        }
    }, [status, dispatch]);

    // ✅ 데이터가 존재하는 경우 처리
    if (Array.isArray(boxLogs) && boxLogs.length > 0) {
        const today = new Date();
        const todayString = today.toISOString().split("T")[0];

        console.log("📌 오늘 날짜:", todayString);
        console.log("📌 Redux 데이터:", boxLogs);

        // ✅ 오늘 날짜 기준 필터링
        const todayLogs = boxLogs.filter((log) => {
            if (!log || !log.date) return false; // undefined 방지
            const logDate = new Date(log.date).toISOString().split("T")[0];
            return logDate === todayString;
        });

        console.log("📌 오늘 필터링된 로그:", todayLogs);

        collectionCount = todayLogs
            .filter((log) => log.type === 0)
            .reduce((sum, log) => sum + (log.value || 0), 0);

        disposalCount = todayLogs
            .filter((log) => log.type === 1)
            .reduce((sum, log) => sum + (log.value || 0), 0);

        console.log("📌 오늘 수거량:", collectionCount);
        console.log("📌 오늘 배출량:", disposalCount);
    }

    // ✅ 차트 데이터 가공 함수 (일별, 월별, 연도별)
    const processChartData = (type) => {
        if (!Array.isArray(boxLogs)) {
            console.error("❌ Redux에서 받아온 데이터가 배열이 아님:", boxLogs);
            return [];
        }

        let groupedData = {};

        boxLogs.forEach((log) => {
            if (!log || !log.date) return; // null 또는 undefined 방지

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
                groupedData[key].collection += log.value || 0;
            } else {
                groupedData[key].disposal += log.value || 0;
            }
        });

        // ✅ 날짜순 정렬
        return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    return {
        boxLogs,
        collectionData: processChartData("day"),
        disposalData: processChartData("day"),
        processChartData,
        collectionCount,
        disposalCount,
        status,
        error
    };
};

export default useGraph;
