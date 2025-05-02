"use client"

import { useEffect, useState } from "react"
import NavigationBar from "../component/NavigationBar"
import { Map, MapMarker, Circle } from "react-kakao-maps-sdk"
import { fetchFilteredRecommendedBoxes, fetchCoordinates } from "../api/apiServices"
import axios from "axios"

import pin from "../assets/pin.png"

// 커스텀 아이콘 import
import child_safety from "../assets/child_safety.png"
import fire_station from "../assets/fire-station.png"

// 어린이보호구역 반경 (미터)
const SAFETY_ZONE_RADIUS = 300

const locations = [
    {
        id: 1,
        type: "설치",
        name: "홍길동",
        region: "충청남도",
        district: "아산시",
        status: "설치 요청중",
        date: "2025-03-17",
        lat: 36.8082,
        lng: 127.009,
    },
    {
        id: 2,
        type: "설치",
        name: "김유신",
        region: "충청남도",
        district: "천안시",
        status: "설치 확정",
        date: "2025-03-16",
        lat: 36.809,
        lng: 127.01,
    },
    {
        id: 3,
        type: "제거",
        name: "이순신",
        region: "서울특별시",
        district: "강남구",
        status: "제거 요청중",
        date: "2025-03-15",
        lat: 36.8075,
        lng: 127.0115,
    },
]

