import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const UserDischargeChart = ({ boxLogs, userId, selectedPeriod, selectedBatteryType = "전체" }) => {
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        const processData = () => {
            if (!boxLogs || !userId) {
                setChartData([])
                return
            }

            // 해당 사용자의 배출 로그만 필터링
            const userLogs = boxLogs.filter((entry) => {
                const { boxLog } = entry
                return boxLog && boxLog.type === "분리" && boxLog.userId === userId
            })

            // 시간대별 데이터 집계
            const grouped = {}

            userLogs.forEach(({ boxLog, items }) => {
                const date = new Date(boxLog.date)
                let key = ""

                if (selectedPeriod === "연") {
                    key = date.getFullYear().toString()
                } else if (selectedPeriod === "월") {
                    key = `${String(date.getFullYear()).slice(2)}/${String(date.getMonth() + 1).padStart(2, "0")}`
                } else {
                    key = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
                }

                if (!grouped[key]) grouped[key] = 0

                // 배터리 타입별 필터링
                if (items && Array.isArray(items)) {
                    let count = 0

                    if (selectedBatteryType === "전체") {
                        // 모든 배터리 타입의 count 합계
                        count = items.reduce((sum, item) => sum + (item.count || 0), 0)
                    } else {
                        // 특정 배터리 타입만 필터링
                        const batteryTypeMap = {
                            건전지: "battery",
                            "방전 배터리": "discharged",
                            "미방전 배터리": "notDischarged",
                        }

                        const targetType = batteryTypeMap[selectedBatteryType]
                        const targetItem = items.find((item) => item.name === targetType)
                        count = targetItem ? targetItem.count || 0 : 0
                    }

                    grouped[key] += count
                }
            })

            const result = Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([label, value]) => ({ label, value }))

            setChartData(result)
        }

        processData()
    }, [boxLogs, userId, selectedPeriod, selectedBatteryType])

    return (
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="배출량" fill="#FB7185" barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default UserDischargeChart