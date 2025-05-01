"use client"

import { useState, useEffect, useRef } from "react"
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk"
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

// API 함수 import
import { requestInstallBox, requestRemoveBox } from "../api/apiServices" // 경로는 실제 API 파일 위치에 맞게 조정해주세요

const MapWithSidebar = ({ filteredBoxes, isMainPage = false, isAddRemovePage = false, onDataChange = () => {} }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [selectedBoxId, setSelectedBoxId] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [addressMap, setAddressMap] = useState({})
    const [copiedId, setCopiedId] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const dragStartTimeRef = useRef(0)
    const [showRecommendedLocations, setShowRecommendedLocations] = useState(true)
    const [mapClickEnabled, setMapClickEnabled] = useState(true) // 지도 클릭 활성화 상태

    // 토글 함수 추가
    const toggleRecommendedLocations = () => {
        setShowRecommendedLocations((prev) => !prev)
    }

    // 새로운 핀 관련 상태
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

    const displayedBoxes = searchTerm
        ? filteredBoxes.filter((box) => {
            const nameMatch = box.name.toLowerCase().includes(searchTerm.toLowerCase())
            const address = addressMap[box.id] || ""
            const addressMatch = address.toLowerCase().includes(searchTerm.toLowerCase())
            return nameMatch || addressMatch
        })
        : filteredBoxes

    const addressFetchedRef = useRef(false)

    useEffect(() => {
        // 이미 주소를 가져왔거나 filteredBoxes가 비어있으면 실행하지 않음
        if (addressFetchedRef.current || filteredBoxes.length === 0) {
            return
        }

        const geocoder = new window.kakao.maps.services.Geocoder()
        const fetchAddresses = async () => {
            const newAddressMap = {}

            // 이미 주소가 있는 경우 유지
            const existingAddresses = { ...addressMap }

            for (const box of filteredBoxes) {
                // 이미 주소가 있으면 건너뛰기
                if (existingAddresses[box.id]) {
                    newAddressMap[box.id] = existingAddresses[box.id]
                    continue
                }

                if (!box.lat || !box.lng) continue

                try {
                    await new Promise((resolve) => {
                        geocoder.coord2Address(box.lng, box.lat, (result, status) => {
                            if (status === window.kakao.maps.services.Status.OK) {
                                newAddressMap[box.id] = result[0].road_address
                                    ? result[0].road_address.address_name
                                    : result[0].address.address_name
                            } else {
                                newAddressMap[box.id] = "주소 변환 실패"
                            }
                            resolve()
                        })
                    })
                } catch (error) {
                    console.error("주소 변환 중 오류 발생:", error)
                    newAddressMap[box.id] = "주소 변환 실패"
                }
            }

            setAddressMap((prev) => ({ ...prev, ...newAddressMap }))
            addressFetchedRef.current = true
        }

        fetchAddresses()
    }, [filteredBoxes])

    // 입력 필드 클릭 핸들러 - 지도 클릭 이벤트 일시적으로 비활성화
    const handleInputFocus = () => {
        setMapClickEnabled(false)
    }

    const handleInputBlur = () => {
        // 약간의 지연 후 지도 클릭 이벤트 다시 활성화
        setTimeout(() => {
            setMapClickEnabled(true)
        }, 100)
    }

    // 버튼 클릭 핸들러 - 지도 클릭 이벤트 일시적으로 비활성화
    const handleButtonMouseDown = () => {
        setMapClickEnabled(false)
    }

    const handleButtonMouseUp = () => {
        // 약간의 지연 후 지도 클릭 이벤트 다시 활성화
        setTimeout(() => {
            setMapClickEnabled(true)
        }, 100)
    }

    // 추천 위치 마커 클릭 핸들러 추가
    const handleRecommendedLocationClick = (location) => {
        // 기존 핀 오버레이가 열려있으면 닫기
        setShowExistingPinOverlay(false)

        // 클릭한 추천 위치에 새 핀 생성
        setNewPinPosition({
            lat: location.lat,
            lng: location.lng,
        })
        setShowNewPinOverlay(true)

        // 입력 필드 초기화
        setNewBoxName("")
        setNewBoxIpAddress("")
    }

    const formatInstallStatus = (status) => {
        if (!status) return "상태 정보 없음"

        const statusMap = {
            INSTALL_REQUEST: "설치 요청 중",
            INSTALL_IN_PROGRESS: "설치 진행 중",
            INSTALL_COMPLETED: "설치 완료",
            INSTALL_CONFIRME: "설치 확정",
            REMOVE_REQUEST: "제거 요청 중",
            REMOVE_IN_PROGRESS: "제거 진행 중",
            REMOVE_COMPLETED: "제거 완료",
            REMOVE_CONFIRMED: "제거 확정",
        }

        return statusMap[status] || status
    }

    const handleCopy = (e, boxId, text) => {
        e.stopPropagation() // 이벤트 버블링 방지

        navigator.clipboard
            .writeText(text)
            .then(() => {
                // 복사된 항목 ID 저장
                setCopiedId(boxId)

                // 1.5초 후 상태 초기화
                setTimeout(() => {
                    setCopiedId(null)
                }, 1500)
            })
            .catch((err) => {
                console.error("복사 실패:", err)
            })
    }

    // ✅ 아이콘 결정 (화재 우선)
    const getMarkerIcon = (box) => {
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
            if (box.status === "fire") return FireIcon
            const maxVolume = Math.max(box.volume1 || 0, box.volume2 || 0, box.volume3 || 0)
            if (maxVolume <= 50) return selectedBoxId === box.id ? GreenSelectIcon : GreenIcon
            if (maxVolume <= 80) return selectedBoxId === box.id ? YellowSelectIcon : YellowIcon
            return selectedBoxId === box.id ? RedSelectIcon : RedIcon
        }
    }

    // ✅ 크기 결정
    const getMarkerSize = (box) => {
        if (box.status === "fire") {
            return selectedBoxId === box.id ? { width: 45, height: 50 } : { width: 34, height: 40 }
        }
        return selectedBoxId === box.id ? { width: 45, height: 50 } : { width: 34, height: 40 }
    }

    // Handle marker click - select box and scroll to list item
    const handleMarkerClick = (boxId) => {
        setSelectedBoxId(boxId)

        // isAddRemovePage가 true일 때 기존 핀 클릭 시 오버레이 표시
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
    }

    // Handle list item click - select box and center map on marker
    const handleListItemClick = (box) => {
        setSelectedBoxId(box.id)

        // isAddRemovePage가 true일 때 기존 핀 클릭 시 오버레이 표시
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
    }

    // 지도 클릭 이벤트 핸들러
    const handleMapClick = (_, mouseEvent) => {
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
        setShowNewPinOverlay(true)

        // 입력 필드 초기화
        setNewBoxName("")
        setNewBoxIpAddress("")
    }

    // 설치 요청 처리
    const handleInstallRequest = async (e) => {
        e.stopPropagation() // 이벤트 전파 방지

        if (!newBoxName || !newBoxIpAddress || !newPinPosition) {
            alert("수거함 이름과 IP 주소를 모두 입력해주세요.")
            return
        }

        setIsSubmitting(true)

        try {
            await requestInstallBox({
                name: newBoxName,
                ipAddress: newBoxIpAddress,
                longitude: newPinPosition.lng,
                latitude: newPinPosition.lat,
            })

            alert("설치 요청이 성공적으로 전송되었습니다.")

            // 상태 초기화
            setNewPinPosition(null)
            setShowNewPinOverlay(false)
            setNewBoxName("")
            setNewBoxIpAddress("")

            onDataChange()
        } catch (error) {
            alert("설치 요청 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류"))
        } finally {
            setIsSubmitting(false)
            onDataChange()
        }
    }

    // 제거 요청 처리
    const handleRemoveRequest = async (e) => {
        e.stopPropagation() // 이벤트 전파 방지

        if (!selectedBoxId) return

        setIsSubmitting(true)

        try {
            await requestRemoveBox(selectedBoxId)
            alert("제거 요청이 성공적으로 전송되었습니다.")
            setShowExistingPinOverlay(false)

            onDataChange()
        } catch (error) {
            alert("제거 요청 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류"))
        } finally {
            setIsSubmitting(false)
            onDataChange()
        }
    }

    // 오버레이 닫기
    const closeOverlays = (e) => {
        e.stopPropagation() // 이벤트 전파 방지
        setShowNewPinOverlay(false)
        setShowExistingPinOverlay(false)
        setNewPinPosition(null)
    }

    // 선택된 박스 정보 가져오기
    const getSelectedBox = () => {
        return filteredBoxes.find((box) => box.id === selectedBoxId) || null
    }

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
                            placeholder="장소, 주소, 수거함 코드 검색"
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

                    {/* 리스트 */}
                    <div className="overflow-y-auto h-[calc(100%-60px)] ml-4 custom-scrollbar">
                        {displayedBoxes.map((box) => (
                            <div
                                key={box.id}
                                ref={(el) => (listItemRefs.current[box.id] = el)}
                                className={`border-b border-gray-100 p-3 cursor-pointer ${selectedBoxId === box.id ? "bg-blue-50" : "hover:bg-gray-50"}`}
                                onClick={() => handleListItemClick(box)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-[#21262B]">{box.name}</h3>
                                        <p className="font-normal text-sm text-[#60697E] mt-2">{addressMap[box.id] || "주소 변환중..."}</p>
                                        <p className="font-normal text-sm text-[#60697E] mt-1">
                                            {isAddRemovePage ? (
                                                formatInstallStatus(box.installStatus)
                                            ) : (
                                                <>
                                                    {typeof box.lat === "number" ? box.lat.toFixed(8) : box.lat} /{" "}
                                                    {typeof box.lng === "number" ? box.lng.toFixed(8) : box.lng}
                                                </>
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
                        ))}
                    </div>
                </div>
            </div>

            {/* 지도 */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <Map
                    center={{ lat: 36.8082, lng: 127.009 }}
                    style={{ width: "100%", height: "100%" }}
                    level={3}
                    onCreate={setMap}
                    onClick={handleMapClick}
                    draggable={true} // 드래그 기능 명시적 활성화
                    onDragStart={() => {
                        dragStartTimeRef.current = Date.now()
                        setIsDragging(true)
                    }}
                    onDragEnd={() => {
                        // 드래그 종료 후 약간의 지연을 두고 isDragging 상태 변경
                        setTimeout(() => {
                            setIsDragging(false)
                        }, 100)
                    }}
                >
                    {/* 기존 마커들 */}
                    {filteredBoxes.map((box) => (
                        <MapMarker
                            key={box.id}
                            position={{ lat: box.lat, lng: box.lng }}
                            image={{
                                src: getMarkerIcon(box),
                                size: getMarkerSize(box),
                                options: { offset: { x: 20, y: 40 } },
                            }}
                            onClick={() => handleMarkerClick(box.id)}
                        />
                    ))}

                    {/* 새로운 핀 */}
                    {isAddRemovePage && newPinPosition && (
                        <MapMarker
                            position={newPinPosition}
                            image={{
                                src: GreenIcon,
                                size: { width: 34, height: 40 },
                                options: { offset: { x: 20, y: 40 } },
                            }}
                        />
                    )}

                    {/* 추천 위치 마커들 (showRecommendedLocations가 true일 때만 표시) */}
                    {isAddRemovePage &&
                        showRecommendedLocations &&
                        // 여기에 추천 위치 마커를 추가할 수 있습니다
                        // 예시 데이터로 구현
                        [
                            { lat: 36.8082, lng: 127.019 },
                            { lat: 36.8182, lng: 127.005 },
                            { lat: 36.7982, lng: 127.012 },
                        ].map((location, index) => (
                            <MapMarker
                                key={`recommended-${index}`}
                                position={location}
                                image={{
                                    src: YellowIcon, // 추천 위치는 노란색 아이콘 사용
                                    size: { width: 34, height: 40 },
                                    options: { offset: { x: 20, y: 40 } },
                                }}
                                onClick={() => handleRecommendedLocationClick(location)} // 클릭 이벤트 핸들러 추가
                            />
                        ))}

                    {/* 새 핀 오버레이 (CustomOverlayMap 사용) */}
                    {isAddRemovePage && showNewPinOverlay && newPinPosition && (
                        <CustomOverlayMap position={{ lat: newPinPosition.lat, lng: newPinPosition.lng }} yAnchor={1.15} zIndex={3}>
                            <div
                                className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64"
                                onClick={(e) => e.stopPropagation()} // 이벤트 전파 방지 추가
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-lg">새 수거함 설치 요청</h3>
                                    <button
                                        className="text-gray-500 hover:text-gray-700"
                                        onClick={(e) => closeOverlays(e)}
                                        onMouseDown={handleButtonMouseDown}
                                        onMouseUp={handleButtonMouseUp}
                                        onMouseLeave={handleButtonMouseUp}
                                    >
                                        ✕
                                    </button>
                                </div>
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
                                    <button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium text-sm disabled:opacity-50"
                                        onClick={(e) => handleInstallRequest(e)}
                                        onMouseDown={handleButtonMouseDown}
                                        onMouseUp={handleButtonMouseUp}
                                        onMouseLeave={handleButtonMouseUp}
                                        disabled={isSubmitting || !newBoxName || !newBoxIpAddress}
                                    >
                                        {isSubmitting ? "요청 중..." : "설치 요청"}
                                    </button>
                                </div>
                            </div>
                        </CustomOverlayMap>
                    )}

                    {/* 기존 핀 오버레이 (CustomOverlayMap 사용) */}
                    {isAddRemovePage &&
                        showExistingPinOverlay &&
                        selectedBoxId &&
                        getSelectedBox() &&
                        !getSelectedBox()?.installStatus?.startsWith("REMOVE_") && (
                            <CustomOverlayMap
                                position={{ lat: getSelectedBox()?.lat || 0, lng: getSelectedBox()?.lng || 0 }}
                                yAnchor={1.15}
                                zIndex={3}
                            >
                                <div
                                    className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64"
                                    onClick={(e) => e.stopPropagation()} // 이벤트 전파 방지 추가
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-lg">수거함 제거 요청</h3>
                                        <button
                                            className="text-gray-500 hover:text-gray-700"
                                            onClick={(e) => closeOverlays(e)}
                                            onMouseDown={handleButtonMouseDown}
                                            onMouseUp={handleButtonMouseUp}
                                            onMouseLeave={handleButtonMouseUp}
                                        >
                                            ✕
                                        </button>
                                    </div>
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
                                        <button
                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium text-sm disabled:opacity-50"
                                            onClick={(e) => handleRemoveRequest(e)}
                                            onMouseDown={handleButtonMouseDown}
                                            onMouseUp={handleButtonMouseUp}
                                            onMouseLeave={handleButtonMouseUp}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "요청 중..." : "제거 요청"}
                                        </button>
                                    </div>
                                </div>
                            </CustomOverlayMap>
                        )}
                </Map>

                {/* 토글 버튼 - 상태에 따라 텍스트와 색상 변경 */}
                {isAddRemovePage && (
                    <button
                        className={`absolute top-4 right-4 rounded-md text-white font-bold p-2 z-10 shadow-md transition-colors duration-200 ${
                            showRecommendedLocations ? "bg-[#00C17B]" : "bg-[#FF7671]"
                        }`}
                        onClick={toggleRecommendedLocations}
                    >
                        설치 추천 위치 {showRecommendedLocations ? "ON" : "OFF"}
                    </button>
                )}
            </div>
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
