import React, { useRef, useState, useEffect } from "react";
import NavigationBar from "../component/NavigationBar";
import { Map, MapMarker } from "react-kakao-maps-sdk";

// 더미 수거함 데이터
const boxes = [
    { id: "box1", name: "선문대 동문 앞 수거함", lat: 36.8082, lng: 127.0090 },
    { id: "box2", name: "선문대 서문 앞 수거함", lat: 36.8090, lng: 127.0100 },
    { id: "box3", name: "선문대 삼봉마을 수거함", lat: 36.8075, lng: 127.0115 },
];

// 더미 로그 데이터
const logs = {
    box1: [
        { id: 1, user: "홍길동", date: "2025/03/17", batteries: "건전지 6개, 방전 배터리 5개, 잔여 용량 배터리 7개" },
        { id: 2, user: "김유신", date: "2025/03/16", batteries: "건전지 3개, 방전 배터리 2개" }
    ],
    box2: [
        { id: 3, user: "이순신", date: "2025/03/17", batteries: "방전 배터리 10개" }
    ],
    box3: [
        { id: 4, user: "유관순", date: "2025/03/17", batteries: "건전지 4개, 잔여 용량 배터리 2개" }
    ]
};

const BoxControlLogPage = () => {
    const [search, setSearch] = useState("");
    const [selectedBox, setSelectedBox] = useState(boxes[0]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showControlPanel, setShowControlPanel] = useState(false);
    const [showCollectorControlPanel, setShowCollectorControlPanel] = useState(false); // 수거자 개폐 패널 표시 상태
    const userButtonRef = useRef(null);
    const collectorButtonRef = useRef(null); // 수거자 버튼 참조
    const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0 });
    const [collectorPanelStyle, setCollectorPanelStyle] = useState({ top: 0, left: 0 }); // 수거자 패널 스타일

    useEffect(() => {
        if (showControlPanel && userButtonRef.current) {
            const rect = userButtonRef.current.getBoundingClientRect();
            setPanelStyle({
                top: rect.top - 106,
                left: rect.left + rect.width / 2,
            });
        }
    }, [showControlPanel]);

    useEffect(() => {
        if (showCollectorControlPanel && collectorButtonRef.current) {
            const rect = collectorButtonRef.current.getBoundingClientRect();
            setCollectorPanelStyle({
                top: rect.top - 106, // 버튼 위 30px 위치 (원하는 만큼 조정 가능)
                left: rect.left + rect.width / 2,
            });
        }
    }, [showCollectorControlPanel]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 items-center px-4 overflow-auto">
            <NavigationBar />

            {/* 상단: 수거함 검색 및 정보 */}
            <div className="mt-24 w-3/4 flex gap-4">
                {/* 수거함 정보 (왼쪽) */}
                <div className="bg-white shadow-md p-3 rounded w-2/3 overflow-auto">
                    <h2 className="text-lg font-semibold mb-2">수거함 이름: {selectedBox.name}</h2>

                    {/* 카카오 지도 */}
                    <div className="mt-2 w-full rounded" style={{ height: "300px" }}>
                        <Map
                            center={{ lat: selectedBox.lat, lng: selectedBox.lng }}
                            style={{ width: "100%", height: "100%" }}
                            level={3}
                        >
                            <MapMarker position={{ lat: selectedBox.lat, lng: selectedBox.lng }} />
                        </Map>
                    </div>

                    {/* 배출 통계 */}
                    <div className="mt-3">
                        <h3 className="text-md font-semibold mb-1">가장 많이 배출된 종류: 방전 배터리</h3>
                        <div className="flex justify-around">
                            <div className="text-center">
                                <p className="border p-2 rounded">건전지</p>
                                <p className="border p-2 rounded">63 개</p>
                            </div>
                            <div className="text-center">
                                <p className="border p-2 rounded">방전 배터리</p>
                                <p className="border p-2 rounded">263 개</p>
                            </div>
                            <div className="text-center">
                                <p className="border p-2 rounded">잔여 용량 배터리</p>
                                <p className="border p-2 rounded">32 개</p>
                            </div>
                        </div>
                    </div>

                    {/* 개폐 상태 */}
                    <div className="mt-3 flex flex-col items-center">
                        <h3 className="text-md font-semibold mb-2">개폐 상태</h3>

                        <div className="flex items-center">
                            {/* 왼쪽: 배터리 개폐 상태 */}
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="border p-2 rounded bg-gray-100 text-center">건전지</span>
                                    <span className="border p-2 rounded bg-gray-200 text-center">개방</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="border p-2 rounded bg-gray-100 text-center">방전 배터리</span>
                                    <span className="border p-2 rounded bg-gray-200 text-center">폐쇄</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="border p-2 rounded bg-gray-100 text-center">잔여 용량 배터리</span>
                                    <span className="border p-2 rounded bg-gray-200 text-center">폐쇄</span>
                                </div>
                            </div>

                            {/* 가운데 여백 추가 */}
                            <div className="w-8"></div>

                            {/* 오른쪽: 수거자 입구 개폐 상태 */}
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="border p-2 rounded bg-gray-100 text-center">수거자 입구</span>
                                    <span className="border p-2 rounded bg-gray-200 text-center">폐쇄</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* 사용자, 차단, 수거자 버튼 */}
                    <div className="mt-8 flex flex-col items-center relative">
                        <div className="flex justify-around w-full">
                            <button
                                ref={userButtonRef}
                                className="p-2 bg-blue-500 text-white rounded"
                                onClick={() => {
                                    setShowControlPanel((prev) => !prev);
                                    setShowCollectorControlPanel(false); // 수거자 패널 닫기
                                }}
                            >
                                사용자
                            </button>
                            <button className="p-2 bg-gray-500 text-white rounded">차단</button>
                            <button
                                ref={collectorButtonRef}
                                className="p-2 bg-green-500 text-white rounded"
                                onClick={() => {
                                    console.log("수거자 버튼 클릭됨");
                                    setShowCollectorControlPanel((prev) => !prev);
                                    setShowControlPanel(false); // 사용자 패널 닫기
                                    console.log("showCollectorControlPanel:", !showCollectorControlPanel);
                                }}
                            >
                                수거자
                            </button>
                        </div>

                        {/* ✅ 개폐 조작 UI (사용자 버튼 위에 나타남) */}
                        {showControlPanel && (<div
                            className="fixed z-50 bg-white border shadow-md p-3 rounded flex gap-4 transform -translate-x-1/2"
                            style={{ top: `${panelStyle.top}px`, left: `${panelStyle.left}px` }}
                        >
                            {/* 건전지 */}
                            <div className="border p-2 rounded text-center bg-white shadow">
                                <p className="font-semibold">건전지</p>
                                <div className="flex justify-between mt-1">
                                    <button className="border p-1 rounded bg-gray-200 cursor-pointer">개방</button>
                                    <button className="border p-1 rounded bg-gray-200 cursor-pointer">폐쇄</button>
                                </div>
                            </div>

                            {/* 방전 배터리 */}
                            <div className="border p-2 rounded text-center bg-white shadow">
                                <p className="font-semibold">방전 배터리</p>
                                <div className="flex justify-between mt-1">
                                    <button className="border p-1 rounded bg-gray-200 cursor-pointer">개방</button>
                                    <button className="border p-1 rounded bg-gray-200 cursor-pointer">폐쇄</button>
                                </div>
                            </div>

                            {/* 잔여 용량 배터리 */}
                            <div className="border p-2 rounded text-center bg-white shadow">
                                <p className="font-semibold">잔여 용량 배터리</p>
                                <div className="flex justify-between mt-1">
                                    <button className="border p-1 rounded bg-gray-200 cursor-pointer">개방</button>
                                    <button className="border p-1 rounded bg-gray-200 cursor-pointer">폐쇄</button>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* ✅ 수거자 개폐 조작 UI (수거자 버튼 위에 나타남) */}
                        {showCollectorControlPanel && (
                            <div
                                className="fixed z-50 bg-white border shadow-md p-3 rounded flex gap-4 transform -translate-x-1/2"
                                style={{ top: `${collectorPanelStyle.top}px`, left: `${collectorPanelStyle.left}px` }}
                            >
                                {/* 수거자 입구 */}
                                <div className="border p-2 rounded text-center bg-white shadow">
                                    <p className="font-semibold">수거자 입구</p>
                                    <div className="flex justify-between mt-1">
                                        <button className="border p-1 rounded bg-gray-200 cursor-pointer">개방</button>
                                        <button className="border p-1 rounded bg-gray-200 cursor-pointer">폐쇄</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 수거함 검색 (오른쪽) */}
                <div className="bg-white shadow-md p-3 rounded w-1/3 max-h-600 overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-2">수거함</h2>

                    <input
                        type="text"
                        placeholder="수거함 검색"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border p-1 rounded w-full mb-2"
                    />

                    <ul className="border rounded h-40 overflow-auto">
                        {boxes
                            .filter((box) => box.name.includes(search))
                            .map((box) => (
                                <li
                                    key={box.id}
                                    className={`p-2 border-b cursor-pointer ${selectedBox?.id === box.id ? "bg-gray-200" : ""}`}
                                    onClick={() => {
                                        setSelectedBox(box);
                                        setSelectedLog(null);
                                    }}
                                >
                                    {box.name}
                                </li>
                            ))}
                    </ul>
                </div>
            </div>

            {/* 하단: 배출 로그 및 상세 정보 */}
            <div className="mt-4 w-3/4 flex gap-4">
                {/* 로그 목록 (왼쪽) */}
                <div className="bg-white shadow-md p-3 rounded w-1/3 h-[600px] overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-2">로그 종류:</h2>
                    <select className="border p-1 rounded w-full mb-2">
                        <option value="배출">배출</option>
                        <option value="수거">수거</option>
                    </select>

                    <input
                        type="text"
                        placeholder="로그 검색"
                        className="border p-1 rounded w-full mb-2"
                    />

                    <ul className="border rounded h-[400px] overflow-y-auto">
                        {logs[selectedBox.id]?.map((log) => (
                            <li
                                key={log.id}
                                className={`p-2 border-b cursor-pointer ${selectedLog?.id === log.id ? "bg-gray-200" : ""}`}
                                onClick={() => setSelectedLog(log)}
                            >
                                {log.user} - {log.date}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 로그 상세 정보 */}
                {selectedLog && (
                    <div className="bg-white shadow-md p-3 rounded w-2/3 h-[600px] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-2">배출 상세 정보</h2>
                        <p><strong>사용자:</strong> {selectedLog.user}</p>
                        <p><strong>배출 일자:</strong> {selectedLog.date}</p>
                        <p><strong>수거함:</strong> {selectedBox.name}</p>
                        <p><strong>배출 정보:</strong> {selectedLog.batteries}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoxControlLogPage;