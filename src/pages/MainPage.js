import React from "react";
import NavigationBar from "../component/NavigationBar";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import useGraph from "../hooks/useGraph";
import useUsers from "../hooks/useUsers";
import useBoxes from "../hooks/useBoxes"; // ✅ 박스 훅 추가
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MainPage = () => {
    const { boxLogs, collectionData, disposalData, processChartData, collectionCount, disposalCount } = useGraph();
    const { collectors, users, searchCollector, setSearchCollector, searchUser, setSearchUser } = useUsers();
    const { boxes, loading: boxLoading, error: boxError } = useBoxes(); // ✅ 박스 데이터 가져오기

    return (
        <div className="min-h-screen w-screen flex flex-col bg-gray-100 pb-20">
            {/* 네비게이션 바 */}
            <NavigationBar />

            {/* 페이지 내용 */}
            <div className="mt-16">
                {/* ✅ 통계 정보 */}
                <div className="flex justify-center p-4">
                    <div className="flex space-x-8 w-2/5 justify-between">
                        <div className="bg-white shadow-md p-2 text-center w-1/6">
                            <p className="text-xs font-bold">하루 수거량</p>
                            <p className="text-base font-bold">{collectionCount}</p>
                        </div>
                        <div className="bg-white shadow-md p-2 text-center w-1/6">
                            <p className="text-xs font-bold">하루 배출량</p>
                            <p className="text-base font-bold">{disposalCount}</p>
                        </div>
                        <div className="bg-white shadow-md p-2 text-center w-1/6">
                            <p className="text-xs font-bold">앱 서비스 이용자 수</p>
                            <p className="text-base font-bold">{users.length + collectors.length}</p>
                        </div>
                    </div>
                </div>

                {/* 🗺️ 카카오 지도 */}
                <div className="px-0 mt-8 flex justify-center">
                    <div className="w-7/8 bg-white shadow-md p-4 mb-8">
                        <p className="font-bold text-lg mb-4 text-left ml-4">지도</p>
                        {boxLoading ? (
                            <p>⏳ 박스 데이터를 불러오는 중...</p>
                        ) : boxError ? (
                            <p>🚨 오류 발생: {boxError.message}</p>
                        ) : (
                            <Map
                                center={{ lat: 36.800200, lng: 127.074958 }}
                                style={{ width: "80vw", height: "500px" }}
                                level={3}
                            >
                                {/* ✅ 박스 위치에 마커 추가 */}
                                {boxes.map((box) => (
                                    <MapMarker key={box.id} position={{ lat: box.lat, lng: box.lng }}>
                                        <div style={{ padding: "5px", color: "#000" }}>{box.name}</div>
                                    </MapMarker>
                                ))}
                            </Map>
                        )}
                    </div>
                </div>

                {/* 그래프 영역 */}
                <div className="flex justify-center px-4 mt-8">
                    <div className="grid grid-cols-2 gap-4 w-3/4">
                        {/* ✅ 수거량 그래프 */}
                        <div className="bg-white shadow-md p-4 relative">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold text-lg">수거량</p>
                                <div className="flex space-x-2 absolute right-4 top-2">
                                    <button onClick={() => processChartData(boxLogs, "day")} className="px-3 py-1 border rounded">일</button>
                                    <button onClick={() => processChartData(boxLogs, "month")} className="px-3 py-1 border rounded">월</button>
                                    <button onClick={() => processChartData(boxLogs, "year")} className="px-3 py-1 border rounded">년</button>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={collectionData}>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="collection" stroke="#4CAF50" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* ✅ 배출량 그래프 */}
                        <div className="bg-white shadow-md p-4 relative">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold text-lg">배출량</p>
                                <div className="flex space-x-2 absolute right-4 top-2">
                                    <button onClick={() => processChartData(boxLogs, "day")} className="px-3 py-1 border rounded">일</button>
                                    <button onClick={() => processChartData(boxLogs, "month")} className="px-3 py-1 border rounded">월</button>
                                    <button onClick={() => processChartData(boxLogs, "year")} className="px-3 py-1 border rounded">년</button>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={disposalData}>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="disposal" stroke="#F44336" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ✅ 회원 정보 섹션 (복원) */}
                <div className="px-4 mt-8">
                    <p className="font-bold text-lg mb-4 text-left ml-4">회원정보</p>
                    <div className="grid grid-cols-2 gap-4">
                        {/* ✅ 수거자 정보 */}
                        <div className="bg-white shadow-md p-4">
                            <p className="font-bold mb-2 truncate">수거자</p>
                            <input type="text" placeholder="수거자 검색" className="w-full px-4 py-2 border rounded mb-2" onChange={(e) => setSearchCollector(e.target.value)} />
                            <div className="h-80 overflow-y-auto border rounded p-2 bg-gray-50">
                                {collectors.filter(user => user.name.includes(searchCollector)).map(user => (
                                    <p key={user.id} className="p-2 border-b">{user.name}</p>
                                ))}
                            </div>
                        </div>

                        {/* ✅ 사용자 정보 */}
                        <div className="bg-white shadow-md p-4">
                            <p className="font-bold mb-2 truncate">사용자</p>
                            <input type="text" placeholder="사용자 검색" className="w-full px-4 py-2 border rounded mb-2" onChange={(e) => setSearchUser(e.target.value)} />
                            <div className="h-80 overflow-y-auto border rounded p-2 bg-gray-50">
                                {users.filter(user => user.name.includes(searchUser)).map(user => (
                                    <p key={user.id} className="p-2 border-b">{user.name}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MainPage;
