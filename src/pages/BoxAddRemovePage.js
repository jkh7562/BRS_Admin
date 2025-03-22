import React, { useState } from "react";
import NavigationBar from "../component/NavigationBar";
import { Map, MapMarker } from "react-kakao-maps-sdk";

const locations = [
    { id: 1, type: "설치", name: "홍길동", region: "충청남도", district: "아산시", status: "설치 요청중", date: "2025-03-17", lat: 36.8082, lng: 127.0090 },
    { id: 2, type: "설치", name: "김유신", region: "충청남도", district: "천안시", status: "설치 확정", date: "2025-03-16", lat: 36.8090, lng: 127.0100 },
    { id: 3, type: "제거", name: "이순신", region: "서울특별시", district: "강남구", status: "제거 요청중", date: "2025-03-15", lat: 36.8075, lng: 127.0115 },
];

const BoxAddRemovePage = () => {
    const [filter, setFilter] = useState("설치");
    const [search, setSearch] = useState("");
    const [selectedBox, setSelectedBox] = useState(null);
    const [region, setRegion] = useState("전체");
    const [district, setDistrict] = useState("전체");

    const filteredLocations = locations.filter(
        (loc) =>
            loc.type === filter &&
            (region === "전체" || loc.region === region) &&
            (district === "전체" || loc.district === district) &&
            loc.name.includes(search)
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 items-center px-4">
            <NavigationBar />

            {/* 상단 여백 추가 */}
            <div className="mt-24 w-3/4 bg-white shadow-md p-4 rounded">
                <Map center={{ lat: 36.8082, lng: 127.0090 }} style={{ width: "100%", height: "450px" }} level={3}>
                    {filteredLocations.map((loc) => (
                        <MapMarker key={loc.id} position={{ lat: loc.lat, lng: loc.lng }} onClick={() => setSelectedBox(loc)} />
                    ))}
                </Map>
            </div>

            {/* 필터 */}
            <div className="mt-2 w-3/4 flex items-center gap-2 bg-white shadow-md p-3 rounded">
                <label>현황:</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-1 rounded">
                    <option value="설치">설치</option>
                    <option value="제거">제거</option>
                </select>

                <label>광역시/도:</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="border p-1 rounded">
                    <option value="전체">전체</option>
                    <option value="충청남도">충청남도</option>
                    <option value="서울특별시">서울특별시</option>
                </select>

                <label>시/군/구:</label>
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

            {/* 리스트 및 상세정보 */}
            <div className="mt-2 w-3/4 flex gap-4">
                {/* 리스트 */}
                <div className="bg-white shadow-md p-3 rounded w-1/2">
                    <h2 className="text-lg font-semibold mb-1">{filter} 목록</h2>

                    {/* 이름 검색 입력 필드 (목록 위쪽에 배치) */}
                    <input
                        type="text"
                        placeholder="이름 검색"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border p-1 rounded w-full mb-1"
                    />

                    <ul>
                        {filteredLocations.map((loc) => (
                            <li
                                key={loc.id}
                                className={`p-1 border-b cursor-pointer ${selectedBox?.id === loc.id ? "bg-gray-200" : ""}`}
                                onClick={() => setSelectedBox(loc)}
                            >
                                <strong>{loc.name}</strong> - {loc.status} ({loc.date})
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 상세 정보 */}
                {selectedBox && (
                    <div className="bg-white shadow-md p-3 rounded w-1/2">
                        <h2 className="text-lg font-semibold mb-1">상세 정보</h2>
                        <p><strong>이름:</strong> {selectedBox.name}</p>
                        <p><strong>광역시/도:</strong> {selectedBox.region}</p>
                        <p><strong>담당 지역:</strong> {selectedBox.district}</p>
                        <p><strong>알림 일자:</strong> {selectedBox.date}</p>
                        <p><strong>상태:</strong> {selectedBox.status}</p>
                        <p><strong>{filter} 좌표:</strong> {selectedBox.lat} / {selectedBox.lng}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoxAddRemovePage;
