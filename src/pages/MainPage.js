import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../slices/userSlice";
import NavigationBar from "../component/NavigationBar";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import useGraph from "../hooks/useGraph";
import useBoxes from "../hooks/useBoxes";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MainPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { collectors, users, status } = useSelector(state => state.users);
    const { processChartData, collectionCount, disposalCount } = useGraph();
    const { boxes, loading: boxLoading, error: boxError } = useBoxes();

    const [searchCollector, setSearchCollector] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("day");

    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchUsers());
        }
    }, [status, dispatch]);

    // ✅ 수거함 클릭 시 로그 페이지로 이동 (쿼리스트링으로 boxId 전달)
    const handleBoxClick = (boxId) => {
        navigate(`/log?boxId=${boxId}`);
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-gray-100 pb-20">
            <NavigationBar />
            <div className="mt-16">
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
                                {boxes.map((box) => (
                                    <MapMarker
                                        key={box.id}
                                        position={{ lat: box.lat, lng: box.lng }}
                                        onClick={() => handleBoxClick(box.id)} // ✅ 수거함 클릭 시 이동
                                    >
                                        <div style={{ padding: "5px", color: "#000", cursor: "pointer" }}>
                                            {box.name}
                                        </div>
                                    </MapMarker>
                                ))}
                            </Map>
                        )}
                    </div>
                </div>

                {/* ✅ 일 / 월 / 년 버튼 추가 */}
                <div className="flex justify-center space-x-4 mb-4">
                    <button
                        className={`px-4 py-2 border rounded ${selectedFilter === "day" ? "bg-blue-500 text-white" : ""}`}
                        onClick={() => setSelectedFilter("day")}
                    >
                        일
                    </button>
                    <button
                        className={`px-4 py-2 border rounded ${selectedFilter === "month" ? "bg-blue-500 text-white" : ""}`}
                        onClick={() => setSelectedFilter("month")}
                    >
                        월
                    </button>
                    <button
                        className={`px-4 py-2 border rounded ${selectedFilter === "year" ? "bg-blue-500 text-white" : ""}`}
                        onClick={() => setSelectedFilter("year")}
                    >
                        년
                    </button>
                </div>

                <div className="px-4 mt-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white shadow-md p-4">
                            <p className="font-bold text-lg">수거량</p>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={processChartData(selectedFilter)}>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="collection" stroke="#4CAF50" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white shadow-md p-4">
                            <p className="font-bold text-lg">배출량</p>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={processChartData(selectedFilter)}>
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

                <div className="px-4 mt-8">
                    <p className="font-bold text-lg mb-4 text-left ml-4">회원정보</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white shadow-md p-4">
                            <p className="font-bold mb-2 truncate">수거자</p>
                            <input type="text" placeholder="수거자 검색" className="w-full px-4 py-2 border rounded mb-2" onChange={(e) => setSearchCollector(e.target.value)} />
                            <div className="h-80 overflow-y-auto border rounded p-2 bg-gray-50">
                                {collectors.filter(user => user.name.includes(searchCollector)).map(user => (
                                    <p key={user.id} className="p-2 border-b cursor-pointer hover:bg-gray-200" onClick={() => navigate(`/collector/${user.id}`)}>
                                        {user.name}
                                    </p>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white shadow-md p-4">
                            <p className="font-bold mb-2 truncate">사용자</p>
                            <input type="text" placeholder="사용자 검색" className="w-full px-4 py-2 border rounded mb-2" onChange={(e) => setSearchUser(e.target.value)} />
                            <div className="h-80 overflow-y-auto border rounded p-2 bg-gray-50">
                                {users.filter(user => user.name.includes(searchUser)).map(user => (
                                    <p key={user.id} className="p-2 border-b cursor-pointer hover:bg-gray-200" onClick={() => navigate(`/user/${user.id}`)}>
                                        {user.name}
                                    </p>
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