const BoxAddRemovePage = () => {
    const [filter, setFilter] = useState("설치")
    const [search, setSearch] = useState("")
    const [selectedBox, setSelectedBox] = useState(null)
    const [region, setRegion] = useState("전체")
    const [district, setDistrict] = useState("전체")
    const [recommendedLocations, setRecommendedLocations] = useState([])
    const [files, setFiles] = useState({})
    const [showUploader, setShowUploader] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    // ✅ 소방서 및 어린이보호구역 좌표 상태 추가
    const [fireStations, setFireStations] = useState([])
    const [safetyZones, setSafetyZones] = useState([])
    const [showFireStations, setShowFireStations] = useState(true)
    const [showSafetyZones, setShowSafetyZones] = useState(true)
    // ✅ 어린이보호구역 반경 표시 여부
    const [showSafetyZoneRadius, setShowSafetyZoneRadius] = useState(true)

    // ✅ 선택된 군집 ID 상태 추가
    const [selectedCluster, setSelectedCluster] = useState(null)

    // 추천 위치 로드 함수에 디버깅 로그 추가
    const loadRecommended = async () => {
        try {
            const data = await fetchFilteredRecommendedBoxes()
            console.log("✅ 추천 위치 데이터:", data)

            // 데이터 구조 분석 로그 추가
            if (data && data.length > 0) {
                console.log("📊 데이터 샘플:", data[0])
                console.log("📊 군집 유형:", [...new Set(data.map((item) => item.point_type))])
                console.log("📊 군집 ID 목록:", [
                    ...new Set(data.filter((item) => item.cluster !== undefined).map((item) => item.cluster)),
                ])
            }

            setRecommendedLocations(data)
        } catch (err) {
            console.error("❌ 추천 위치 불러오기 실패:", err)
        }
    }

    // ✅ 소방서 및 어린이보호구역 좌표 로드 함수
    const loadCoordinates = async () => {
        try {
            console.log("📌 좌표 데이터 로드 시작...")
            setIsLoading(true)
            const data = await fetchCoordinates()
            console.log("📌 받은 데이터:", data)

            if (data && data.fireStations) {
                // 소방서 좌표 변환 (위도, 경도 배열을 객체로)
                const formattedFireStations = data.fireStations.map((coords, index) => ({
                    id: `fire-${index}`,
                    lat: coords[0],
                    lng: coords[1],
                    type: "fireStation",
                }))

                setFireStations(formattedFireStations)
                console.log(`✅ ${formattedFireStations.length}개의 소방서 좌표 로드 완료`)
            } else {
                console.warn("⚠️ 소방서 좌표 데이터가 없거나 형식이 잘못되었습니다.")
            }

            if (data && data.safetyZones) {
                // 어린이보호구역 좌표 변환 (위도, 경도 배열을 객체로)
                const formattedSafetyZones = data.safetyZones.map((coords, index) => ({
                    id: `safety-${index}`,
                    lat: coords[0],
                    lng: coords[1],
                    type: "safetyZone",
                }))

                setSafetyZones(formattedSafetyZones)
                console.log(`✅ ${formattedSafetyZones.length}개의 어린이보호구역 좌표 로드 완료`)
            } else {
                console.warn("⚠️ 어린이보호구역 좌표 데이터가 없거나 형식이 잘못되었습니다.")
            }
        } catch (err) {
            console.error("❌ 좌표 데이터 불러오기 실패:", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadRecommended()
        loadCoordinates() // ✅ 컴포넌트 마운트 시 좌표 데이터 로드
    }, [])

    const handleFileChange = (e, key) => {
        setFiles((prev) => ({ ...prev, [key]: e.target.files[0] }))
    }

    const handleUploadAll = async () => {
        try {
            setIsUploading(true)
            const requiredKeys = [
                "population",
                "boundarycpg",
                "boundarydbf",
                "boundaryprj",
                "boundaryshp",
                "boundaryshx",
                "fireStation",
                "childSafety",
            ]

            const allFilled = requiredKeys.every((key) => files[key])
            if (!allFilled) {
                alert("⚠️ 모든 파일을 선택해주세요.")
                return
            }

            const formData = new FormData()
            requiredKeys.forEach((key) => formData.append(key, files[key]))

            await axios.post("http://localhost:5000/upload-multiple", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            alert("✅ 모든 파일 업로드 성공!")

            // ✅ 파일 업로드 후 좌표 데이터 다시 로드
            loadCoordinates()
        } catch (err) {
            console.error("❌ 업로드 실패:", err)
            alert("❌ 업로드 실패: " + (err.response?.data || err.message))
        } finally {
            setIsUploading(false)
        }
    }

    const filteredLocations = locations.filter(
        (loc) =>
            loc.type === filter &&
            (region === "전체" || loc.region === region) &&
            (district === "전체" || loc.district === district) &&
            loc.name.includes(search),
    )

    // handleCentroidClick 함수 수정 - 문자열/숫자 타입 문제 해결
    const handleCentroidClick = (centroid) => {
        console.log("🎯 중심점 클릭:", centroid)

        // 클릭한 중심점의 군집 ID를 숫자로 확보
        const clickedClusterId = Number(centroid.cluster)

        if (selectedCluster === clickedClusterId) {
            console.log("🔄 같은 군집 선택 해제:", clickedClusterId)
            setSelectedCluster(null)
        } else {
            console.log("🔄 새 군집 선택:", clickedClusterId)
            setSelectedCluster(clickedClusterId)
        }

        // 상세 정보 표시
        setSelectedBox({
            ...centroid,
            name: `군집 중심점 #${centroid.cluster}`,
            type: "군집 중심점",
        })
    }

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
                        <button onClick={handleUploadAll} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            📤 업로드 실행
                        </button>
                        {/* 업로드 중 표시 */}
                        {isUploading && (
                            <div className="text-blue-600 ml-4">파일 업로드 중... 최대 7시간이 소요될 수 있습니다.</div>
                        )}
                    </div>
                </div>
            )}

            {/* ✅ 지도 레이어 토글 버튼 추가 */}
            <div className="mt-4 w-3/4 flex gap-2">
                <button
                    onClick={() => setShowFireStations(!showFireStations)}
                    className={`px-3 py-1 rounded ${showFireStations ? "bg-red-600 text-white" : "bg-gray-300"}`}
                >
                    🚒 소방서 {showFireStations ? "숨기기" : "표시하기"} ({fireStations.length})
                </button>
                <button
                    onClick={() => setShowSafetyZones(!showSafetyZones)}
                    className={`px-3 py-1 rounded ${showSafetyZones ? "bg-yellow-500 text-white" : "bg-gray-300"}`}
                >
                    🚸 어린이보호구역 {showSafetyZones ? "숨기기" : "표시하기"} ({safetyZones.length})
                </button>
                {/* ✅ 어린이보호구역 반경 표시 토글 버튼 추가 */}
                <button
                    onClick={() => setShowSafetyZoneRadius(!showSafetyZoneRadius)}
                    className={`px-3 py-1 rounded ${showSafetyZoneRadius ? "bg-yellow-300 text-yellow-800" : "bg-gray-300"}`}
                >
                    ⭕ 보호구역 반경 {showSafetyZoneRadius ? "숨기기" : "표시하기"}
                </button>

                {/* ✅ 선택된 군집 초기화 버튼 */}
                {selectedCluster !== null && (
                    <button onClick={() => setSelectedCluster(null)} className="px-3 py-1 rounded bg-purple-600 text-white">
                        🔄 군집 선택 초기화
                    </button>
                )}
            </div>

            {/* 지도 */}
            <div className="mt-2 w-3/4 bg-white shadow-md p-4 rounded">
                <Map center={{ lat: 36.8082, lng: 127.009 }} style={{ width: "100%", height: "450px" }} level={3}>
                    {/* ✅ 어린이보호구역 반경 원 추가 */}
                    {showSafetyZones &&
                        showSafetyZoneRadius &&
                        safetyZones.map((zone) => (
                            <Circle
                                key={`circle-${zone.id}`}
                                center={{
                                    lat: zone.lat,
                                    lng: zone.lng,
                                }}
                                radius={SAFETY_ZONE_RADIUS} // 300미터 반경
                                strokeWeight={2} // 외곽선 두께
                                strokeColor={"#FFCC00"} // 외곽선 색상 (노란색)
                                strokeOpacity={0.5} // 외곽선 투명도
                                strokeStyle={"solid"} // 외곽선 스타일
                                fillColor={"#FFCC00"} // 내부 색상 (노란색)
                                fillOpacity={0.2} // 내부 투명도 (반투명)
                            />
                        ))}

                    {/* 기존 마커 */}
                    {filteredLocations.map((loc) => (
                        <MapMarker
                            key={`loc-${loc.id}`}
                            position={{ lat: loc.lat, lng: loc.lng }}
                            onClick={() => setSelectedBox(loc)}
                        />
                    ))}

                    {/* ✅ 추천 위치 마커 (point_type에 따라 다르게 표시) - MapMarker로 변경 */}
                    {recommendedLocations
                        .filter((loc) => loc.point_type === "noise")
                        .map((loc, index) => (
                            <MapMarker
                                key={`noise-${index}`}
                                position={{ lat: loc.lat, lng: loc.lng }}
                                image={{
                                    src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                                    size: { width: 24, height: 35 },
                                }}
                                onClick={() =>
                                    setSelectedBox({
                                        ...loc,
                                        name: `독립 추천 위치 #${index + 1}`,
                                        type: "독립 추천 위치",
                                    })
                                }
                            />
                        ))}

                    {/* ✅ 군집 중심점 마커 - MapMarker로 변경 */}
                    {recommendedLocations
                        .filter((loc) => loc.point_type === "centroid")
                        .map((centroid, index) => {
                            console.log(`렌더링 중심점 #${centroid.cluster}:`, centroid)
                            return (
                                <MapMarker
                                    key={`centroid-${index}`}
                                    position={{ lat: centroid.lat, lng: centroid.lng }}
                                    image={{
                                        src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                                        size: { width: 32, height: 35 },
                                    }}
                                    onClick={() => {
                                        console.log(`중심점 #${centroid.cluster} 클릭됨!`)
                                        handleCentroidClick(centroid)
                                    }}
                                />
                            )
                        })}

                    {/* ✅ 군집 멤버 마커 (선택된 군집의 멤버만 표시) - 커스텀 핀 아이콘으로 변경 */}
                    {selectedCluster !== null &&
                        recommendedLocations
                            .filter((loc) => {
                                const isClusterMember = loc.point_type === "cluster_member"
                                const locCluster = Number(loc.cluster)
                                const selCluster = Number(selectedCluster)
                                const matchesSelectedCluster = locCluster === selCluster

                                console.log(
                                    `멤버 검사: ${loc.point_type} / 클러스터 ${locCluster} vs ${selCluster} = ${matchesSelectedCluster}`,
                                )

                                return isClusterMember && matchesSelectedCluster
                            })
                            .map((member, index) => (
                                <MapMarker
                                    key={`member-${index}`}
                                    position={{ lat: member.lat, lng: member.lng }}
                                    image={{
                                        src: pin, // 커스텀 핀 아이콘으로 변경
                                        size: { width: 32, height: 32 }, // 크기 조정
                                    }}
                                    onClick={() =>
                                        setSelectedBox({
                                            ...member,
                                            name: `군집 멤버 #${index + 1}`,
                                            type: "군집 멤버",
                                        })
                                    }
                                />
                            ))}

                    {/* ✅ 소방서 마커 - 커스텀 아이콘으로 변경 */}
                    {showFireStations &&
                        fireStations.map((station) => (
                            <MapMarker
                                key={station.id}
                                position={{ lat: station.lat, lng: station.lng }}
                                image={{
                                    src: fire_station,
                                    size: { width: 32, height: 32 },
                                }}
                                onClick={() =>
                                    setSelectedBox({
                                        ...station,
                                        name: `소방서 #${station.id.split("-")[1]}`,
                                        type: "소방서",
                                    })
                                }
                            />
                        ))}

                    {/* ✅ 어린이보호구역 마커 - 커스텀 아이콘으로 변경 */}
                    {showSafetyZones &&
                        safetyZones.map((zone) => (
                            <MapMarker
                                key={zone.id}
                                position={{ lat: zone.lat, lng: zone.lng }}
                                image={{
                                    src: child_safety,
                                    size: { width: 32, height: 32 },
                                }}
                                onClick={() =>
                                    setSelectedBox({
                                        ...zone,
                                        name: `어린이보호구역 #${zone.id.split("-")[1]}`,
                                        type: "어린이보호구역",
                                    })
                                }
                            />
                        ))}
                </Map>
            </div>

            {/* 로딩 상태 표시 */}
            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-lg">데이터를 불러오는 중...</div>
                        <div className="mt-4">
                            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ 추천 위치 정보 */}
            <div className="mt-2 w-3/4 bg-white shadow-md p-3 rounded">
                <h2 className="text-lg font-semibold mb-1">추천 위치 정보</h2>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center">
            <span className="mr-1">
              <img
                  src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png"
                  alt="중심점"
                  width="16"
                  height="16"
              />
            </span>
                        <span>군집 중심점</span>
                    </div>
                    <div className="flex items-center">
            <span className="mr-1">
              <img src={pin || "/placeholder.svg"} alt="군집 멤버" width="16" height="16" />
            </span>
                        <span>군집 멤버</span>
                    </div>
                    <div className="flex items-center">
            <span className="mr-1">
              <img
                  src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
                  alt="독립 추천 위치"
                  width="16"
                  height="16"
              />
            </span>
                        <span>독립 추천 위치</span>
                    </div>

                    {selectedCluster !== null && (
                        <div className="ml-auto text-purple-700 font-semibold">
                            선택된 군집: #{selectedCluster}
                            (멤버{" "}
                            {
                                recommendedLocations.filter(
                                    (loc) => loc.point_type === "cluster_member" && Number(loc.cluster) === Number(selectedCluster),
                                ).length
                            }
                            개)
                        </div>
                    )}
                </div>
            </div>

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

                <input
                    type="text"
                    placeholder="이름 검색"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border p-1 rounded ml-auto"
                />
            </div>

            {/* 리스트 및 상세 정보 */}
            <div className="mt-2 w-3/4 flex gap-4">
                <div className="bg-white shadow-md p-3 rounded w-1/2">
                    <h2 className="text-lg font-semibold mb-1">{filter} 목록</h2>
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

                    {/* ✅ 추천 위치 목록 */}
                    <div className="mt-4">
                        <h3 className="font-semibold border-b pb-1">🎯 군집 중심점 목록</h3>
                        <ul className="max-h-40 overflow-y-auto">
                            {recommendedLocations
                                .filter((loc) => loc.point_type === "centroid")
                                .slice(0, 5)
                                .map((centroid, index) => (
                                    <li
                                        key={`centroid-list-${index}`}
                                        className={`p-1 border-b cursor-pointer ${
                                            Number(selectedCluster) === Number(centroid.cluster) ? "bg-purple-100" : ""
                                        }`}
                                        onClick={() => handleCentroidClick(centroid)}
                                    >
                                        <span className="text-red-500">🎯</span> 군집 #{centroid.cluster} 중심점
                                    </li>
                                ))}
                            {recommendedLocations.filter((loc) => loc.point_type === "centroid").length > 5 && (
                                <li className="text-sm text-gray-500 p-1">
                                    외 {recommendedLocations.filter((loc) => loc.point_type === "centroid").length - 5}개...
                                </li>
                            )}
                        </ul>

                        <h3 className="font-semibold border-b pb-1 mt-2">📍 독립 추천 위치 목록</h3>
                        <ul className="max-h-40 overflow-y-auto">
                            {recommendedLocations
                                .filter((loc) => loc.point_type === "noise")
                                .slice(0, 5)
                                .map((noise, index) => (
                                    <li
                                        key={`noise-list-${index}`}
                                        className="p-1 border-b cursor-pointer"
                                        onClick={() =>
                                            setSelectedBox({
                                                ...noise,
                                                name: `독립 추천 위치 #${index + 1}`,
                                                type: "독립 추천 위치",
                                            })
                                        }
                                    >
                                        <span className="text-green-500">📍</span> 독립 추천 위치 #{index + 1}
                                    </li>
                                ))}
                            {recommendedLocations.filter((loc) => loc.point_type === "noise").length > 5 && (
                                <li className="text-sm text-gray-500 p-1">
                                    외 {recommendedLocations.filter((loc) => loc.point_type === "noise").length - 5}개...
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* ✅ 소방서 및 어린이보호구역 정보 추가 */}
                    <div className="mt-4">
                        <h3 className="font-semibold border-b pb-1">🚒 소방서 목록</h3>
                        <ul className="max-h-40 overflow-y-auto">
                            {fireStations.slice(0, 5).map((station) => (
                                <li
                                    key={station.id}
                                    className={`p-1 border-b cursor-pointer ${selectedBox?.id === station.id ? "bg-gray-200" : ""}`}
                                    onClick={() =>
                                        setSelectedBox({
                                            ...station,
                                            name: `소방서 #${station.id.split("-")[1]}`,
                                            type: "소방서",
                                        })
                                    }
                                >
                                    <span className="text-red-500">🚒</span> 소방서 #{station.id.split("-")[1]}
                                </li>
                            ))}
                            {fireStations.length > 5 && (
                                <li className="text-sm text-gray-500 p-1">외 {fireStations.length - 5}개...</li>
                            )}
                        </ul>

                        <h3 className="font-semibold border-b pb-1 mt-2">🚸 어린이보호구역 목록</h3>
                        <ul className="max-h-40 overflow-y-auto">
                            {safetyZones.slice(0, 5).map((zone) => (
                                <li
                                    key={zone.id}
                                    className={`p-1 border-b cursor-pointer ${selectedBox?.id === zone.id ? "bg-gray-200" : ""}`}
                                    onClick={() =>
                                        setSelectedBox({
                                            ...zone,
                                            name: `어린이보호구역 #${zone.id.split("-")[1]}`,
                                            type: "어린이보호구역",
                                        })
                                    }
                                >
                                    <span className="text-yellow-500">🚸</span> 어린이보호구역 #{zone.id.split("-")[1]}
                                </li>
                            ))}
                            {safetyZones.length > 5 && (
                                <li className="text-sm text-gray-500 p-1">외 {safetyZones.length - 5}개...</li>
                            )}
                        </ul>
                    </div>
                </div>

                {selectedBox && (
                    <div className="bg-white shadow-md p-3 rounded w-1/2">
                        <h2 className="text-lg font-semibold mb-1">상세 정보</h2>
                        <p>
                            <strong>이름:</strong> {selectedBox.name}
                        </p>
                        <p>
                            <strong>유형:</strong> {selectedBox.type}
                        </p>
                        {selectedBox.type !== "추천" &&
                            selectedBox.type !== "소방서" &&
                            selectedBox.type !== "어린이보호구역" &&
                            selectedBox.type !== "군집 중심점" &&
                            selectedBox.type !== "군집 멤버" &&
                            selectedBox.type !== "독립 추천 위치" && (
                                <>
                                    <p>
                                        <strong>광역시/도:</strong> {selectedBox.region}
                                    </p>
                                    <p>
                                        <strong>담당 지역:</strong> {selectedBox.district}
                                    </p>
                                    <p>
                                        <strong>알림 일자:</strong> {selectedBox.date}
                                    </p>
                                    <p>
                                        <strong>상태:</strong> {selectedBox.status}
                                    </p>
                                </>
                            )}
                        <p>
                            <strong>좌표:</strong> {selectedBox.lat} / {selectedBox.lng}
                        </p>

                        {/* 군집 관련 정보 표시 */}
                        {(selectedBox.type === "군집 중심점" || selectedBox.type === "군집 멤버") && (
                            <p>
                                <strong>군집 ID:</strong> {selectedBox.cluster}
                            </p>
                        )}

                        {selectedBox.type === "군집 중심점" && (
                            <p>
                                <strong>군집 멤버 수:</strong>{" "}
                                {
                                    recommendedLocations.filter(
                                        (loc) => loc.point_type === "cluster_member" && Number(loc.cluster) === Number(selectedBox.cluster),
                                    ).length
                                }
                                개
                            </p>
                        )}

                        {/* 선택한 위치로 지도 중심 이동 버튼 */}
                        <button
                            onClick={() => {
                                const mapElement = document.querySelector(".kakao-map")
                                if (mapElement) {
                                    const map = window.kakao.maps.Map.getMapByElement(mapElement)
                                    if (map) {
                                        map.setCenter(new window.kakao.maps.LatLng(selectedBox.lat, selectedBox.lng))
                                        map.setLevel(3) // 더 가깝게 확대
                                    }
                                }
                            }}
                            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                            🔍 지도에서 확대하기
                        </button>

                        {/* 군집 중심점인 경우 군집 멤버 표시/숨기기 버튼 */}
                        {selectedBox.type === "군집 중심점" && (
                            <button
                                onClick={() => {
                                    if (Number(selectedCluster) === Number(selectedBox.cluster)) {
                                        setSelectedCluster(null)
                                    } else {
                                        setSelectedCluster(Number(selectedBox.cluster))
                                    }
                                }}
                                className={`mt-2 ml-2 px-3 py-1 rounded ${
                                    Number(selectedCluster) === Number(selectedBox.cluster) ? "bg-purple-600 text-white" : "bg-gray-300"
                                }`}
                            >
                                {Number(selectedCluster) === Number(selectedBox.cluster) ? "👁️ 멤버 숨기기" : "👁️ 멤버 표시하기"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BoxAddRemovePage
