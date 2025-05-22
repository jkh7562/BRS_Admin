import React, { useState } from "react";
import NavigationBar from "../../component/NavigationBar";
import { Map, MapMarker } from "react-kakao-maps-sdk";

// 더미 데이터
const logs = [
    // 설치
    { id: 1, type: "설치", name: "홍길동", status: "설치 요청중", date: "2025/03/17", region: "충청남도", district: "아산시", lat: 36.80823242, lng: 127.0090151 },
    { id: 2, type: "설치", name: "홍길동", status: "설치 완료", date: "2025/03/16", region: "충청남도", district: "천안시" },
    // 제거
    { id: 3, type: "제거", name: "홍길동", status: "제거 요청중", date: "2025/03/17", region: "충청남도", district: "아산시", lat: 36.80823242, lng: 127.0090151 },
    { id: 4, type: "제거", name: "홍길동", status: "제거 확정", date: "2025/03/15", region: "충청남도", district: "천안시" },
    // 수거예약
    { id: 5, type: "수거예약", name: "홍길동", date: "2025/03/17", region: "충청남도", district: "아산시", location: "선문대 동문 앞 수거함", lat: 36.80823242, lng: 127.0090151 },
    // 화재 후 재가동
    { id: 6, type: "화재 후 재가동", name: "홍길동", status: "재가동 완료", date: "2025/03/17", region: "충청남도", district: "아산시", location: "선문대 동문 앞 수거함", lat: 36.80823242, lng: 127.0090151 },
];

const MonitoringPage = () => {
    const [notification, setNotification] = useState("설치");
    const [search, setSearch] = useState("");
    const [region, setRegion] = useState("전체");
    const [district, setDistrict] = useState("전체");
    const [statusFilter, setStatusFilter] = useState("전체");
    const [selected, setSelected] = useState(null);

    const statusOptions = {
        설치: ["설치 요청중", "설치 진행중", "설치 완료", "설치 확정"],
        제거: ["제거 요청중", "제거 진행중", "제거 완료", "제거 확정"],
        "화재 후 재가동": ["재가동 완료", "재가동 확정"],
        수거예약: [],
    };

    const filteredLogs = logs.filter(
        (log) =>
            log.type === notification &&
            (region === "전체" || log.region === region) &&
            (district === "전체" || log.district === district) &&
            log.name.includes(search) &&
            (statusFilter === "전체" || log.status === statusFilter || !log.status)
    );

    return (
        <div className="min-h-screen bg-gray-100 px-6">
            <NavigationBar />

            {/* 지도 */}
            <div className="flex justify-center mb-4">
                <div className="mt-24 w-3/4 bg-white shadow-md p-4 rounded">
                    <Map
                        center={{
                            lat: selected?.lat ?? 36.80823242,
                            lng: selected?.lng ?? 127.0090151,
                        }}
                        style={{ width: "100%", height: "450px" }}
                        level={3}
                    >
                        {selected && selected.lat && selected.lng && (
                            <MapMarker position={{ lat: selected.lat, lng: selected.lng }} />
                        )}
                    </Map>
                </div>
            </div>

            {/* 필터 */}
            <div className="w-3/4 mx-auto mt-2 bg-white shadow-md p-3 rounded flex items-center gap-2">
                <label>알림 종류:</label>
                <select value={notification} onChange={(e) => {
                    setNotification(e.target.value);
                    setStatusFilter("전체");
                    setSelected(null);
                }} className="border p-1 rounded">
                    <option>설치</option>
                    <option>제거</option>
                    <option>수거예약</option>
                    <option>화재 후 재가동</option>
                </select>

                <label className="ml-4">광역시/도:</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="border p-1 rounded">
                    <option>전체</option>
                    <option>충청남도</option>
                    <option>서울특별시</option>
                </select>

                <label className="ml-4">시/군/구:</label>
                <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="border p-1 rounded"
                    disabled={region === "전체"} // ← 여기서 비활성화 조건 추가
                >
                    <option value="전체">전체</option>
                    {region === "충청남도" && (
                        <>
                            <option value="아산시">아산시</option>
                            <option value="천안시">천안시</option>
                        </>
                    )}
                    {region === "서울특별시" && <option value="강남구">강남구</option>}
                </select>
            </div>

            {/* 리스트 + 상세 */}
            <div className="mt-2 w-3/4 flex gap-4 mx-auto">
                {/* 리스트 */}
                <div className="bg-white shadow-md p-3 rounded w-1/2">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold">{notification} 목록</h2>
                        {statusOptions[notification]?.length > 0 && (
                            <>
                                <label className="text-base font-medium">상태:</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border p-1 rounded text-sm"
                                >
                                    <option value="전체">전체</option>
                                    {statusOptions[notification].map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="이름 검색"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border p-1 rounded w-full mb-1"
                    />
                    <ul>
                        {filteredLogs.map((log) => (
                            <li
                                key={log.id}
                                className={`p-1 border-b cursor-pointer ${selected?.id === log.id ? "bg-gray-200" : ""}`}
                                onClick={() => setSelected(log)}
                            >
                                <strong>{log.name}</strong>
                                {log.status && ` - ${log.status}`} ({log.date})
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 상세 정보 */}
                {selected && (
                    <div className="bg-white shadow-md p-3 rounded w-1/2">
                        <h2 className="text-lg font-semibold mb-2">상세 정보</h2>
                        <p><strong>{notification === "화재 후 재가동" ? "수거자" : "이름"}:</strong> {selected.name} (jkh7562)</p>
                        {notification !== "수거예약" && notification !== "화재 후 재가동" && (
                            <>
                                <p><strong>광역시/도:</strong> {selected.region}</p>
                                <p><strong>담당 지역:</strong> {selected.district}</p>
                            </>
                        )}
                        <p><strong>{notification === "화재 후 재가동" ? "재가동 일자" : "알림 일자"}:</strong> {selected.date} 18:22:40</p>
                        {notification === "수거예약" || notification === "화재 후 재가동" ? (
                            <>
                                <p><strong>수거함:</strong> {selected.location}</p>
                                <p><strong>수거 좌표:</strong> {selected.lat} / {selected.lng}</p>
                            </>
                        ) : (
                            <p><strong>{notification} 좌표:</strong> {selected.lat} / {selected.lng}</p>
                        )}
                        {selected.status && (
                            <p><strong>상태:</strong> {selected.status}</p>
                        )}
                        {notification === "화재 후 재가동" && (
                            <>
                                <div className="mt-4 w-full h-32 border text-center flex items-center justify-center">사진</div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="px-4 py-1 bg-blue-500 text-white rounded">수락</button>
                                    <button className="px-4 py-1 bg-red-500 text-white rounded">거절</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonitoringPage;
