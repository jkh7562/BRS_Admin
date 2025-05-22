import React, { useState } from "react";
import NavigationBar from "../component/NavigationBar";
import { Map } from "react-kakao-maps-sdk";

const collectors = [
    { id: "jkh7562", name: "홍길동", joinDate: "2025-02-03 18:22:40", phone: "01044444444", region: "충청남도", district: "아산시" },
    { id: "kim123", name: "김유신", joinDate: "2025-02-05 14:30:12", phone: "01012345678", region: "서울특별시", district: "강남구" },
];

const regions = {
    "전국": { lat: 36.50, lng: 127.75 },
    "충청남도": { lat: 36.6588, lng: 126.6728 },
    "서울특별시": { lat: 37.5665, lng: 126.9780 },
};

const districts = {
    "충청남도": ["아산시", "천안시"],
    "서울특별시": ["강남구", "종로구"]
};

const CollectorAssignmentPage = () => {
    const [search, setSearch] = useState("");
    const [selectedCollector, setSelectedCollector] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState("전국");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editRegion, setEditRegion] = useState("");
    const [editDistrict, setEditDistrict] = useState("");

    // 지역에 따른 수거자 필터링
    const filteredCollectors = collectors.filter(
        (col) => (selectedRegion === "전국" || col.region === selectedRegion) &&
            (selectedDistrict === "" || col.district === selectedDistrict)
    );

    // 담당 구역 변경 적용
    const handleSave = () => {
        if (selectedCollector) {
            selectedCollector.region = editRegion;
            selectedCollector.district = editDistrict;
            setIsEditing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 items-center px-4">
            <NavigationBar />

            {/* 지도 */}
            <div className="mt-24 w-3/4 bg-white shadow-md p-4 rounded">
                <Map center={regions[selectedRegion]} style={{ width: "100%", height: "400px" }} level={10} />
            </div>

            {/* 광역시/도, 시/군/구 선택 드롭다운 */}
            <div className="mt-4 w-3/4 flex gap-2 items-center bg-white shadow-md p-3 rounded">
                <label className="font-semibold">광역시/도:</label>
                <select
                    value={selectedRegion}
                    onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedDistrict(""); // 지역 변경 시 시/군/구 초기화
                    }}
                    className="border p-1 rounded"
                >
                    <option value="전국">전국</option>
                    <option value="충청남도">충청남도</option>
                    <option value="서울특별시">서울특별시</option>
                </select>

                <label className="font-semibold">시/군/구:</label>
                <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="border p-1 rounded"
                    disabled={selectedRegion === "전국"}
                >
                    <option value="">전체</option>
                    {districts[selectedRegion]?.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                    ))}
                </select>
            </div>

            {/* 검색 & 리스트 & 상세정보 */}
            <div className="mt-4 w-3/4 flex gap-4">
                {/* 왼쪽: 수거자 리스트 */}
                <div className="bg-white shadow-md p-3 rounded w-1/2">
                    <h2 className="text-lg font-semibold mb-2">수거자 목록</h2>

                    {/* 검색 필드 */}
                    <input
                        type="text"
                        placeholder="수거자 검색"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border p-1 rounded w-full mb-2"
                    />

                    {/* 리스트 */}
                    <ul className="border rounded h-64 overflow-y-auto">
                        {filteredCollectors
                            .filter((col) => col.name.includes(search))
                            .map((col) => (
                                <li
                                    key={col.id}
                                    className={`p-2 border-b cursor-pointer ${selectedCollector?.id === col.id ? "bg-gray-200" : ""}`}
                                    onClick={() => {
                                        setSelectedCollector(col);
                                        setEditRegion(col.region);
                                        setEditDistrict(col.district);
                                    }}
                                >
                                    {col.name}
                                </li>
                            ))}
                    </ul>
                </div>

                {/* 오른쪽: 상세정보 */}
                {selectedCollector && (
                    <div className="bg-white shadow-md p-3 rounded w-1/2">
                        <h2 className="text-lg font-semibold mb-2">수거자 정보</h2>
                        <p><strong>이름:</strong> {selectedCollector.name}</p>
                        <p><strong>가입 일자:</strong> {selectedCollector.joinDate}</p>
                        <p><strong>전화번호:</strong> {selectedCollector.phone}</p>
                        <p><strong>ID:</strong> {selectedCollector.id}</p>
                        <p><strong>담당 구역:</strong> {selectedCollector.region} {selectedCollector.district}</p>

                        {/* 담당 구역 변경 */}
                        <div className="mt-2">
                            {isEditing ? (
                                <div className="flex gap-2 items-center">
                                    <label className="font-semibold">광역시/도:</label>
                                    <select
                                        value={editRegion}
                                        onChange={(e) => {
                                            setEditRegion(e.target.value);
                                            setEditDistrict("");
                                        }}
                                        className="border p-1 rounded"
                                    >
                                        <option value="충청남도">충청남도</option>
                                        <option value="서울특별시">서울특별시</option>
                                    </select>

                                    <label className="font-semibold">시/군/구:</label>
                                    <select
                                        value={editDistrict}
                                        onChange={(e) => setEditDistrict(e.target.value)}
                                        className="border p-1 rounded"
                                        disabled={!editRegion}
                                    >
                                        {districts[editRegion]?.map((dist) => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>

                                    <button onClick={handleSave} className="p-1 bg-blue-500 text-white rounded">저장</button>
                                    <button onClick={() => setIsEditing(false)} className="p-1 bg-gray-300 text-black rounded">취소</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="p-1 bg-gray-300 text-black rounded">변경</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectorAssignmentPage;
