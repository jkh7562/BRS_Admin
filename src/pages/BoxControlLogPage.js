import React, { useRef, useState, useEffect } from "react";
import NavigationBar from "../component/NavigationBar";
import { Map, MapMarker } from "react-kakao-maps-sdk";

// 더미 데이터 (변경 없음)
const boxes = [
    { id: "box1", name: "선문대 동문 앞 수거함", lat: 36.8082, lng: 127.0090 },
    { id: "box2", name: "선문대 서문 앞 수거함", lat: 36.8090, lng: 127.0100 },
    { id: "box3", name: "선문대 삼봉마을 수거함", lat: 36.8075, lng: 127.0115 },
];

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
    const [showControlModal, setShowControlModal] = useState(false); // 사용자 모달
    const [showCollectorModal, setShowCollectorModal] = useState(false); // 수거자 모달
    const userButtonRef = useRef(null);
    const collectorButtonRef = useRef(null);
    const [logType, setLogType] = useState("배출");


    const toggleModal = (type) => {
        if (type === 'user') {
            setShowControlModal(prev => !prev);
            setShowCollectorModal(false);
        } else {
            setShowCollectorModal(prev => !prev);
            setShowControlModal(false);
        }
    };

    // 수거 로그 예시 데이터
    const pickupLogs = {
        box1: [
            {
                id: 101,
                user: "홍길동",
                userid: "jkh7562",
                date: "2025-03-17 18:22:40",
                batteries: "건전지 6개, 방전 배터리 5개, 잔여 용량 배터리 7개",
                lat: 36.80823242,
                lng: 1227.0090151
            }
        ],
        box2: [],
        box3: []
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 items-center px-4 overflow-auto">
            <NavigationBar />

            <div className="mt-24 w-3/4 flex gap-4">
                <div className="bg-white shadow-md p-3 rounded w-2/3 overflow-auto">
                    <h2 className="text-lg font-semibold mb-2">수거함 이름: {selectedBox.name}</h2>

                    <div className="mt-2 w-full rounded" style={{ height: "300px" }}>
                        <Map
                            center={{ lat: selectedBox.lat, lng: selectedBox.lng }}
                            style={{ width: "100%", height: "100%" }}
                            level={3}
                        >
                            <MapMarker position={{ lat: selectedBox.lat, lng: selectedBox.lng }} />
                        </Map>
                    </div>

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

                    <div className="mt-3 flex flex-col items-center">
                        <h3 className="text-md font-semibold mb-2">개폐 상태</h3>
                        <div className="flex items-center">
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
                            <div className="w-8"></div>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="border p-2 rounded bg-gray-100 text-center">수거자 입구</span>
                                    <span className="border p-2 rounded bg-gray-200 text-center">폐쇄</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center relative">
                        <div className="flex justify-around w-full">
                            <button
                                ref={userButtonRef}
                                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={() => toggleModal('user')}
                            >
                                사용자
                            </button>
                            <button className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600">차단</button>
                            <button
                                ref={collectorButtonRef}
                                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={() => toggleModal('collector')}
                            >
                                수거자
                            </button>
                        </div>
                    </div>
                </div>

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

            <div className="mt-4 w-3/4 flex gap-4">
                {/* 로그 종류와 검색 */}
                <div className="bg-white shadow-md p-3 rounded w-1/3 h-[600px] overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-2">로그 종류:</h2>
                    <select
                        className="border p-1 rounded w-full mb-2"
                        value={logType}
                        onChange={(e) => {
                            setLogType(e.target.value);
                            setSelectedLog(null); // 로그 종류 바뀌면 선택된 로그 초기화
                        }}
                    >
                        <option value="배출">배출</option>
                        <option value="수거">수거</option>
                    </select>
                    <input
                        type="text"
                        placeholder="로그 검색"
                        className="border p-1 rounded w-full mb-2"
                    />
                    <ul className="border rounded h-[400px] overflow-y-auto">
                        {(logType === "배출" ? logs : pickupLogs)[selectedBox.id]?.map((log) => (
                            <li
                                key={log.id}
                                className={`p-2 border-b cursor-pointer ${selectedLog?.id === log.id ? "bg-gray-200" : ""}`}
                                onClick={() => setSelectedLog(log)}
                            >
                                {log.user} - {log.date.split(" ")[0]}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 상세 정보 영역 */}
                {selectedLog && (
                    <div className="bg-white shadow-md p-3 rounded w-2/3 h-[600px] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-2">
                            {logType === "수거" ? "수거 상세 정보" : "배출 상세 정보"}
                        </h2>
                        <p>
                            <strong>사용자:</strong>{" "}
                            {logType === "수거"
                                ? `${selectedLog.user} (${selectedLog.userid})`
                                : selectedLog.user}
                        </p>
                        <p>
                            <strong>{logType === "수거" ? "수거 일자" : "배출 일자"}:</strong>{" "}
                            {selectedLog.date}
                        </p>
                        <p>
                            <strong>수거함:</strong> {selectedBox.name}
                        </p>
                        {logType === "수거" && (
                            <p>
                                <strong>수거 좌표:</strong> {selectedLog.lat} / {selectedLog.lng}
                            </p>
                        )}
                        <p>
                            <strong>{logType === "수거" ? "수거 정보" : "배출 정보"}:</strong>{" "}
                            {selectedLog.batteries}
                        </p>
                    </div>
                )}
            </div>

            {/* 사용자 개폐 조작 모달 */}
            {showControlModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">사용자 개폐 조작</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowControlModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex gap-4 justify-center">
                            {["건전지", "방전 배터리", "잔여 용량 배터리"].map((type) => (
                                <div key={type} className="border p-4 rounded text-center bg-white shadow">
                                    <p className="font-semibold mb-2">{type}</p>
                                    <div className="flex justify-between gap-2">
                                        <button className="border p-2 rounded bg-gray-200 hover:bg-gray-300">개방</button>
                                        <button className="border p-2 rounded bg-gray-200 hover:bg-gray-300">폐쇄</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 수거자 개폐 조작 모달 */}
            {showCollectorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">수거자 개폐 조작</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowCollectorModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <div className="border p-4 rounded text-center bg-white shadow">
                                <p className="font-semibold mb-2">수거자 입구</p>
                                <div className="flex justify-between gap-2">
                                    <button className="border p-2 rounded bg-gray-200 hover:bg-gray-300">개방</button>
                                    <button className="border p-2 rounded bg-gray-200 hover:bg-gray-300">폐쇄</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoxControlLogPage;