import { useEffect, useState } from "react"
import ChartTabControl from "./ChartTabControl"
import TimeUnitControl from "./TimeUnitControl"
import BarChartContainer from "./BarChartContainer"
import { getBoxLog } from "../../api/apiServices"

const tabs = ["전체 수거량", "건전지", "방전 배터리", "미방전 배터리"]

const CollectionChart = () => {
    const [selectedTab, setSelectedTab] = useState("전체 수거량")
    const [selectedUnit, setSelectedUnit] = useState("일")
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        const fetchAndProcess = async () => {
            try {
                const raw = await getBoxLog()

                // 수거 데이터만 필터링
                const collectionData = raw.filter((entry) => {
                    const { boxLog } = entry
                    return boxLog && boxLog.type === "수거"
                })

                // 시간 단위별 데이터 집계
                const grouped = {}

                collectionData.forEach((entry) => {
                    const { boxLog, items } = entry
                    const date = new Date(boxLog.date)
                    let key = ""

                    if (selectedUnit === "연") {
                        key = date.getFullYear().toString()
                    } else if (selectedUnit === "월") {
                        key = `${String(date.getFullYear()).slice(2)}/${String(date.getMonth() + 1).padStart(2, "0")}`
                    } else {
                        // 일
                        key = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
                    }

                    if (!grouped[key]) grouped[key] = 0

                    // 선택된 탭에 따라 데이터 집계
                    if (selectedTab === "전체 수거량") {
                        // 모든 배터리 타입의 count 합계
                        items.forEach((item) => {
                            grouped[key] += item.count || 0
                        })
                    } else if (selectedTab === "건전지") {
                        // battery 타입만
                        const batteryItem = items.find((item) => item.name === "battery")
                        if (batteryItem) {
                            grouped[key] += batteryItem.count || 0
                        }
                    } else if (selectedTab === "방전 배터리") {
                        // discharged 타입만
                        const dischargedItem = items.find((item) => item.name === "discharged")
                        if (dischargedItem) {
                            grouped[key] += dischargedItem.count || 0
                        }
                    } else if (selectedTab === "미방전 배터리") {
                        // undischarged 타입만
                        const undischargedItem = items.find((item) => item.name === "notDischarged")
                        if (undischargedItem) {
                            grouped[key] += undischargedItem.count || 0
                        }
                    }
                })

                // 정렬된 결과 생성
                const result = Object.entries(grouped)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([label, value]) => ({ label, value }))

                setChartData(result)
            } catch (error) {
                console.error("수거량 차트 로딩 실패:", error)
                setChartData([])
            }
        }

        fetchAndProcess()
    }, [selectedTab, selectedUnit])

    return (
        <div>
            <ChartTabControl tabs={tabs} selectedTab={selectedTab} onSelectTab={setSelectedTab} />
            <TimeUnitControl selectedUnit={selectedUnit} onSelectUnit={setSelectedUnit} />
            <BarChartContainer data={chartData} barColor="#34D399" barName="수거량" />
        </div>
    )
}

export default CollectionChart