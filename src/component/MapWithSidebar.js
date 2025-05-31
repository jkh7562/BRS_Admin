import React, { useEffect, useState, useRef, useMemo, useCallback, memo } from "react"
import { Map, MapMarker, CustomOverlayMap, Circle } from "react-kakao-maps-sdk"
import ArrowLeftIcon from "../assets/arrow_left.png"
import ArrowRightIcon from "../assets/arrow_right.png"
import SearchIcon from "../assets/검색.png"
import CopyIcon from "../assets/copy.png"
import GreenIcon from "../assets/아이콘 GREEN.png"
import YellowIcon from "../assets/아이콘 YELLOW.png"
import RedIcon from "../assets/아이콘 RED.png"
import GreenSelectIcon from "../assets/아이콘 GREEN 선택효과.png"
import YellowSelectIcon from "../assets/아이콘 YELLOW 선택효과.png"
import RedSelectIcon from "../assets/아이콘 RED 선택효과.png"
import FireIcon from "../assets/아이콘 화재감지.svg"
import pin from "../assets/pin.png"
import child_safety from "../assets/child_safety.png"
import fire_station from "../assets/fire-station.png"
import Drop_downIcon from "../assets/Down.png"

// API 함수 import
import {
    requestInstallBox,
    requestRemoveBox,
    fetchFilteredRecommendedBoxes,
    fetchCoordinates,
    getBoxImage,
    boxFire,
} from "../api/apiServices"

// 메모이제이션된 마커 컴포넌트
const BoxMarker = memo(({ box, icon, size, onClick }) => {
    return (
        <MapMarker
            position={{ lat: box.lat, lng: box.lng }}
            image={{
                src: icon,
                size: size,
                options: { offset: { x: 20, y: 40 } },
            }}
            onClick={onClick}
        />
    )
})
BoxMarker.displayName = "BoxMarker"

