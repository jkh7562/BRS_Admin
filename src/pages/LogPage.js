import React from "react";
import NavigationBar from "../component/NavigationBar";
import useLogs from "../hooks/useLogs";

const LogPage = () => {
    const {
        searchTerm,
        setSearchTerm,
        selectedBox,
        setSelectedBox,
        filteredBoxes,
        disposalLogs,
        collectionLogs,
    } = useLogs();

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-100">
            <NavigationBar />

            <div className="mt-16 p-4">
                {/* 상단 영역 */}
                <div className="flex justify-between mb-4">
                    <div className="flex items-center">
                        <p className="font-bold mr-2">수거함 이름:</p>
                        <span className="px-2 py-1 bg-gray-200 rounded">
                            {selectedBox ? selectedBox.name : "선택된 수거함 없음"}
                        </span>
                    </div>
                </div>

                {/* 중간 영역 */}
                <div className="grid grid-cols-12 gap-4 mb-4">
                    {/* 배출 로그 */}
                    <div className="bg-white shadow-md p-4 col-span-4">
                        <p className="font-bold mb-2">배출 로그</p>
                        <table className="w-full table-auto border-collapse border border-gray-200">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">사용자 ID</th>
                                <th className="border border-gray-300 px-4 py-2">배출량</th>
                                <th className="border border-gray-300 px-4 py-2">배출 일자</th>
                            </tr>
                            </thead>
                            <tbody>
                            {disposalLogs.length > 0 ? (
                                disposalLogs.map((log) => (
                                    <tr key={log.boxLogId.id}>
                                        <td className="border border-gray-300 px-4 py-2">{log.userId}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.weight}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.boxLogId.date.split("T")[0]}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="border border-gray-300 px-4 py-2 text-center">기록 없음</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* 수거 로그 */}
                    <div className="bg-white shadow-md p-4 col-span-4">
                        <p className="font-bold mb-2">수거 로그</p>
                        <table className="w-full table-auto border-collapse border border-gray-200">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">수거자 ID</th>
                                <th className="border border-gray-300 px-4 py-2">수거량</th>
                                <th className="border border-gray-300 px-4 py-2">수거 일자</th>
                            </tr>
                            </thead>
                            <tbody>
                            {collectionLogs.length > 0 ? (
                                collectionLogs.map((log) => (
                                    <tr key={log.boxLogId.id}>
                                        <td className="border border-gray-300 px-4 py-2">{log.collectorId}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.weight}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.boxLogId.date.split("T")[0]}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="border border-gray-300 px-4 py-2 text-center">기록 없음</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* 수거함 검색 및 리스트 */}
                    <div className="bg-white shadow-md p-4 col-span-4">
                        <p className="font-bold mb-2">수거함</p>
                        <div className="flex space-x-2 mb-4">
                            <input
                                type="text"
                                className="border px-2 py-1 rounded flex-1"
                                placeholder="수거함 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="h-72 overflow-y-auto border rounded">
                            {filteredBoxes.length > 0 ? (
                                filteredBoxes.map(box => (
                                    <div
                                        key={box.id}
                                        className={`p-2 border-b cursor-pointer ${selectedBox?.id === box.id ? "bg-blue-100" : ""}`}
                                        onClick={() => setSelectedBox(box)}
                                    >
                                        {box.name}
                                    </div>
                                ))
                            ) : (
                                <p className="p-2 text-gray-500">검색된 수거함이 없습니다.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogPage;
