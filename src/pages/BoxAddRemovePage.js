import React, { useEffect, useState } from "react";
import NavigationBar from "../component/NavigationBar";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { fetchFilteredRecommendedBoxes } from "../api/apiServices";
import axios from "axios";

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
    const [recommendedLocations, setRecommendedLocations] = useState([]);
    const [files, setFiles] = useState({});
    const [showUploader, setShowUploader] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const loadRecommended = async () => {
        try {
            const data = await fetchFilteredRecommendedBoxes();
            setRecommendedLocations(data);
        } catch (err) {
            console.error("❌ 추천 위치 불러오기 실패:", err);
        }
    };

    useEffect(() => {
        loadRecommended();
    }, []);

    const handleFileChange = (e, key) => {
        setFiles((prev) => ({ ...prev, [key]: e.target.files[0] }));
    };

    const handleUploadAll = async () => {
        try {
            setIsUploading(true);
            const requiredKeys = [
                "population",
                "boundarycpg",
                "boundarydbf",
                "boundaryprj",
                "boundaryshp",
                "boundaryshx",
                "fireStation",
                "childSafety",
            ];

            const allFilled = requiredKeys.every((key) => files[key]);
            if (!allFilled) {
                alert("⚠️ 모든 파일을 선택해주세요.");
                return;
            }

            const formData = new FormData();
            requiredKeys.forEach((key) => formData.append(key, files[key]));

            await axios.post("http://localhost:5000/upload-multiple", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("✅ 모든 파일 업로드 성공!");
        } catch (err) {
            console.error("❌ 업로드 실패:", err);
            alert("❌ 업로드 실패: " + (err.response?.data || err.message));
        } finally {
            setIsUploading(false);
        }
    };

    const filteredLocations = locations.filter(
        (loc) =>
            loc.type === filter &&
            (region === "전체" || loc.region === region) &&
            (district === "전체" || loc.district === district) &&
            loc.name.includes(search)
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 items-center px-4 pb-10">
            <NavigationBar />

            {/* ✅ 업로드 토글 버튼 */}
            <div className="mt-20 w-3/4 text-right">
                <button
                    onClick={() => setShowUploader(!showUploader)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {showUploader ? "📁 업로드 창 닫기" : "📁 데이터 업로드 열기"}
                </button>
            </div>

            {/* ✅ 파일 업로드 박스 */}
            {showUploader && (
                <div className="mt-4 w-3/4 bg-white shadow-md rounded p-4">
                    <h2 className="text-lg font-bold mb-2">📁 수거함 추천 시스템 최신화를 위한 데이터 업로드</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold">① 인구밀도 데이터 </label>
                            <input type="file" accept=".csv,.txt" onChange={(e) => handleFileChange(e, "population")} />
                        </div>
                        {["cpg", "dbf", "prj", "shp", "shx"].map((n) => (
                            <div key={n}>
                                <label className="font-semibold">② 경계 데이터 {n} </label>
                                <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, `boundary${n}`)} />
                            </div>
                        ))}
                        <div>
                            <label className="font-semibold">③ 119안전센터 현황 </label>
                            <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, "fireStation")} />
                        </div>
                        <div>
                            <label className="font-semibold">④ 어린이보호구역 표준데이터 </label>
                            <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, "childSafety")} />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={handleUploadAll}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            📤 업로드 실행
                        </button>
                        {/* 업로드 중 표시 */}
                        {isUploading && (
                            <div className="text-blue-600 ml-4">파일 업로드 중... 잠시만 기다려 주세요. 최대 10분이 소요될 수 있습니다.</div>
                        )}
                    </div>
                </div>
            )}

            {/* 지도 */}
            <div className="mt-4 w-3/4 bg-white shadow-md p-4 rounded">
                <Map center={{ lat: 36.8082, lng: 127.0090 }} style={{ width: "100%", height: "450px" }} level={3}>
                    {filteredLocations.map((loc) => (
                        <MapMarker
                            key={`loc-${loc.id}`}
                            position={{ lat: loc.lat, lng: loc.lng }}
                            onClick={() => setSelectedBox(loc)}
                        />
                    ))}
                    {recommendedLocations.map((loc, index) => (
                        <MapMarker
                            key={`rec-${index}`}
                            position={{ lat: loc.lat, lng: loc.lng }}
                            image={{
                                src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                                size: { width: 24, height: 35 },
                            }}
                            onClick={() => setSelectedBox({ ...loc, name: `추천${index + 1}`, type: "추천" })}
                        />
                    ))}
                </Map>
            </div>

            {/* 로딩 상태 표시 */}
            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-lg">추천 위치를 불러오는 중...</div>
                        <div className="mt-4">
                            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 필터 UI */}
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
                    disabled={region === "전체"}
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

            {/* 리스트 및 상세 정보 */}
            <div className="mt-2 w-3/4 flex gap-4">
                <div className="bg-white shadow-md p-3 rounded w-1/2">
                    <h2 className="text-lg font-semibold mb-1">{filter} 목록</h2>
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
                        {filter === "설치" && recommendedLocations.length > 0 && (
                            <>
                                <hr className="my-2" />
                                <li className="text-sm text-gray-500">⭐ 추천 위치 {recommendedLocations.length}개</li>
                            </>
                        )}
                    </ul>
                </div>

                {selectedBox && (
                    <div className="bg-white shadow-md p-3 rounded w-1/2">
                        <h2 className="text-lg font-semibold mb-1">상세 정보</h2>
                        <p><strong>이름:</strong> {selectedBox.name}</p>
                        {selectedBox.type !== "추천" && (
                            <>
                                <p><strong>광역시/도:</strong> {selectedBox.region}</p>
                                <p><strong>담당 지역:</strong> {selectedBox.district}</p>
                                <p><strong>알림 일자:</strong> {selectedBox.date}</p>
                                <p><strong>상태:</strong> {selectedBox.status}</p>
                            </>
                        )}
                        <p><strong>좌표:</strong> {selectedBox.lat} / {selectedBox.lng}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoxAddRemovePage;