// 메모이제이션된 리스트 아이템 컴포넌트
const BoxListItem = memo(
    ({ box, isSelected, address, formatInstallStatus, isAddRemovePage, handleClick, handleCopy, copiedId }) => {
        if (!isAddRemovePage) {
            console.log(`Box ${box.id} coordinates:`, {
                lat: box.lat,
                lng: box.lng,
                latType: typeof box.lat,
                lngType: typeof box.lat,
                lngType: typeof box.lng,
            })
        }

        return (
            <div
                className={`border-b border-gray-100 p-3 cursor-pointer ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                onClick={handleClick}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-[#21262B]">{box.name}</h3>
                        <p className="font-normal text-sm text-[#60697E] mt-2">{address || "주소 변환중..."}</p>
                        <p className="font-normal text-sm text-[#60697E] mt-1">
                            {isAddRemovePage ? (
                                formatInstallStatus(box.installStatus)
                            ) : (
                                <>수거량: {Math.max(box.volume1 || 0, box.volume2 || 0, box.volume3 || 0)}%</>
                            )}
                        </p>
                    </div>
                    <div className="relative">
                        <button className="text-gray-400 p-1" onClick={(e) => handleCopy(e, box.id, box.name)}>
                            <img src={CopyIcon || "/placeholder.svg"} alt="복사" className="w-4 h-5" />
                        </button>

                        {copiedId === box.id && (
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                                ✓
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    },
)
BoxListItem.displayName = "BoxListItem"

// 메모이제이션된 오버레이 컴포넌트
const PinOverlay = memo(({ position, title, children, onClose, zIndex = 3, yAnchor = 1.15 }) => {
    return (
        <CustomOverlayMap position={position} yAnchor={yAnchor} zIndex={zIndex}>
            <div
                className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={(e) => {
                            e.stopPropagation()
                            onClose && onClose(e)
                        }}
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </CustomOverlayMap>
    )
})
PinOverlay.displayName = "PinOverlay"

// 메모이제이션된 버튼 컴포넌트
const ActionButton = memo(({ onClick, className, disabled, children }) => {
    return (
        <button
            className={className}
            onClick={(e) => {
                e.stopPropagation()
                onClick && onClick(e)
            }}
            disabled={disabled}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
        >
            {children}
        </button>
    )
})
ActionButton.displayName = "ActionButton"

// 메모이제이션된 범례 컴포넌트
const MapLegend = memo(({ isAddRemovePage }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div
            className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md z-10 overflow-hidden"
            style={{ minWidth: "200px" }}
        >
            <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
                <span className="text-sm font-medium">범례</span>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    {isCollapsed ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    ) : (
                        <img src={Drop_downIcon || "/placeholder.svg"} alt="드롭다운" className="h-2 w-3" />
                    )}
                </button>
            </div>

            {!isCollapsed && (
                <div className={isAddRemovePage ? "p-2" : "py-1 px-2"}>
                    {isAddRemovePage ? (
                        // 설치/제거 페이지에서 표시할 아이콘들 (2열 그리드)
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                            <div className="flex items-center">
                                <div className="w-10 flex justify-center">
                                    <img src={GreenIcon || "/placeholder.svg"} alt="녹색 아이콘" className="w-9 h-10" />
                                </div>
                                <span className="text-xs ml-1">설치 상태</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-10 flex justify-center">
                                    <img src={RedIcon || "/placeholder.svg"} alt="빨간색 아이콘" className="w-9 h-10" />
                                </div>
                                <span className="text-xs ml-1">제거 상태</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-10 flex justify-center">
                                    <img
                                        src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
                                        alt="추천 위치"
                                        className="w-6 h-7"
                                    />
                                </div>
                                <span className="text-xs ml-1">설치 추천 위치</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-10 flex justify-center">
                                    <div className="relative">
                                        <img
                                            src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
                                            alt="밀집 중심 위치"
                                            className="w-6 h-7"
                                        />
                                        <div className="absolute -right-2 -top-1 bg-red-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                            n
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs ml-1">밀집 중심 위치</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-10 flex justify-center">
                                    <img src={pin || "/placeholder.svg"} alt="밀집 지역 내 위치" className="w-6 h-6" />
                                </div>
                                <span className="text-xs ml-1">밀집 지역 내 위치</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-10 flex justify-center">
                                    <img src={fire_station || "/placeholder.svg"} alt="소방서" className="w-6 h-6" />
                                </div>
                                <span className="text-xs ml-1">소방서</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-10 flex justify-center">
                                    <img src={child_safety || "/placeholder.svg"} alt="어린이보호구역" className="w-6 h-6" />
                                </div>
                                <span className="text-xs ml-1">어린이보호구역</span>
                            </div>
                        </div>
                    ) : (
                        // 일반 페이지에서 표시할 아이콘들 (1열 그리드) - 여백 줄임
                        <div className="grid grid-cols-1 gap-y-1">
                            <div className="flex items-center py-1">
                                <img src={GreenIcon || "/placeholder.svg"} alt="녹색 아이콘" className="w-9 h-10 mr-2" />
                                <span className="text-xs">수거량 50% 이하</span>
                            </div>
                            <div className="flex items-center py-1">
                                <img src={YellowIcon || "/placeholder.svg"} alt="노란색 아이콘" className="w-9 h-10 mr-2" />
                                <span className="text-xs">수거량 51~80%</span>
                            </div>
                            <div className="flex items-center py-1">
                                <img src={RedIcon || "/placeholder.svg"} alt="빨간색 아이콘" className="w-9 h-10 mr-2" />
                                <span className="text-xs">수거량 81% 이상</span>
                            </div>
                            <div className="flex items-center py-1">
                                <img src={FireIcon || "/placeholder.svg"} alt="화재 아이콘" className="w-9 h-10 mr-2" />
                                <span className="text-xs">화재 감지</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
})
MapLegend.displayName = "MapLegend"

// 지역 필터 컴포넌트 - 광역시/도 단위만 표시
const RegionFilter = memo(({ region, setRegion, regions, boxCount, showRecommendedLocations, isAddRemovePage }) => {
    // 지역 변경 핸들러 추가
    const handleRegionChange = (e) => {
        const newRegion = e.target.value

        // 설치 추천 위치가 ON이고 isAddRemovePage가 true이며, 새 지역이 "전체"인 경우
        if (showRecommendedLocations && isAddRemovePage && newRegion === "전체") {
            alert("설치 추천 위치가 켜진 상태에서는 '전체' 지역으로 변경할 수 없습니다.\n특정 지역을 선택해주세요.")
            return // 지역 변경 중단
        }

        // 그 외의 경우 정상적으로 지역 변경
        setRegion(newRegion)
    }

    return (
        <div className="flex flex-col gap-2 p-2 bg-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">지역:</label>
                    <select
                        value={region}
                        onChange={handleRegionChange}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                        <option value="전체">전체</option>
                        {Object.keys(regions).map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">수거함: {boxCount}개</div>
            </div>
        </div>
    )
})
RegionFilter.displayName = "RegionFilter"

// 우측 사이드바 컴포넌트 수정 - 화재 신고 API 연동
const RightSidebar = memo(({ selectedBox, addressMap, selectedBoxImage, imageLoading, imageError, onImageClick }) => {
    // 화재 신고 상태 관리
    const [isReporting, setIsReporting] = useState(false)

    // 화재 신고 핸들러
    const handleFireReport = async () => {
        if (!selectedBox) {
            alert("수거함을 선택해주세요.")
            return
        }

        const confirmed = window.confirm(`${selectedBox.name} 수거함을 화재 신고하시겠습니까?`)
        if (!confirmed) return

        setIsReporting(true)

        try {
            console.log(`🚨 화재 신고 API 호출: boxId=${selectedBox.id}`)
            const response = await boxFire(selectedBox.id)
            console.log("✅ 화재 신고 성공:", response)

            alert("화재 신고가 성공적으로 접수되었습니다.")
        } catch (error) {
            console.error("❌ 화재 신고 실패:", error)
            alert(`화재 신고 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`)
        } finally {
            setIsReporting(false)
        }
    }

    if (!selectedBox) {
        return (
            <div className="w-[300px] h-full flex flex-col border-l bg-white p-6">
                <div className="flex items-center justify-center h-full text-gray-500">수거함을 선택해주세요</div>
            </div>
        )
    }

    const maxVolume = Math.max(selectedBox.volume1 || 0, selectedBox.volume2 || 0, selectedBox.volume3 || 0)
    const getVolumeStatus = (volume) => {
        if (volume <= 50) return { text: "양호", color: "text-green-600" }
        if (volume <= 80) return { text: "주의", color: "text-yellow-600" }
        return { text: "위험", color: "text-red-600" }
    }

    const volumeStatus = getVolumeStatus(maxVolume)

    return (
        <div className="w-[300px] h-full flex flex-col border-l bg-white">
            <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-[#21262B] mb-2">{selectedBox.name}</h2>
                        <p className="text-sm text-[#60697E]">{addressMap[selectedBox.id] || "주소 변환중..."}</p>
                    </div>
                    <button
                        className={`font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1 text-sm ${
                            isReporting ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                        onClick={handleFireReport}
                        disabled={isReporting}
                    >
                        <span>🚨</span>
                    </button>
                </div>
            </div>

            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-4">수거함 정보</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-sm text-[#60697E]">수거량:</span>
                        <span className={`text-sm font-medium ${volumeStatus.color}`}>
              {maxVolume}% ({volumeStatus.text})
            </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-[#60697E]">상태:</span>
                        <span className="text-sm font-medium">{selectedBox.status === "fire" ? "화재 감지" : "정상"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-[#60697E]">좌표:</span>
                        <span className="text-sm text-[#60697E]">
              {selectedBox.lat.toFixed(6)}, {selectedBox.lng.toFixed(6)}
            </span>
                    </div>
                </div>
            </div>

            {/* 이미지 섹션 */}
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-4">수거함 이미지</h3>
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden relative">
                    {imageLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                    ) : selectedBoxImage ? (
                        <img
                            src={selectedBoxImage || "/placeholder.svg"}
                            alt={`${selectedBox.name} 이미지`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                                if (onImageClick) {
                                    onImageClick(selectedBoxImage)
                                }
                            }}
                            onError={(e) => {
                                console.error(`❌ 수거함 ${selectedBox.id} 이미지 로드 실패`)
                                console.error(`❌ 실패한 이미지 URL:`, e.target.src)
                            }}
                            onLoad={(e) => {
                                console.log("✅ 이미지 로드 성공")
                                console.log("✅ 로드된 이미지 URL:", e.target.src)
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">이미지가 없습니다</div>
                    )}
                </div>
            </div>

            {/* 신고 버튼 섹션 - 항상 표시되도록 수정 */}
            <div className="p-6 mt-auto">
                <p className="text-xs text-gray-500 mt-2 text-center">수거함 고장, 화재 등의 문제를 신고할 수 있습니다.</p>
            </div>
        </div>
    )
})
RightSidebar.displayName = "RightSidebar"

const MapWithSidebar = ({ filteredBoxes, isAddRemovePage = false, onDataChange = () => {} }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [selectedBoxId, setSelectedBoxId] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [addressMap, setAddressMap] = useState({})
    const [copiedId, setCopiedId] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const dragStartTimeRef = useRef(0)
    const [showRecommendedLocations, setShowRecommendedLocations] = useState(false)
    const [mapClickEnabled, setMapClickEnabled] = useState(true)
    const [newPinPosition, setNewPinPosition] = useState(null)
    const [showNewPinOverlay, setShowNewPinOverlay] = useState(false)
    const [newBoxName, setNewBoxName] = useState("")
    const [newBoxIpAddress, setNewBoxIpAddress] = useState("")

    // 기존 핀 오버레이 상태
    const [showExistingPinOverlay, setShowExistingPinOverlay] = useState(false)

    // 로딩 상태
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Add refs for list items and map
    const listItemRefs = useRef({})
    const [map, setMap] = useState(null)

    // 추천 위치 관련 상태
    const [recommendedLocations, setRecommendedLocations] = useState([])
    const [fireStations, setFireStations] = useState([])
    const [safetyZones, setSafetyZones] = useState([])
    const [showFireStations, setShowFireStations] = useState(true)
    const [showSafetyZones, setShowSafetyZones] = useState(true)
    const [showSafetyZoneRadius, setShowSafetyZoneRadius] = useState(true)
    const [selectedCluster, setSelectedCluster] = useState(null)

    // 데이터 로딩 상태 관리
    const [isLoading, setIsLoading] = useState(false)

    // 데이터 로드 완료 상태 관리 - 캐싱을 위한 플래그
    const dataLoadedRef = useRef(false)

    // 지도 확대 레벨 상태 추가
    const [mapLevel, setMapLevel] = useState(3)

    // 어린이보호구역 반경 (미터)
    const SAFETY_ZONE_RADIUS = 300

    // 지역 필터링 상태 - 광역시/도 단위만 사용
    const [region, setRegion] = useState("전체")

    // 우측 사이드바 관련 상태 추가
    const [selectedBoxImage, setSelectedBoxImage] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)
    const [imageError, setImageError] = useState(false)

    // 이미지 모달 상태 추가
    const [showImageModal, setShowImageModal] = useState(false)
    const [modalImageSrc, setModalImageSrc] = useState("")

    // 별 좌표 범위 (대략적인 값)
    const regionBounds = useMemo(
        () => ({
            서울특별시: {
                minLat: 37.413294,
                maxLat: 37.715133,
                minLng: 126.734086,
                maxLng: 127.269311,
            },
            부산광역시: {
                minLat: 34.8799,
                maxLat: 35.3839,
                minLng: 128.7369,
                maxLng: 129.372,
            },
            대구광역시: {
                minLat: 35.7392,
                maxLat: 36.051,
                minLng: 128.4159,
                maxLng: 128.8292,
            },
            인천광역시: {
                minLat: 37.2769,
                maxLat: 37.7687,
                minLng: 126.3489,
                maxLng: 126.8086,
            },
            광주광역시: {
                minLat: 35.0292,
                maxLat: 35.2846,
                minLng: 126.6541,
                maxLng: 127.0097,
            },
            대전광역시: {
                minLat: 36.1234,
                maxLat: 36.4894,
                minLng: 127.2535,
                maxLng: 127.5329,
            },
            울산광역시: {
                minLat: 35.4469,
                maxLat: 35.7366,
                minLng: 129.0756,
                maxLng: 129.4729,
            },
            세종특별자치시: {
                minLat: 36.4367,
                maxLat: 36.8151,
                minLng: 127.1292,
                maxLng: 127.3495,
            },
            경기도: {
                minLat: 36.890079,
                maxLat: 38.300631,
                minLng: 126.26233,
                maxLng: 127.845784,
            },
            강원도: {
                minLat: 37.0473,
                maxLat: 38.6107,
                minLng: 127.0673,
                maxLng: 129.3722,
            },
            충청북도: {
                minLat: 36.002005,
                maxLat: 37.217596,
                minLng: 127.254456,
                maxLng: 128.69931,
            },
            충청남도: {
                minLat: 35.975345,
                maxLat: 37.028473,
                minLng: 125.778875,
                maxLng: 127.852089,
            },
            전라북도: {
                minLat: 35.0568,
                maxLat: 36.0189,
                minLng: 126.3344,
                maxLng: 127.8658,
            },
            전라남도: {
                minLat: 33.8991,
                maxLat: 35.4945,
                minLng: 125.0664,
                maxLng: 127.9748,
            },
            경상북도: {
                minLat: 35.7142,
                maxLat: 37.3808,
                minLng: 127.8114,
                maxLng: 129.6994,
            },
            경상남도: {
                minLat: 34.5567,
                maxLat: 35.6729,
                minLng: 127.4661,
                maxLng: 129.2909,
            },
            제주특별자치도: {
                minLat: 33.0618,
                maxLat: 33.5975,
                minLng: 126.1143,
                maxLng: 126.9849,
            },
        }),
        [],
    )

    // 지역 데이터 - 광역시/도 단위만 사용
    const regions = useMemo(
        () => ({
            서울특별시: [],
            부산광역시: [],
            대구광역시: [],
            인천광역시: [],
            광주광역시: [],
            대전광역시: [],
            울산광역시: [],
            세종특별자치시: [],
            경기도: [],
            강원도: [],
            충청북도: [],
            충청남도: [],
            전라북도: [],
            전라남도: [],
            경상북도: [],
            경상남도: [],
            제주특별자치도: [],
        }),
        [],
    )

    // 지역 정보 추출 함수 (주소에서 시/도만 추출)
    const extractRegionInfo = useCallback((address) => {
        if (!address) return { region: null }

        // 주소에서 시/도 추출 (예: "서울특별시 강남구 테헤란로...")
        const parts = address.split(" ")
        if (parts.length < 1) return { region: null }

        // 첫 번째 부분이 시/도
        let region = parts[0]

        // 지역명 정규화
        const regionNormalizationMap = {
            // 특별시/광역시
            서울: "서울특별시",
            부산: "부산광역시",
            인천: "인천광역시",
            대구: "대구광역시",
            광주: "광주광역시",
            대전: "대전광역시",
            울산: "울산광역시",
            세종: "세종특별자치시",
            // 도
            경기: "경기도",
            강원: "강원도",
            충북: "충청북도",
            충남: "충청남도",
            전북: "전라북도",
            전남: "전라남도",
            경북: "경상북도",
            경남: "경상남도",
            제주: "제주특별자치도",
            // 특별자치도
            제주도: "제주특별자치도",
            세종시: "세종특별자치시",
        }

        // 약식 지역명을 정규화된 이름으로 변환
        if (regionNormalizationMap[region]) {
            region = regionNormalizationMap[region]
        }

        return {
            region: region,
        }
    }, [])

    // 좌표가 특정 지역 내에 있는지 확인하는 함수
    const isCoordinateInRegion = useCallback(
        (lat, lng, regionName) => {
            if (!regionName || regionName === "전체") return true

            const bounds = regionBounds[regionName]
            if (!bounds) return true

            // More strict bounds checking
            return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng
        },
        [regionBounds],
    )

    // 표시할 박스 필터링 함수 - useMemo로 최적화
    const shouldDisplayBox = useCallback(
        (box) => {
            return (
                isAddRemovePage ||
                box.installStatus === "INSTALL_CONFIRMED" ||
                box.installStatus === "REMOVE_REQUEST" ||
                box.installStatus === "REMOVE_IN_PROGRESS"
            )
        },
        [isAddRemovePage],
    )

    // 검색 및 필터링된 박스 - useMemo로 최적화
    const displayedBoxes = useMemo(() => {
        // 기본 필터링 (상태 기준)
        let filtered = filteredBoxes.filter(shouldDisplayBox)

        // 검색어 필터링
        if (searchTerm) {
            filtered = filtered.filter((box) => {
                const nameMatch = box.name.toLowerCase().includes(searchTerm.toLowerCase())
                const address = addressMap[box.id] || ""
                const addressMatch = address.toLowerCase().includes(searchTerm.toLowerCase())
                return nameMatch || addressMatch
            })
        }

        // 지역 필터링 - 광역시/도 단위만 적용
        if (region !== "전체") {
            filtered = filtered.filter((box) => {
                // 주소 기반 필터링 - 주소가 있는 경우만 적용
                const address = addressMap[box.id] || ""
                if (address) {
                    // 지역명 정규화 매핑
                    const regionNormalizationMap = {
                        // 특별시/광역시
                        서울: "서울특별시",
                        부산: "부산광역시",
                        인천: "인천광역시",
                        대구: "대구광역시",
                        광주: "광주광역시",
                        대전: "대전광역시",
                        울산: "울산광역시",
                        세종: "세종특별자치시",
                        // 도
                        경기: "경기도",
                        강원: "강원도",
                        충북: "충청북도",
                        충남: "충청남도",
                        전북: "전라북도",
                        전남: "전라남도",
                        경북: "경상북도",
                        경남: "경상남도",
                        제주: "제주특별자치도",
                        // 특별자치도
                        제주도: "제주특별자치도",
                        세종시: "세종특별자치시",
                    }

                    // 주소에서 첫 부분(지역명) 추출
                    const addressRegion = address.split(" ")[0]

                    // 선택한 지역과 주소의 지역이 일치하는지 확인
                    // 정규화된 이름으로 비교
                    return (
                        addressRegion === region ||
                        regionNormalizationMap[addressRegion] === region ||
                        addressRegion === regionNormalizationMap[region]
                    )
                }

                // 주소가 없는 경우에는 좌표 기반으로 확인
                return isCoordinateInRegion(box.lat, box.lng, region)
            })
        }

        console.log(
            "displayedBoxes:",
            filtered.map((box) => ({
                id: box.id,
                name: box.name,
                lat: box.lat,
                lng: box.lng,
                installStatus: box.installStatus,
                address: addressMap[box.id] || "주소 없음",
            })),
        )

        return filtered
    }, [filteredBoxes, searchTerm, addressMap, shouldDisplayBox, region, isCoordinateInRegion])

    // 지역 필터링된 추천 위치
    const filteredRecommendedLocations = useMemo(() => {
        if (region === "전체" || !showRecommendedLocations) return recommendedLocations

        // 좌표 기반으로 필터링
        return recommendedLocations.filter((loc) => isCoordinateInRegion(loc.lat, loc.lng, region))
    }, [recommendedLocations, region, showRecommendedLocations, isCoordinateInRegion])

    // 지역 필터링된 소방서
    const filteredFireStations = useMemo(() => {
        if (region === "전체" || !showFireStations) return fireStations

        // 좌표 기반으로 필터링
        return fireStations.filter((station) => isCoordinateInRegion(station.lat, station.lng, region))
    }, [fireStations, region, showFireStations, isCoordinateInRegion])

    // 지역 필터링된 어린이보호구역
    const filteredSafetyZones = useMemo(() => {
        if (region === "전체" || !showSafetyZones) return safetyZones

        // 좌표 기반으로 필터링
        return safetyZones.filter((zone) => isCoordinateInRegion(zone.lat, zone.lng, region))
    }, [safetyZones, region, showSafetyZones, isCoordinateInRegion])

    const addressFetchedRef = useRef(false)
    const geocoderRef = useRef(null)

    // 지오코더 초기화 - 한 번만 생성
    useEffect(() => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            geocoderRef.current = new window.kakao.maps.services.Geocoder()
        }
    }, [])

    // 선택된 박스 이미지 로드 useEffect 수정
    useEffect(() => {
        const loadBoxImage = async () => {
            console.log("=== 이미지 로딩 시작 ===")
            console.log("selectedBoxId:", selectedBoxId)
            console.log("isAddRemovePage:", isAddRemovePage)

            // 이전 이미지 URL 정리
            if (selectedBoxImage && selectedBoxImage.startsWith("blob:")) {
                console.log("🗑️ 이전 이미지 URL 해제:", selectedBoxImage)
                URL.revokeObjectURL(selectedBoxImage)
            }

            // 이미지 URL 초기화
            setSelectedBoxImage(null)

            // InstallationMonitoring과 동일한 조건 체크
            // 선택된 박스가 있고, isAddRemovePage가 false일 때만 이미지 로드
            if (selectedBoxId && !isAddRemovePage) {
                try {
                    setImageLoading(true)
                    console.log(`📡 getBoxImage API 호출: ${selectedBoxId}`)

                    // getBoxImage API 호출
                    const response = await getBoxImage(selectedBoxId)
                    console.log(`✅ getBoxImage API 응답:`, response)
                    console.log(`📊 응답 타입:`, typeof response)
                    console.log(`📊 응답이 Blob인가?:`, response instanceof Blob)

                    // 응답이 Blob인 경우 URL 생성
                    if (response instanceof Blob) {
                        const imageUrl = URL.createObjectURL(response)
                        console.log(`🔗 Blob URL 생성:`, imageUrl)
                        setSelectedBoxImage(imageUrl)
                    }
                    // 응답이 이미 URL 문자열인 경우
                    else if (typeof response === "string") {
                        console.log(`🔗 문자열 URL 사용:`, response)
                        setSelectedBoxImage(response)
                    }
                    // 응답이 객체이고 url 속성이 있는 경우
                    else if (response && response.url) {
                        console.log(`🔗 객체 URL 사용:`, response.url)
                        setSelectedBoxImage(response.url)
                    }
                    // 기타 경우
                    else {
                        console.warn(`⚠️ 예상하지 못한 응답 형식:`, response)
                        setSelectedBoxImage(null)
                    }
                } catch (error) {
                    console.error("❌ 박스 이미지 로딩 실패:", error)
                    setSelectedBoxImage(null)
                } finally {
                    setImageLoading(false)
                }
            } else {
                console.log("🚫 이미지 로딩 조건 불만족")
            }
        }

        loadBoxImage()

        // 컴포넌트 언마운트 시 이미지 URL 리소스 해제
        return () => {
            if (selectedBoxImage && selectedBoxImage.startsWith("blob:")) {
                console.log("🗑️ useEffect cleanup - 이미지 URL 리소스 해제:", selectedBoxImage)
                URL.revokeObjectURL(selectedBoxImage)
            }
        }
    }, [selectedBoxId, isAddRemovePage])

    // 주소 변환 로직 수정 - 완전히 새로운 접근 방식
    useEffect(() => {
        // filteredBoxes가 비어있거나 지오코더가 없으면 실행하지 않음
        if (filteredBoxes.length === 0 || !geocoderRef.current) {
            return
        }

        // 주소 변환 함수 최적화 - 배치 처리
        const fetchAddresses = async () => {
            const newAddressMap = {}
            const existingAddresses = { ...addressMap }

            // 주소 변환이 필요한 박스만 필터링
            // 추천 위치 제외 - point_type 속성이 있는 객체는 추천 위치로 간주
            const boxesNeedingAddress = filteredBoxes.filter(
                (box) =>
                    !existingAddresses[box.id] &&
                    box.lat &&
                    box.lng &&
                    !box.point_type && // 추천 위치 제외
                    box.type !== "fireStation" && // 소방서 위치 제외
                    box.type !== "safetyZone", // 어린이보호구역 제외
            )

            // 배치 크기 설정 (한 번에 처리할 박스 수)
            const batchSize = 5

            for (let i = 0; i < boxesNeedingAddress.length; i += batchSize) {
                const batch = boxesNeedingAddress.slice(i, i + batchSize)

                // 병렬 처리를 위한 Promise 배열
                const promises = batch.map(
                    (box) =>
                        new Promise((resolve) => {
                            geocoderRef.current.coord2Address(box.lng, box.lat, (result, status) => {
                                if (status === window.kakao.maps.services.Status.OK) {
                                    newAddressMap[box.id] = result[0].road_address
                                        ? result[0].road_address.address_name
                                        : result[0].address.address_name
                                } else {
                                    newAddressMap[box.id] = "주소 변환 실패"
                                }
                                resolve()
                            })
                        }),
                )

                // 배치 내의 모든 Promise 완료 대기
                await Promise.all(promises)

                // 각 배치 처리 후 상태 업데이트 - 점진적 UI 업데이트
                if (Object.keys(newAddressMap).length > 0) {
                    setAddressMap((prev) => ({ ...prev, ...newAddressMap }))
                }
            }

            // 기존 주소가 있는 박스들의 주소 유지
            filteredBoxes.forEach((box) => {
                if (existingAddresses[box.id] && !newAddressMap[box.id]) {
                    newAddressMap[box.id] = existingAddresses[box.id]
                }
            })

            // 주소 변환 완료 플래그 설정 제거 - 항상 주소 변환이 실행되도록 함
        }

        fetchAddresses()
    }, [filteredBoxes, addressMap])

    useEffect(() => {
        if (displayedBoxes.length > 0) {
            setSelectedBoxId(displayedBoxes[0].id)
            if (map && displayedBoxes[0]) {
                map.setCenter(new window.kakao.maps.LatLng(displayedBoxes[0].lat, displayedBoxes[0].lng))
            }
        } else {
            setSelectedBoxId(null)
        }
    }, [displayedBoxes])

    // 모든 데이터 로드 함수 - useCallback으로 최적화
    const loadAllData = useCallback(async () => {
        // 이미 로드된 경우 스킵
        if (dataLoadedRef.current) return

        if (!isAddRemovePage) return

        try {
            setIsLoading(true)

            // 추천 위치 데이터 로드
            const recommendedData = await fetchFilteredRecommendedBoxes()
            console.log("✅ 추천 위치 데이터:", recommendedData)
            setRecommendedLocations(recommendedData || [])

            // 소방서 및 어린이보호구역 데이터 로드
            const coordinatesData = await fetchCoordinates()
            console.log("📌 좌표 데이터:", coordinatesData)

            if (coordinatesData && coordinatesData.fireStations) {
                // 소방서 좌표 변환 (위도, 경도 배열을 객체로)
                const formattedFireStations = coordinatesData.fireStations.map((coords, index) => ({
                    id: `fire-${index}`,
                    lat: coords[0],
                    lng: coords[1],
                    type: "fireStation",
                }))

                setFireStations(formattedFireStations)
                console.log(`✅ ${formattedFireStations.length}개의 소방서 좌표 로드 완료`)
            } else {
                console.warn("⚠️ 소방서 좌표 데이터가 없거나 형식이 잘못되었습니다.")
                setFireStations([])
            }

            if (coordinatesData && coordinatesData.safetyZones) {
                // 어린이보호구역 좌표 변환 (위도, 경도 배열을 객체로)
                const formattedSafetyZones = coordinatesData.safetyZones.map((coords, index) => ({
                    id: `safety-${index}`,
                    lat: coords[0],
                    lng: coords[1],
                    type: "safetyZone",
                }))

                setSafetyZones(formattedSafetyZones)
                console.log(`✅ ${formattedSafetyZones.length}개의 어린이보호구역 좌표 로드 완료`)
            } else {
                console.warn("⚠️ 어린이보호구역 좌표 데이터가 없거나 형식이 잘못되었습니다.")
                setSafetyZones([])
            }

            dataLoadedRef.current = true
        } catch (err) {
            console.error("❌ 데이터 불러오기 실패:", err)
            setRecommendedLocations([])
            setFireStations([])
            setSafetyZones([])
        } finally {
            setIsLoading(false)
        }
    }, [isAddRemovePage])

    // 토글 함수 수정 - 추천 위치 ON/OFF 전환 및 데이터 로드
    const toggleRecommendedLocations = useCallback(() => {
        // 지역이 "전체"로 설정되어 있고, isAddRemovePage가 true이며, 현재 추천 위치가 OFF인 경우
        if (region === "전체" && isAddRemovePage && !showRecommendedLocations) {
            alert("설치 추천 위치를 보려면 먼저 지역을 선택해주세요.")
            return // 토글 동작 중단
        }

        const newState = !showRecommendedLocations
        setShowRecommendedLocations(newState)

        // 추천 위치를 ON으로 변경할 때만 데이터 로드
        if (newState && isAddRemovePage && !dataLoadedRef.current) {
            loadAllData()
        }
    }, [showRecommendedLocations, isAddRemovePage, loadAllData, dataLoadedRef, region])

    // Add a new state variable to track if we're showing an overlay for a recommended location
    const [isRecommendedLocationOverlay, setIsRecommendedLocationOverlay] = useState(false)

    // 밀집 지역 내 위치 수 가져오기 - 직접 필터링 방식으로 변경하여 성능 개선
    const getClusterMemberCount = useCallback(
        (clusterId) => {
            if (clusterId === undefined) return 0

            return filteredRecommendedLocations.filter(
                (loc) => loc.point_type === "cluster_member" && Number(loc.cluster) === Number(clusterId),
            ).length
        },
        [filteredRecommendedLocations],
    )

    // 중심점 클릭 핸들러 - useCallback으로 최적화
    const handleCentroidClick = useCallback(
        (centroid) => {
            console.log("🎯 중심점 클릭:", centroid)

            // 클릭한 중심점의 군집 ID를 숫자로 확보
            const clickedClusterId = Number(centroid.cluster)

            if (selectedCluster === clickedClusterId) {
                console.log("🔄 같은 군집 선택 해제:", clickedClusterId)
                setSelectedCluster(null)

                // 군집 선택 해제 시 설치 요청 오버레이도 닫기
                setShowNewPinOverlay(false)
                setNewPinPosition(null)
                setIsRecommendedLocationOverlay(false)
            } else {
                console.log("🔄 새 군집 선택:", clickedClusterId)
                setSelectedCluster(clickedClusterId)

                // 군집 선택 시 설치 요청 오버레이 표시
                // 기존 핀 오버레이가 열려있으면 닫기
                setShowExistingPinOverlay(false)

                // 중심점 위치에 설치 요청 오버레이 표시 (핀은 표시하지 않음)
                setNewPinPosition({
                    lat: centroid.lat,
                    lng: centroid.lng,
                })
                setIsRecommendedLocationOverlay(true)
                setShowNewPinOverlay(true)

                // 입력 필드 초기화
                setNewBoxName("")
                setNewBoxIpAddress("")
            }

            // 상세 정보 표시
            setSelectedBoxId(null) // 기존 선택 해제
        },
        [
            selectedCluster,
            setShowExistingPinOverlay,
            setShowNewPinOverlay,
            setNewPinPosition,
            setIsRecommendedLocationOverlay,
        ],
    )

    // 주소 변환 로직 최적화 - 추천 위치 제외

    // 입력 필드 클릭 핸들러 - 지도 클릭 이벤트 일시적으로 비활성화
    const handleInputFocus = useCallback(() => {
        setMapClickEnabled(false)
    }, [])

    const handleInputBlur = useCallback(() => {
        // 약간의 지연 후 지도 클릭 이벤트 다시 활성화
        setTimeout(() => {
            setMapClickEnabled(true)
        }, 100)
    }, [])

    // 버튼 클릭 핸들러 - 지도 클릭 이벤트 일시적으로 비활성화
    const handleButtonMouseDown = useCallback((e) => {
        e.stopPropagation()
        setMapClickEnabled(false)
    }, [])

    const handleButtonMouseUp = useCallback((e) => {
        e.stopPropagation()
        // 약간의 지연 후 지도 클릭 이벤트 다시 활성화
        setTimeout(() => {
            setMapClickEnabled(true)
        }, 100)
    }, [])

    // 추천 위치 마커 클릭 핸들러 추가
    const handleRecommendedLocationClick = useCallback(
        (location) => {
            // 기존 핀 오버레이가 열려있으면 닫기
            setShowExistingPinOverlay(false)

            // 좌표 파싱 - location이 객체인 경우와 문자열인 경우 모두 처리
            let lat = location.lat
            let lng = location.lng

            // POINT 형식 문자열인 경우 파싱
            if (typeof location.lat === "undefined" && location.geometry) {
                const coordsMatch = location.geometry.match(/POINT\s*\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)/)
                if (coordsMatch) {
                    lng = Number.parseFloat(coordsMatch[1])
                    lat = Number.parseFloat(coordsMatch[2])
                }
            }

            // 클릭한 추천 위치에 새 핀 생성 (좌표만 저장하고 핀은 표시하지 않음)
            setNewPinPosition({
                lat: lat,
                lng: lng,
            })

            // 추천 위치 오버레이 플래그 설정
            setIsRecommendedLocationOverlay(true)

            // 설치 요청 오버레이 표시
            setShowNewPinOverlay(true)

            // 입력 필드 초기화
            setNewBoxName("")
            setNewBoxIpAddress("")

            // 선택된 박스 ID 초기화
            setSelectedBoxId(null)

            console.log("추천 위치 클릭:", { lat, lng })
        },
        [setShowExistingPinOverlay, setNewPinPosition, setShowNewPinOverlay, setSelectedBoxId],
    )

    // 상태 포맷 함수 - useMemo로 최적화
    const statusMap = useMemo(
        () => ({
            INSTALL_REQUEST: "설치 요청 중",
            INSTALL_IN_PROGRESS: "설치 진행 중",
            INSTALL_COMPLETED: "설치 완료",
            INSTALL_CONFIRMED: "설치 확정",
            REMOVE_REQUEST: "제거 요청 중",
            REMOVE_IN_PROGRESS: "제거 진행 중",
            REMOVE_COMPLETED: "제거 완료",
            REMOVE_CONFIRMED: "제거 확정",
        }),
        [],
    )

    const formatInstallStatus = useCallback(
        (status) => {
            if (!status) return "상태 정보 없음"
            return statusMap[status] || status
        },
        [statusMap],
    )

    const handleCopy = useCallback((e, boxId, text) => {
        e.stopPropagation() // 이벤트 버블링 방지

        try {
            // 임시 텍스트 영역 생성
            const textArea = document.createElement("textarea")
            textArea.value = text

            // 화면 밖으로 위치시키기
            textArea.style.position = "fixed"
            textArea.style.left = "-999999px"
            textArea.style.top = "-999999px"
            document.body.appendChild(textArea)

            // 텍스트 선택 및 복사
            textArea.focus()
            textArea.select()

            const successful = document.execCommand("copy")

            // 임시 요소 제거
            document.body.removeChild(textArea)

            if (successful) {
                // 복사 성공
                setCopiedId(boxId)
                setTimeout(() => {
                    setCopiedId(null)
                }, 1500)
            } else {
                console.error("execCommand 복사 실패")
            }
        } catch (err) {
            console.error("복사 실패:", err)
        }
    }, [])

    // ✅ 아이콘 결정 (화재 우선) - useMemo로 최적화
    const getMarkerIcon = useCallback(
        (box) => {
            if (isAddRemovePage) {
                // 설치 상태인 경우 (INSTALL_로 시작하는 상태)
                if (box.installStatus && box.installStatus.startsWith("INSTALL_")) {
                    return selectedBoxId === box.id ? GreenSelectIcon : GreenIcon
                }
                // 제거 상태인 경우 (REMOVE_로 시작하는 상태)
                else if (box.installStatus && box.installStatus.startsWith("REMOVE_")) {
                    return selectedBoxId === box.id ? RedSelectIcon : RedIcon
                }
                // 상태가 없는 경우 기본 아이콘
                return selectedBoxId === box.id ? YellowSelectIcon : YellowIcon
            } else {
                // 설치 확정, 제거 요청 중, 제거 진행 중 상태 확인을 먼저
                if (
                    box.installStatus === "INSTALL_CONFIRMED" ||
                    box.installStatus === "REMOVE_REQUEST" ||
                    box.installStatus === "REMOVE_IN_PROGRESS"
                ) {
                    // 화재 상태 확인
                    if (box.status === "fire") return FireIcon

                    // 그 외의 경우 수거량에 따라 아이콘 결정
                    const maxVolume = Math.max(box.volume1 || 0, box.volume2 || 0, box.volume3 || 0)
                    if (maxVolume <= 50) return selectedBoxId === box.id ? GreenSelectIcon : GreenIcon
                    if (maxVolume <= 80) return selectedBoxId === box.id ? YellowSelectIcon : YellowIcon
                    return selectedBoxId === box.id ? RedSelectIcon : RedIcon
                }
                // 세 가지 상태가 아닌 경우 null 반환 (마커 표시 안 함)
                return null
            }
        },
        [isAddRemovePage, selectedBoxId],
    )

    // ✅ 크기 결정 - useMemo로 최적화
    const getMarkerSize = useCallback(
        (box) => {
            if (box.status === "fire") {
                return selectedBoxId === box.id ? { width: 45, height: 50 } : { width: 34, height: 40 }
            }
            return selectedBoxId === box.id ? { width: 45, height: 50 } : { width: 34, height: 40 }
        },
        [selectedBoxId],
    )

    // Handle marker click - select box and scroll to list item
    const handleMarkerClick = useCallback(
        (boxId) => {
            setSelectedBoxId(boxId)

            // isAddRemovePage가 true일 때 기존 핀 클릭 시
            if (isAddRemovePage) {
                const selectedBox = filteredBoxes.find((box) => box.id === boxId)
                // 제거 상태인 핀은 오버레이를 표시하지 않음
                if (!selectedBox?.installStatus?.startsWith("REMOVE_")) {
                    setShowExistingPinOverlay(true)
                }
                // 새 핀 오버레이가 열려있으면 닫기
                setShowNewPinOverlay(false)
                setNewPinPosition(null)
            }

            // Scroll the list item into view
            if (listItemRefs.current[boxId] && isSidebarOpen) {
                listItemRefs.current[boxId].scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                })
            }
        },
        [isAddRemovePage, filteredBoxes, isSidebarOpen, setShowExistingPinOverlay, setShowNewPinOverlay, setNewPinPosition],
    )

    // Handle list item click - select box and center map on marker
    const handleListItemClick = useCallback(
        (box) => {
            setSelectedBoxId(box.id)

            // isAddRemovePage가 true일 때 기존 핀 클릭 시
            if (isAddRemovePage) {
                // 제거 상태인 핀은 오버레이를 표시하지 않음
                if (!box?.installStatus?.startsWith("REMOVE_")) {
                    setShowExistingPinOverlay(true)
                } else {
                    setShowExistingPinOverlay(false)
                }
                // 새 핀 오버레이가 열려있으면 닫기
                setShowNewPinOverlay(false)
                setNewPinPosition(null)
            }

            // Center the map on the selected marker
            if (map) {
                map.setCenter(new window.kakao.maps.LatLng(box.lat, box.lng))
            }
        },
        [isAddRemovePage, map, setShowExistingPinOverlay, setShowNewPinOverlay, setNewPinPosition],
    )

    // Update the handleMapClick function to reset the recommended location flag
    const handleMapClick = useCallback(
        (_, mouseEvent) => {
            // 지도 클릭이 비활성화된 경우 무시
            if (!mapClickEnabled) return

            // 드래그 중이거나 드래그 직후인 경우 클릭 이벤트 무시
            if (isDragging || Date.now() - dragStartTimeRef.current < 200) {
                return
            }

            if (!isAddRemovePage) return

            // mouseEvent.latLng가 없는 경우 처리
            if (!mouseEvent || !mouseEvent.latLng) {
                console.error("유효하지 않은 클릭 이벤트입니다.")
                return
            }

            // 기존 핀 오버레이가 열려있으면 닫기
            setShowExistingPinOverlay(false)

            // 클릭한 위치에 새 핀 생성
            const latlng = mouseEvent.latLng
            setNewPinPosition({
                lat: latlng.getLat(),
                lng: latlng.getLng(),
            })

            // 일반 지도 클릭이므로 추천 위치 오버레이 플래그 해제
            setIsRecommendedLocationOverlay(false)

            setShowNewPinOverlay(true)

            // 입력 필드 초기화
            setNewBoxName("")
            setNewBoxIpAddress("")
        },
        [mapClickEnabled, isDragging, isAddRemovePage, setShowExistingPinOverlay, setNewPinPosition, setShowNewPinOverlay],
    )

    // Update the closeOverlays function to reset the recommended location flag
    const closeOverlays = useCallback(
        (e) => {
            e.stopPropagation() // 이벤트 전파 방지
            setShowNewPinOverlay(false)
            setShowExistingPinOverlay(false)
            setNewPinPosition(null)
            setIsRecommendedLocationOverlay(false) // 추천 위치 오버레이 플래그 초기화
        },
        [setShowNewPinOverlay, setShowExistingPinOverlay, setNewPinPosition],
    )

    // Update the handleInstallRequest function to reset the recommended location flag
    const handleInstallRequest = useCallback(
        async (e) => {
            e.preventDefault()
            e.stopPropagation()

            if (!newBoxName || !newBoxIpAddress || !newPinPosition) {
                alert("수거함 이름과 IP 주소를 모두 입력해주세요.")
                return
            }

            setIsSubmitting(true)

            try {
                const response = await requestInstallBox({
                    name: newBoxName,
                    ipaddress: newBoxIpAddress,
                    longitude: newPinPosition.lng,
                    latitude: newPinPosition.lat,
                })

                // 응답 메시지가 "Fail"인 경우 중복 이름 오류로 처리
                if (response === "Fail") {
                    alert("설치 요청 실패: 동일한 이름의 수거함이 이미 존재합니다. 다른 이름을 사용해주세요.")
                    setIsSubmitting(false)
                    return
                }

                alert("설치 요청이 성공적으로 전송되었습니다.")

                // 상태 초기화
                setNewPinPosition(null)
                setShowNewPinOverlay(false)
                setNewBoxName("")
                setNewBoxIpAddress("")
                setIsRecommendedLocationOverlay(false) // 추천 위치 오버레이 플래그 초기화

                // Call onDataChange to refresh the data
                onDataChange()

                // Reset the dataLoadedRef to force reloading of recommended locations
                dataLoadedRef.current = false

                // Reload recommended locations data if they're being shown
                if (showRecommendedLocations && isAddRemovePage) {
                    loadAllData()
                }

                // Force a refresh of the displayed boxes
                setTimeout(() => {
                    // This timeout ensures the parent component has time to fetch new data
                    // before we try to update our local state
                    if (map) {
                        // Trigger a map event to refresh the view
                        const center = map.getCenter()
                        map.setCenter(center)
                    }
                }, 500)
            } catch (error) {
                alert("설치 요청 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류"))
            } finally {
                setIsSubmitting(false)
            }
        },
        [
            newBoxName,
            newBoxIpAddress,
            newPinPosition,
            onDataChange,
            setShowNewPinOverlay,
            setNewPinPosition,
            map,
            showRecommendedLocations,
            isAddRemovePage,
            loadAllData,
        ],
    )

    // 선택된 박스 정보 가져오기
    const getSelectedBox = useCallback(() => {
        return filteredBoxes.find((box) => box.id === selectedBoxId) || null
    }, [filteredBoxes, selectedBoxId])

    // 지도 확대 레벨 변경 핸들러
    const handleZoomChanged = useCallback((map) => {
        setMapLevel(map.getLevel())
    }, [])

    // 제거 요청 핸들러
    const handleRemoveRequest = useCallback(
        async (e) => {
            e.preventDefault()
            e.stopPropagation()

            if (!selectedBoxId) {
                alert("제거할 수거함을 선택해주세요.")
                return
            }

            setIsSubmitting(true)

            try {
                await requestRemoveBox(selectedBoxId)

                alert("제거 요청이 성공적으로 전송되었습니다.")

                // 상태 초기화
                setSelectedBoxId(null)
                setShowExistingPinOverlay(false)

                // Call onDataChange to refresh the data
                onDataChange()

                // Reset the dataLoadedRef to force reloading of recommended locations
                dataLoadedRef.current = false

                // Reload recommended locations data if they're being shown
                if (showRecommendedLocations && isAddRemovePage) {
                    loadAllData()
                }

                // Force a refresh of the displayed boxes
                setTimeout(() => {
                    // This timeout ensures the parent component has time to fetch new data
                    if (map) {
                        // Trigger a map event to refresh the view
                        const center = map.getCenter()
                        map.setCenter(center)
                    }
                }, 500)
            } catch (error) {
                alert("제거 요청 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류"))
            } finally {
                setIsSubmitting(false)
            }
        },
        [
            selectedBoxId,
            onDataChange,
            setShowExistingPinOverlay,
            map,
            showRecommendedLocations,
            isAddRemovePage,
            loadAllData,
        ],
    )

    // 우측 사이드바 표시 여부 결정
    const showRightSidebar = !isAddRemovePage && selectedBoxId

    return (
        <div className="flex bg-white rounded-2xl shadow-md overflow-hidden h-[570px] relative">
            {/* 토글 화살표 */}
            <img
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                src={isSidebarOpen ? ArrowLeftIcon : ArrowRightIcon}
                alt="toggle arrow"
                className={`absolute top-1/2 -translate-y-1/2 cursor-pointer rounded-r transition-all duration-300 w-5 h-10 z-20 ${
                    isSidebarOpen ? "left-[350px]" : "left-0"
                }`}
                style={{ boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)" }}
            />

            {/* 사이드바 */}
            <div
                className={`transition-all duration-300 ${isSidebarOpen ? "w-[350px]" : "w-0"} overflow-hidden shadow-md h-full relative z-10 bg-white`}
            >
                <div className="h-full">
                    {/* 검색창 */}
                    <div className="relative mx-2 mt-4 p-3">
                        <input
                            type="text"
                            placeholder="수거함 이름 및 주소 검색"
                            className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <img
                            src={SearchIcon || "/placeholder.svg"}
                            alt="검색 아이콘"
                            className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        />
                    </div>

                    {/* 지역 필터 */}
                    <div className="mx-2 px-3">
                        <RegionFilter
                            region={region}
                            setRegion={setRegion}
                            regions={regions}
                            boxCount={displayedBoxes.length}
                            showRecommendedLocations={showRecommendedLocations}
                            isAddRemovePage={isAddRemovePage}
                        />
                    </div>

                    {/* 리스트 */}
                    <div className="overflow-y-auto h-[calc(100%-120px)] ml-4 mt-2 custom-scrollbar">
                        {displayedBoxes.map((box) => (
                            <BoxListItem
                                key={box.id}
                                ref={(el) => (listItemRefs.current[box.id] = el)}
                                box={box}
                                isSelected={selectedBoxId === box.id}
                                address={addressMap[box.id]}
                                formatInstallStatus={formatInstallStatus}
                                isAddRemovePage={isAddRemovePage}
                                handleClick={() => handleListItemClick(box)}
                                handleCopy={handleCopy}
                                copiedId={copiedId}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* 지도 */}
            <div className={`flex-1 relative ${showRightSidebar ? "mr-[300px]" : ""}`}>
                <Map
                    center={{ lat: 36.8, lng: 127.0729 }}
                    style={{ width: "100%", height: "100%" }}
                    level={mapLevel}
                    onCreate={setMap}
                    onClick={handleMapClick}
                    onZoomChanged={handleZoomChanged}
                    draggable={true} // 드래그 기능 명시적 활성화
                    onDragStart={() => {
                        dragStartTimeRef.current = Date.now()
                        setIsDragging(true)
                    }}
                    onDragEnd={() => setIsDragging(false)}
                >
                    {/* 기존 마커들 - 필터링하여 표시 */}
                    {displayedBoxes.map((box) => {
                        const icon = getMarkerIcon(box)
                        // 아이콘이 null이 아닌 경우에만 마커 렌더링
                        return icon ? (
                            <BoxMarker
                                key={box.id}
                                box={box}
                                icon={icon}
                                size={getMarkerSize(box)}
                                onClick={() => handleMarkerClick(box.id)}
                            />
                        ) : null
                    })}

                    {/* 새로운 핀 */}
                    {isAddRemovePage && newPinPosition && !isRecommendedLocationOverlay && (
                        <MapMarker
                            position={newPinPosition}
                            image={{
                                src: GreenIcon,
                                size: { width: 34, height: 40 },
                                options: { offset: { x: 20, y: 40 } },
                            }}
                        />
                    )}

                    {/* 어린이보호구역 및 소방서 마커 - 설치 추천 위치가 ON일 때만 표시 */}
                    {isAddRemovePage && showRecommendedLocations && (
                        <>
                            {/* 어린이보호구역 반경 원 */}
                            {showSafetyZones &&
                                showSafetyZoneRadius &&
                                filteredSafetyZones.map((zone) => (
                                    <Circle
                                        key={`circle-${zone.id}`}
                                        center={{
                                            lat: zone.lat,
                                            lng: zone.lng,
                                        }}
                                        radius={SAFETY_ZONE_RADIUS} // 300미터 반경
                                        strokeWeight={2} // 외곽선 두께
                                        strokeColor={"#FFCC00"} // 외곽선 색상
                                        strokeOpacity={0.5} // 외곽선 투명도
                                        strokeStyle={"solid"} // 외곽선 스타일
                                        fillColor={"#FFCC00"} // 내부 색상 (노란색)
                                        fillOpacity={0.2} // 내부 투명도 (반투명)
                                    />
                                ))}

                            {/* 어린이보호구역 마커 */}
                            {showSafetyZones &&
                                filteredSafetyZones.map((zone) => (
                                    <MapMarker
                                        key={zone.id}
                                        position={{ lat: zone.lat, lng: zone.lng }}
                                        image={{
                                            src: child_safety,
                                            size: { width: 32, height: 32 },
                                        }}
                                        onClick={() => {
                                            // 어린이보호구역 클릭 시 정보 표시 로직
                                            setSelectedBoxId(null)
                                            setShowExistingPinOverlay(false)
                                            setShowNewPinOverlay(false)
                                            setNewPinPosition(null)
                                        }}
                                    />
                                ))}

                            {/* 소방서 마커 */}
                            {showFireStations &&
                                filteredFireStations.map((station) => (
                                    <MapMarker
                                        key={station.id}
                                        position={{ lat: station.lat, lng: station.lng }}
                                        image={{
                                            src: fire_station,
                                            size: { width: 32, height: 32 },
                                        }}
                                        onClick={() => {
                                            // 소방서 클릭 시 정보 표시 로직
                                            setSelectedBoxId(null)
                                            setShowExistingPinOverlay(false)
                                            setShowNewPinOverlay(false)
                                            setNewPinPosition(null)
                                        }}
                                    />
                                ))}
                        </>
                    )}

                    {/* 추천 위치 관련 마커들 */}
                    {isAddRemovePage && showRecommendedLocations && (
                        <>
                            {/* 독립 추천 위치 마커 */}
                            {filteredRecommendedLocations
                                .filter((loc) => loc.point_type === "noise")
                                .map((loc, index) => (
                                    <MapMarker
                                        key={`noise-${index}`}
                                        position={{ lat: loc.lat, lng: loc.lng }}
                                        image={{
                                            src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                                            size: { width: 24, height: 35 },
                                        }}
                                        onClick={() => handleRecommendedLocationClick(loc)}
                                    />
                                ))}

                            {/* 밀집 중심 위치 마커 */}
                            {filteredRecommendedLocations
                                .filter((loc) => loc.point_type === "centroid")
                                .map((centroid, index) => {
                                    const memberCount = getClusterMemberCount(centroid.cluster)
                                    return (
                                        <React.Fragment key={`centroid-${index}`}>
                                            {/* 별 모양 마커 */}
                                            <MapMarker
                                                position={{ lat: centroid.lat, lng: centroid.lng }}
                                                image={{
                                                    src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                                                    size: { width: 24, height: 35 },
                                                }}
                                                onClick={() => handleCentroidClick(centroid)}
                                            />

                                            {/* 멤버 수 배지 */}
                                            <CustomOverlayMap position={{ lat: centroid.lat, lng: centroid.lng }} xAnchor={-0.2} yAnchor={2}>
                                                <div className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                                    {memberCount}
                                                </div>
                                            </CustomOverlayMap>
                                        </React.Fragment>
                                    )
                                })}

                            {/* 밀집 지역 내 위치 마커 (선택된 군집의 멤버만 표시) */}
                            {selectedCluster !== null &&
                                filteredRecommendedLocations
                                    .filter(
                                        (loc) => loc.point_type === "cluster_member" && Number(loc.cluster) === Number(selectedCluster),
                                    )
                                    .map((member, index) => (
                                        <MapMarker
                                            key={`member-${index}`}
                                            position={{ lat: member.lat, lng: member.lng }}
                                            image={{
                                                src: pin, // 커스텀 핀 아이콘
                                                size: { width: 32, height: 32 },
                                            }}
                                            onClick={() => handleRecommendedLocationClick(member)}
                                        />
                                    ))}
                        </>
                    )}

                    {/* 새 핀 오버레이 (CustomOverlayMap 사용) */}
                    {isAddRemovePage && showNewPinOverlay && newPinPosition && (
                        <PinOverlay
                            position={{ lat: newPinPosition.lat, lng: newPinPosition.lng }}
                            title="새 수거함 설치 요청"
                            onClose={(e) => closeOverlays(e)}
                        >
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">수거함 이름</label>
                                    <input
                                        type="text"
                                        value={newBoxName}
                                        onChange={(e) => setNewBoxName(e.target.value)}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                        onClick={(e) => e.stopPropagation()} // 이벤트 전파 방지 추가
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="수거함 이름 입력"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">IP 주소</label>
                                    <input
                                        type="text"
                                        value={newBoxIpAddress}
                                        onChange={(e) => setNewBoxIpAddress(e.target.value)}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                        onClick={(e) => e.stopPropagation()} // 이벤트 전파 방지 추가
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="IP 주소 입력"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">좌표</label>
                                    <div className="text-sm text-gray-500">
                                        {newPinPosition.lat.toFixed(6)}, {newPinPosition.lng.toFixed(6)}
                                    </div>
                                </div>
                                <ActionButton
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium text-sm disabled:opacity-50"
                                    onClick={(e) => handleInstallRequest(e)}
                                    disabled={isSubmitting || !newBoxName || !newBoxIpAddress}
                                >
                                    {isSubmitting ? "요청 중..." : "설치 요청"}
                                </ActionButton>
                            </div>
                        </PinOverlay>
                    )}

                    {/* 기존 핀 오버레이 (CustomOverlayMap 사용) */}
                    {isAddRemovePage &&
                        showExistingPinOverlay &&
                        selectedBoxId &&
                        getSelectedBox() &&
                        getSelectedBox()?.installStatus === "INSTALL_CONFIRMED" && (
                            <PinOverlay
                                position={{ lat: getSelectedBox()?.lat || 0, lng: getSelectedBox()?.lng || 0 }}
                                title="수거함 제거 요청"
                                onClose={(e) => closeOverlays(e)}
                            >
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">수거함 이름</label>
                                        <div className="text-sm">{getSelectedBox()?.name || ""}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">현재 상태</label>
                                        <div className="text-sm">{formatInstallStatus(getSelectedBox()?.installStatus || "")}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                                        <div className="text-sm text-gray-500">{addressMap[selectedBoxId] || "주소 정보 없음"}</div>
                                    </div>
                                    <ActionButton
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium text-sm disabled:opacity-50"
                                        onClick={(e) => handleRemoveRequest(e)}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "요청 중..." : "제거 요청"}
                                    </ActionButton>
                                </div>
                            </PinOverlay>
                        )}
                    <MapLegend isAddRemovePage={isAddRemovePage} />
                </Map>

                {/* 추천 위치 관련 토글 버튼들 */}
                {isAddRemovePage && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                        <ActionButton
                            className={`rounded-md text-white font-bold p-2 shadow-md transition-colors duration-200 ${
                                showRecommendedLocations ? "bg-[#00C17B]" : "bg-[#FF7671]"
                            }`}
                            onClick={toggleRecommendedLocations}
                        >
                            설치 추천 위치 {showRecommendedLocations ? "ON" : "OFF"}
                        </ActionButton>

                        {/* 설치 추천 위치가 ON일 때만 소방서와 어린이보호구역 토글 버튼 표시 */}
                        {showRecommendedLocations && (
                            <>
                                <ActionButton
                                    onClick={() => setShowFireStations(!showFireStations)}
                                    className={`rounded-md text-white font-bold p-2 shadow-md ${showFireStations ? "bg-red-600" : "bg-gray-400"}`}
                                >
                                    🚒 소방서 {showFireStations ? "숨기기" : "표시하기"}
                                </ActionButton>

                                <ActionButton
                                    onClick={() => setShowSafetyZones(!showSafetyZones)}
                                    className={`rounded-md text-white font-bold p-2 shadow-md ${showSafetyZones ? "bg-yellow-500" : "bg-gray-400"}`}
                                >
                                    🚸 어린이보호구역 {showSafetyZones ? "숨기기" : "표시하기"}
                                </ActionButton>

                                <ActionButton
                                    onClick={() => setShowSafetyZoneRadius(!showSafetyZoneRadius)}
                                    className={`rounded-md text-white font-bold p-2 shadow-md ${showSafetyZoneRadius ? "bg-yellow-300 text-yellow-800" : "bg-gray-400"}`}
                                >
                                    ⭕ 보호구역 반경 {showSafetyZoneRadius ? "숨기기" : "표시하기"}
                                </ActionButton>

                                {selectedCluster !== null && (
                                    <ActionButton
                                        onClick={() => setSelectedCluster(null)}
                                        className="rounded-md bg-purple-600 text-white font-bold p-2 shadow-md"
                                    >
                                        🔄 군집 선택 초기화
                                    </ActionButton>
                                )}
                            </>
                        )}
                    </div>
                )}

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
            </div>

            {/* 우측 사이드바 - isAddRemovePage가 false이고 박스가 선택되었을 때만 표시 */}
            {showRightSidebar && (
                <div className="absolute top-0 right-0 h-full z-10">
                    <RightSidebar
                        selectedBox={getSelectedBox()}
                        addressMap={addressMap}
                        selectedBoxImage={selectedBoxImage}
                        imageLoading={imageLoading}
                        imageError={imageError}
                        onImageClick={(imageSrc) => {
                            setModalImageSrc(imageSrc)
                            setShowImageModal(true)
                        }}
                    />
                </div>
            )}

            {/* 이미지 모달 */}
            {showImageModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="relative max-w-4xl max-h-4xl p-4">
                        <img
                            src={modalImageSrc || "/placeholder.svg"}
                            alt="확대된 수거함 이미지"
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all"
                            onClick={() => setShowImageModal(false)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* 스크롤바 스타일 */}
            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
          height: 50px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
        </div>
    )
}

export default MapWithSidebar