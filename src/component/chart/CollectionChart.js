// components/chart/CollectionChart.jsx
import React, { useEffect, useState } from "react";
import ChartTabControl from "./ChartTabControl";
import TimeUnitControl from "./TimeUnitControl";
import BarChartContainer from "./BarChartContainer";
import { getBoxLog } from "../../api/apiServices";

const tabs = ["전체 수거함", "건전지", "방전 배터리", "잔여 용량 배터리"];

const CollectionChart = () => {
    const [selectedTab, setSelectedTab] = useState("전체 수거함");
    const [selectedUnit, setSelectedUnit] = useState("월");
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchAndProcess = async () => {
            try {
                const raw = await getBoxLog();

                const filtered = raw.filter((entry) => {
                    const { boxLog } = entry;
                    if (!boxLog || boxLog.type !== "수거") return false;

                    // 탭 필터링
                    if (selectedTab === "건전지" && boxLog.batteryType !== "건전지") return false;
                    if (selectedTab === "방전 배터리" && boxLog.batteryType !== "방전 배터리") return false;
                    if (selectedTab === "잔여 용량 배터리" && boxLog.batteryType !== "잔여 용량 배터리") return false;

                    return true;
                });

                const grouped = {};

                filtered.forEach(({ boxLog }) => {
                    const date = new Date(boxLog.date);
                    let key = "";

                    if (selectedUnit === "연") {
                        key = date.getFullYear().toString();
                    } else if (selectedUnit === "월") {
                        key = `${String(date.getFullYear()).slice(2)}/${String(date.getMonth() + 1).padStart(2, "0")}`;
                    } else {
                        key = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
                    }

                    if (!grouped[key]) grouped[key] = 0;
                    grouped[key] += boxLog.value || 0;
                });

                const result = Object.entries(grouped)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([label, value]) => ({ label, value }));

                setChartData(result);
            } catch (error) {
                console.error("수거량 차트 로딩 실패:", error);
                setChartData([]);
            }
        };

        fetchAndProcess();
    }, [selectedTab, selectedUnit]);

    return (
        <div>
            <ChartTabControl
                tabs={tabs}
                selectedTab={selectedTab}
                onSelectTab={setSelectedTab}
            />
            <TimeUnitControl
                selectedUnit={selectedUnit}
                onSelectUnit={setSelectedUnit}
            />
            <BarChartContainer
                data={chartData}
                barColor="#34D399"
                barName="수거량"
            />
        </div>
    );
};

export default CollectionChart;
