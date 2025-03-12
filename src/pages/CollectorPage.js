import React from "react";
import NavigationBar from "../component/NavigationBar";
import useCollectorData from "../hooks/useCollectorData";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CollectorPage = () => {
    const { collectorData, collectorLogs, graphData, filterType, setFilterType } = useCollectorData();

    if (!collectorData) {
        return <div className="h-screen w-screen flex justify-center items-center">⏳ 로딩 중...</div>;
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-100">
            <NavigationBar />

            <div className="mt-16 p-4">
                <div className="flex justify-end space-x-4 mb-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded">수정</button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded">삭제</button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">이름</p>
                        <p>{collectorData.name}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">가입일자</p>
                        <p>{collectorData.date.split("T")[0]}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">총 수거량</p>
                        <p>{collectorLogs.reduce((acc, log) => acc + log.value, 0)}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">누적 마일리지</p>
                        <p>{collectorData.point}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">현재 마일리지</p>
                        <p>{collectorData.point}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">사용한 마일리지</p>
                        <p>{collectorData.usedMileage || "N/A"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white shadow-md p-4 relative" style={{ height: "500px" }}>
                        <div className="flex justify-between items-center mb-4">
                            <p className="font-bold">수거 그래프</p>
                            <div className="flex space-x-2">
                                <button className={`px-4 py-2 border rounded ${filterType === "day" ? "bg-gray-300" : ""}`}
                                        onClick={() => setFilterType("day")}>
                                    일
                                </button>
                                <button className={`px-4 py-2 border rounded ${filterType === "month" ? "bg-gray-300" : ""}`}
                                        onClick={() => setFilterType("month")}>
                                    월
                                </button>
                                <button className={`px-4 py-2 border rounded ${filterType === "year" ? "bg-gray-300" : ""}`}
                                        onClick={() => setFilterType("year")}>
                                    년
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={graphData}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="collection" stroke="#4CAF50" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white shadow-md p-4" style={{ height: "500px", overflow: "hidden" }}>
                        <p className="font-bold mb-4">수거 로그</p>
                        <div className="overflow-y-auto h-full">
                            <table className="w-full table-auto border-collapse border border-gray-200">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2">수거함 이름</th>
                                    <th className="border border-gray-300 px-4 py-2">수거량</th>
                                    <th className="border border-gray-300 px-4 py-2">수거 일자</th>
                                </tr>
                                </thead>
                                <tbody>
                                {collectorLogs.map(log => (
                                    <tr key={log.boxLogId?.id || log.id}>
                                        {/* ✅ boxName을 표시하도록 수정 */}
                                        <td className="border border-gray-300 px-4 py-2">{log.boxName || "알 수 없음"}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.value || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {log.date ? log.date.split("T")[0] : "N/A"}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CollectorPage;
