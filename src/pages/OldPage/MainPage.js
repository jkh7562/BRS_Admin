import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../slices/userSlice";
import NavigationBar from "../../component/NavigationBar";
import { Map, MapMarker } from "react-kakao-maps-sdk";
//import { getAllLocations } from "../api/apiServices"; // ✅ 추천 수거함 API 추가
import useGraph from "../../hooks/useGraph";
import useBoxes from "../../hooks/useBoxes";
import greenIcon from "../../assets/아이콘 GREEN.svg";
import greenSelectIcon from "../../assets/아이콘 GREEN 선택효과.svg";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MainPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { collectors, users, status } = useSelector(state => state.users);
    const { processChartData, collectionCount, disposalCount } = useGraph();
    /*const { boxes, loading: boxLoading, error: boxError } = useBoxes();*/
    const [hoveredBox, setHoveredBox] = useState(null);

    const [searchCollector, setSearchCollector] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("day");

    // ✅ 수거량 및 배출량 필터를 개별적으로 관리
    const [collectionFilter, setCollectionFilter] = useState("day");
    const [disposalFilter, setDisposalFilter] = useState("day");

    const [recommendedLocations, setRecommendedLocations] = useState([]); // 추천 수거함 위치 데이터 상태


    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchUsers());
        }
    }, [status, dispatch]);

    /*useEffect(() => {
        const fetchRecommendedLocations = async () => {
            try {
                const locations = await getAllLocations();
                setRecommendedLocations(locations);
            } catch (error) {
                console.error("Error fetching recommended locations:", error);
            }
        };

        fetchRecommendedLocations();
    }, []);*/

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
                        {/*{boxLoading ? (
                            <p>⏳ 박스 데이터를 불러오는 중...</p>
                        ) : boxError ? (
                            <p>🚨 오류 발생: {boxError.message}</p>
                        ) : (
                            <Map center={{ lat: 36.800200, lng: 127.074958 }} style={{ width: "80vw", height: "500px" }} level={3}>
                                {boxes.map((box) => (
                                    <MapMarker
                                        key={box.id}
                                        position={{ lat: box.lat, lng: box.lng }}
                                        onClick={() => navigate(`/log?boxId=${box.id}`)}
                                        onMouseOver={() => setHoveredBox(box.id)}
                                        onMouseOut={() => setHoveredBox(null)}
                                        image={{
                                            src: hoveredBox === box.id ? greenSelectIcon : greenIcon,
                                            size: hoveredBox === box.id ? { width: 75, height: 75 } : { width: 60, height: 60 },
                                            options: { offset: { x: 30, y: 60 } }
                                        }}
                                    />
                                ))}

                                {recommendedLocations.map(location => (
                                    <MapMarker
                                        key={location.id}
                                        position={{ lat: location.latitude, lng: location.longitude }}
                                        onClick={() => console.log("Recommended location clicked!", location)}
                                    />
                                ))}
                            </Map>
                        )}*/}
                    </div>
                </div>

                <div className="px-4 mt-8">
                    <div className="grid grid-cols-2 gap-4">
                        {/* ✅ 수거량 그래프 */}
                        <div className="bg-white shadow-md p-4 relative">
                            <div className="flex justify-between items-center mb-4">
                                <p className="font-bold text-lg">수거량</p>
                                {/* ✅ 개별적인 필터 버튼 */}
                                <div className="flex space-x-2">
                                    <button
                                        className={`px-4 py-2 border rounded ${collectionFilter === "day" ? "bg-blue-500 text-white" : ""}`}
                                        onClick={() => setCollectionFilter("day")}>
                                        일
                                    </button>
                                    <button
                                        className={`px-4 py-2 border rounded ${collectionFilter === "month" ? "bg-blue-500 text-white" : ""}`}
                                        onClick={() => setCollectionFilter("month")}>
                                        월
                                    </button>
                                    <button
                                        className={`px-4 py-2 border rounded ${collectionFilter === "year" ? "bg-blue-500 text-white" : ""}`}
                                        onClick={() => setCollectionFilter("year")}>
                                        년
                                    </button>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={processChartData(collectionFilter)}>
                                    <XAxis dataKey="date"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Legend/>
                                    <Line type="monotone" dataKey="collection" stroke="#4CAF50" strokeWidth={2}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* ✅ 배출량 그래프 */}
                        <div className="bg-white shadow-md p-4 relative">
                            <div className="flex justify-between items-center mb-4">
                                <p className="font-bold text-lg">배출량</p>
                                {/* ✅ 개별적인 필터 버튼 */}
                                <div className="flex space-x-2">
                                    <button
                                        className={`px-4 py-2 border rounded ${disposalFilter === "day" ? "bg-red-500 text-white" : ""}`}
                                        onClick={() => setDisposalFilter("day")}>
                                        일
                                    </button>
                                    <button
                                        className={`px-4 py-2 border rounded ${disposalFilter === "month" ? "bg-red-500 text-white" : ""}`}
                                        onClick={() => setDisposalFilter("month")}>
                                        월
                                    </button>
                                    <button
                                        className={`px-4 py-2 border rounded ${disposalFilter === "year" ? "bg-red-500 text-white" : ""}`}
                                        onClick={() => setDisposalFilter("year")}>
                                        년
                                    </button>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={processChartData(disposalFilter)}>
                                    <XAxis dataKey="date"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Legend/>
                                    <Line type="monotone" dataKey="disposal" stroke="#F44336" strokeWidth={2}/>
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
                            <input type="text" placeholder="수거자 검색" className="w-full px-4 py-2 border rounded mb-2"
                                   onChange={(e) => setSearchCollector(e.target.value)}/>
                            <div className="h-80 overflow-y-auto border rounded p-2 bg-gray-50">
                                {collectors.filter(user => user.name.includes(searchCollector)).map(user => (
                                    <p key={user.id} className="p-2 border-b cursor-pointer hover:bg-gray-200"
                                       onClick={() => navigate(`/collector/${user.id}`)}>
                                        {user.name}
                                    </p>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white shadow-md p-4">
                            <p className="font-bold mb-2 truncate">사용자</p>
                            <input type="text" placeholder="사용자 검색" className="w-full px-4 py-2 border rounded mb-2"
                                   onChange={(e) => setSearchUser(e.target.value)}/>
                            <div className="h-80 overflow-y-auto border rounded p-2 bg-gray-50">
                                {users.filter(user => user.name.includes(searchUser)).map(user => (
                                    <p key={user.id} className="p-2 border-b cursor-pointer hover:bg-gray-200"
                                       onClick={() => navigate(`/user/${user.id}`)}>
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
