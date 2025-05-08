"use client"

import React from "react"

import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react"
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

// API 함수 import
import {
    requestInstallBox,
    requestRemoveBox,
    fetchFilteredRecommendedBoxes,
    fetchCoordinates,
} from "../api/apiServices" // 경로는 실제 API 파일 위치에 맞게 조정해주세요

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
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
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
        <button className={className} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    )
})
ActionButton.displayName = "ActionButton"

const MapWithSidebar = ({ filteredBoxes, isMainPage = false, isAddRemovePage = false, onDataChange = () => {} }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [selectedBoxId, setSelectedBoxId] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [addressMap, setAddressMap] = useState({})
    const [copiedId, setCopiedId] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const dragStartTimeRef = useRef(0)
    const [showRecommendedLocations, setShowRecommendedLocations] = useState(false)
    const [mapClickEnabled, setMapClickEnabled] = useState(true) // 지도 클릭 활성화 상태

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

    // 표시할 박스 필터링 함수 - useMemo로 최적화
    const shouldDisplayBox = useCallback(
        (box) => {
            return (
                isAddRemovePage ||
                box.installStatus === "INSTALL_CONFIRME" ||
                box.installStatus === "REMOVE_REQUEST" ||
                box.installStatus === "REMOVE_IN_PROGRESS"
            )
        },
        [isAddRemovePage],
    )

    // 검색 및 필터링된 박스 - useMemo로 최적화
    const displayedBoxes = useMemo(() => {
        if (searchTerm) {
            return filteredBoxes.filter((box) => {
                const nameMatch = box.name.toLowerCase().includes(searchTerm.toLowerCase())
                const address = addressMap[box.id] || ""
                const addressMatch = address.toLowerCase().includes(searchTerm.toLowerCase())
                return (nameMatch || addressMatch) && shouldDisplayBox(box)
            })
        }
        return filteredBoxes.filter(shouldDisplayBox)
    }, [filteredBoxes, searchTerm, addressMap, shouldDisplayBox])

    const addressFetchedRef = useRef(false)
    const geocoderRef = useRef(null)

    // 지오코더 초기화 - 한 번만 생성
    useEffect(() => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            geocoderRef.current = new window.kakao.maps.services.Geocoder()
        }
    }, [])

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

    // 토글 함수 수정 - 추천 위치 ON/OFF 전환
    const toggleRecommendedLocations = useCallback(() => {
        setShowRecommendedLocations((prev) => {
            const newState = !prev
            // ON으로 변경될 때만 데이터 로드
            if (newState && !dataLoadedRef.current) {
                loadAllData()
            }
            return newState
        })
    }, [loadAllData])

    // 군집 멤버 수 가져오기 - 직접 필터링 방식으로 변경하여 성능 개선
    const getClusterMemberCount = useCallback(
        (clusterId) => {
            if (clusterId === undefined) return 0

            // 직접 필터링하여 카운트 (메모이제이션 없이 직접 계산)
            return recommendedLocations.filter(
                (loc) => loc.point_type === "cluster_member" && Number(loc.cluster) === Number(clusterId),
            ).length
        },
        [recommendedLocations],
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
            } else {
                console.log("🔄 새 군집 선택:", clickedClusterId)
                setSelectedCluster(clickedClusterId)
            }

            // 상세 정보 표시
            setSelectedBoxId(null) // 기존 선택 해제
            setShowExistingPinOverlay(false)
            setShowNewPinOverlay(false)
            setNewPinPosition(null)
        },
        [selectedCluster, setShowExistingPinOverlay, setShowNewPinOverlay, setNewPinPosition],
    )

    // 주소 변환 로직 최적화 - 추천 위치 제외
    useEffect(() => {
        // 이미 주소를 가져왔거나 filteredBoxes가 비어있거나 지오코더가 없으면 실행하지 않음
        if (addressFetchedRef.current || filteredBoxes.length === 0 || !geocoderRef.current) {
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

            addressFetchedRef.current = true
        }

        fetchAddresses()
    }, [filteredBoxes, addressMap])

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
    const handleButtonMouseDown = useCallback(() => {
        setMapClickEnabled(false)
    }, [])

    const handleButtonMouseUp = useCallback(() => {
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

            // 클릭한 추천 위치에 새 핀 생성
            setNewPinPosition({
                lat: location.lat,
                lng: location.lng,
            })
            setShowNewPinOverlay(true)

            // 입력 필드 초기화
            setNewBoxName("")
            setNewBoxIpAddress("")
        },
        [setShowExistingPinOverlay, setNewPinPosition, setShowNewPinOverlay],
    )

    // 상태 포맷 함수 - useMemo로 최적화
    const statusMap = useMemo(
        () => ({
            INSTALL_REQUEST: "설치 요청 중",
            INSTALL_IN_PROGRESS: "설치 진행 중",
            INSTALL_COMPLETED: "설치 완료",
            INSTALL_CONFIRME: "설치 확정",
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
                    box.installStatus === "INSTALL_CONFIRME" ||
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
        },
        [isAddRemovePage, filteredBoxes, isSidebarOpen, setShowExistingPinOverlay, setShowNewPinOverlay, setNewPinPosition],
    )

    // Handle list item click - select box and center map on marker
    const handleListItemClick = useCallback(
        (box) => {
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
        },
        [isAddRemovePage, map, setShowExistingPinOverlay, setShowNewPinOverlay, setNewPinPosition],
    )

    // 지도 클릭 이벤트 핸들러
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
            setShowNewPinOverlay(true)

            // 입력 필드 초기화
            setNewBoxName("")
            setNewBoxIpAddress("")
        },
        [mapClickEnabled, isDragging, isAddRemovePage, setShowExistingPinOverlay, setNewPinPosition, setShowNewPinOverlay],
    )

    // 설치 요청 처리
    const handleInstallRequest = useCallback(
        async (e) => {
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
            }
        },
        [newBoxName, newBoxIpAddress, newPinPosition, onDataChange, setShowNewPinOverlay, setNewPinPosition],
    )

    // 제거 요청 처리
    const handleRemoveRequest = useCallback(
        async (e) => {
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
            }
        },
        [selectedBoxId, onDataChange, setShowExistingPinOverlay],
    )

    // 오버레이 닫기
    const closeOverlays = useCallback(
        (e) => {
            e.stopPropagation() // 이벤트 전파 방지
            setShowNewPinOverlay(false)
            setShowExistingPinOverlay(false)
            setNewPinPosition(null)
        },
        [setShowNewPinOverlay, setShowExistingPinOverlay, setNewPinPosition],
    )

    // 선택된 박스 정보 가져오기
    const getSelectedBox = useCallback(() => {
        return filteredBoxes.find((box) => box.id === selectedBoxId) || null
    }, [filteredBoxes, selectedBoxId])

    // 지도 확대 레벨에 따라 표시할 마커 필터링
    const visibleFireStations = useMemo(() => {
        if (!showRecommendedLocations || !showFireStations || !isAddRemovePage) return []

        // 확대 레벨이 높을수록(숫자가 작을수록) 더 많은 마커 표시
        if (mapLevel <= 3) {
            return fireStations
        } else if (mapLevel <= 5) {
            // 중간 확대 레벨에서는 일부만 표시
            return fireStations.filter((_, index) => index % 2 === 0)
        } else {
            // 축소 레벨에서는 더 적게 표시
            return fireStations.filter((_, index) => index % 4 === 0)
        }
    }, [fireStations, showFireStations, isAddRemovePage, mapLevel, showRecommendedLocations])

    // 지도 확대 레벨에 따라 표시할 어린이보호구역 필터링
    const visibleSafetyZones = useMemo(() => {
        if (!showRecommendedLocations || !showSafetyZones || !isAddRemovePage) return []

        if (mapLevel <= 3) {
            return safetyZones
        } else if (mapLevel <= 5) {
            return safetyZones.filter((_, index) => index % 2 === 0)
        } else {
            return safetyZones.filter((_, index) => index % 4 === 0)
        }
    }, [safetyZones, showSafetyZones, isAddRemovePage, mapLevel, showRecommendedLocations])

    // 지도 확대 레벨 변경 핸들러
    const handleZoomChanged = useCallback((map) => {
        setMapLevel(map.getLevel())
    }, [])

    // 군집 중심점 마커 메모이제이션
    const centroidMarkers = useMemo(() => {
        if (!isAddRemovePage || !showRecommendedLocations) return []

        return recommendedLocations
            .filter((loc) => loc.point_type === "centroid")
            .map((centroid, index) => {
                const memberCount = getClusterMemberCount(centroid.cluster)
                return {
                    centroid,
                    memberCount,
                    key: `centroid-${centroid.cluster}-${index}`,
                }
            })
    }, [isAddRemovePage, showRecommendedLocations, recommendedLocations, getClusterMemberCount])

    // 독립 추천 위치 마커 메모이제이션
    const noiseMarkers = useMemo(() => {
        if (!isAddRemovePage || !showRecommendedLocations) return []

        return recommendedLocations.filter((loc) => loc.point_type === "noise")
    }, [isAddRemovePage, showRecommendedLocations, recommendedLocations])

    // 선택된 군집의 멤버 마커 메모이제이션
    const clusterMemberMarkers = useMemo(() => {
        if (!isAddRemovePage || !showRecommendedLocations || selectedCluster === null) return []

        return recommendedLocations.filter(
            (loc) => loc.point_type === "cluster_member" && Number(loc.cluster) === Number(selectedCluster),
        )
    }, [isAddRemovePage, showRecommendedLocations, recommendedLocations, selectedCluster])

    // 마커 렌더링 최적화 - 화면에 보이는 영역만 렌더링
    const [mapBounds, setMapBounds] = useState(null)

    // 지도 이동 시 바운드 업데이트
    const handleMapDragEnd = useCallback((map) => {
        setMapBounds(map.getBounds())
        setIsDragging(false)
    }, [])

    // 화면에 보이는 마커만 필터링
    const visibleBoxMarkers = useMemo(() => {
        if (!mapBounds) return displayedBoxes

        return displayedBoxes.filter((box) => {
            const position = new window.kakao.maps.LatLng(box.lat, box.lng)
            return mapBounds.contain(position)
        })
    }, [displayedBoxes, mapBounds])

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
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <Map
                    center={{ lat: 36.8082, lng: 127.009 }}
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
                    onDragEnd={handleMapDragEnd}
                >
                    {/* 기존 마커들 - 필터링하여 표시 */}
                    {visibleBoxMarkers.map((box) => {
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

                    {/* 어린이보호구역 및 소방서 마커 - 설치 추천 위치가 ON일 때만 표시 */}
                    {isAddRemovePage && showRecommendedLocations && (
                        <>
                            {/* 어린이보호구역 반경 원 */}
                            {showSafetyZones &&
                                showSafetyZoneRadius &&
                                visibleSafetyZones.map((zone) => (
                                    <Circle
                                        key={`circle-${zone.id}`}
                                        center={{
                                            lat: zone.lat,
                                            lng: zone.lng,
                                        }}
                                        radius={SAFETY_ZONE_RADIUS} // 300미터 반경
                                        strokeWeight={2} // 외곽선 두께
                                        strokeColor={"#FFCC00"} // 외곽선 색상 (��란색)
                                        strokeOpacity={0.5} // 외곽선 투명도
                                        strokeStyle={"solid"} // 외곽선 스타일
                                        fillColor={"#FFCC00"} // 내부 색상 (노란색)
                                        fillOpacity={0.2} // 내부 투명도 (반투명)
                                    />
                                ))}

                            {/* 어린이보호구역 마커 */}
                            {showSafetyZones &&
                                visibleSafetyZones.map((zone) => (
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
                                visibleFireStations.map((station) => (
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
                            {noiseMarkers.map((loc, index) => (
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

                            {/* 군집 중심점 마커 */}
                            {centroidMarkers.map(({ centroid, memberCount, key }) => (
                                <React.Fragment key={key}>
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
                            ))}

                            {/* 군집 멤버 마커 (선택된 군집의 멤버만 표시) */}
                            {clusterMemberMarkers.map((member, index) => (
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
                        !getSelectedBox()?.installStatus?.startsWith("REMOVE_") && (
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
