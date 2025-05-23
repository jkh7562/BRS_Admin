"use client"

import { useState, useEffect, useRef } from "react"
import { Map, MapMarker } from "react-kakao-maps-sdk"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import DownIcon from "../../assets/Down.png"
import GreenIcon from "../../assets/아이콘 GREEN.png"
import YellowIcon from "../../assets/아이콘 YELLOW.png"
import RedIcon from "../../assets/아이콘 RED.png"
import { findAllBox, getBoxLog, getBoxImage, getCollectionImage, getItemsImage } from "../../api/apiServices"

// 좌표 파싱 함수
const parseCoordinates = (location) => {
    if (!location) return 0

    const coordsMatch = location.match(/POINT\s*\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)/)
    if (coordsMatch) {
        return {
            lng: Number.parseFloat(coordsMatch[1]),
            lat: Number.parseFloat(coordsMatch[2]),
        }
    }

    return 0 // 기본값
}

// 최대 수거량 계산 함수
const getMaxVolume = (box) => {
    if (!box) return 0

    const volume1 = box.volume1 || 0
    const volume2 = box.volume2 || 0
    const volume3 = box.volume3 || 0

    return Math.max(volume1, volume2, volume3)
}

// 날짜 포맷 함수
const formatDate = (dateString) => {
    if (!dateString) return "-"

    const date = new Date(dateString)
    return date
        .toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
        .replace(/\./g, "/")
        .replace(",", "")
}

const N_boxControlLogPage = () => {
    // 지도 ref 추가
    const mapRef = useRef(null)

    // 복사된 박스 ID 상태 추가 (N_boxControlLogPage 컴포넌트 내부 상단에 추가)
    const [copiedBoxId, setCopiedBoxId] = useState(null)
    // 주소 저장을 위한 상태 추가
    const [addressMap, setAddressMap] = useState({})

    // 검색어 상태 추가 (N_boxControlLogPage 컴포넌트 내부 상단에 추가)
    const [boxSearchTerm, setBoxSearchTerm] = useState("")
    const [logSearchTerm, setLogSearchTerm] = useState("")

    // Replace the year, month, day state definitions with these:
    const [year, setYear] = useState("")
    const [month, setMonth] = useState("")
    const [day, setDay] = useState("")

    // Add this after the existing state declarations
    const [boxData, setBoxData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLogLoading, setIsLogLoading] = useState(true)

    // Modal state for image viewing
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalImages, setModalImages] = useState(null)
    const [modalTitle, setModalTitle] = useState("")
    const [modalLoading, setModalLoading] = useState(false)

    // 로그 데이터 상태 추가
    const [logData, setLogData] = useState([])

    // 박스 이미지 관련 상태 추가
    const [selectedBoxImage, setSelectedBoxImage] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Generate years (current year and 2 previous years)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 3 }, (_, i) => (currentYear - 2 + i).toString())

    // Generate months 1-12 (padded with 0)
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"))

    // With this function to get days based on month and year:
    const getDaysInMonth = (year, month) => {
        // If year or month is not selected, return empty array
        if (!year || !month) return []

        // Convert string inputs to numbers
        const numYear = Number.parseInt(year)
        const numMonth = Number.parseInt(month)

        // Get the number of days in the selected month
        // Month is 1-based in our UI but 0-based in Date constructor
        const daysInMonth = new Date(numYear, numMonth, 0).getDate()

        return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, "0"))
    }

    // Then update the days state to be dynamic:
    const [days, setDays] = useState(() => getDaysInMonth(year, month))

    // 복사 핸들러 함수 수정
    const handleCopy = (e, boxId, text) => {
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
                setCopiedBoxId(boxId)

                // 1.5초 후 상태 초기화
                setTimeout(() => {
                    setCopiedBoxId(null)
                }, 1500)
            } else {
                console.error("execCommand 복사 실패")
            }
        } catch (err) {
            console.error("복사 실패:", err)
        }
    }

    // Update the useEffect for days:
    useEffect(() => {
        setDays(getDaysInMonth(year, month))

        // If month changes and day is no longer valid, reset day
        if (year && month) {
            const daysInSelectedMonth = getDaysInMonth(year, month)
            if (day && Number.parseInt(day) > daysInSelectedMonth.length) {
                setDay("")
            }
        }
    }, [year, month, day])

    // Handle year changes
    useEffect(() => {
        // If year is cleared, clear month and day
        if (!year) {
            setMonth("")
            setDay("")
        }
    }, [year])

    // Handle month changes
    useEffect(() => {
        // If month is cleared, clear day
        if (!month) {
            setDay("")
        }
    }, [month])

    // Replace the selectedBox state initialization with:
    const [selectedBox, setSelectedBox] = useState(null)

    const [logType, setLogType] = useState("discharge")

    // Add this useEffect to set the initial selected box when data is loaded
    useEffect(() => {
        if (boxData.length > 0 && !selectedBox) {
            setSelectedBox(boxData[0])
        }
    }, [boxData, selectedBox])

    useEffect(() => {
        if (selectedBox && mapRef.current) {
            const coords = parseCoordinates(selectedBox.location)
            if (coords && coords !== 0) {
                // 지도 중심 이동
                mapRef.current.setCenter(new window.kakao.maps.LatLng(coords.lat, coords.lng))
            }
        }
    }, [selectedBox])

    // 선택된 박스 이미지 로드 useEffect 추가
    useEffect(() => {
        const loadBoxImage = async () => {
            if (!selectedBox) {
                setSelectedBoxImage(null)
                return
            }

            try {
                setImageLoading(true)
                setImageError(false)

                const imageBlob = await getBoxImage(selectedBox.id)

                if (imageBlob) {
                    // Blob을 URL로 변환
                    const imageUrl = URL.createObjectURL(imageBlob)
                    setSelectedBoxImage(imageUrl)
                } else {
                    setImageError(true)
                    setSelectedBoxImage(null)
                }
            } catch (error) {
                console.error("박스 이미지 로드 실패:", error)
                setImageError(true)
                setSelectedBoxImage(null)
            } finally {
                setImageLoading(false)
            }
        }

        loadBoxImage()

        // 컴포넌트 언마운트 시 URL 정리
        return () => {
            if (selectedBoxImage) {
                URL.revokeObjectURL(selectedBoxImage)
            }
        }
    }, [selectedBox])

    // 좌표를 주소로 변환하는 함수
    const convertCoordsToAddress = async (boxId, location) => {
        const coords = parseCoordinates(location)
        if (!coords || coords === 0) return

        // 이미 변환된 주소가 있으면 스킵
        if (addressMap[boxId]) return

        try {
            // 카카오맵 API의 geocoder 서비스 사용
            const geocoder = new window.kakao.maps.services.Geocoder()

            geocoder.coord2Address(coords.lng, coords.lat, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const address = result[0].address.address_name || "주소 정보 없음"

                    // 주소 상태 업데이트
                    setAddressMap((prev) => ({
                        ...prev,
                        [boxId]: address,
                    }))
                }
            })
        } catch (error) {
            console.error("주소 변환 오류:", error)
        }
    }

    // Replace the existing useEffect for fetching box data with this:
    useEffect(() => {
        const fetchBoxData = async () => {
            try {
                setIsLoading(true)
                const response = await findAllBox()
                // Filter boxes with the required install_status
                const filteredBoxes = response.filter((box) =>
                    ["INSTALL_CONFIRMED", "REMOVE_REQUEST", "REMOVE_IN_PROGRESS"].includes(box.installStatus),
                )
                console.log(filteredBoxes)
                setBoxData(filteredBoxes)

                // 각 박스의 좌표를 주소로 변환
                filteredBoxes.forEach((box) => {
                    if (box.location) {
                        convertCoordsToAddress(box.id, box.location)
                    }
                })
            } catch (error) {
                console.error("Error fetching box data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBoxData()
    }, [])

    // 로그 데이터 가져오기
    useEffect(() => {
        const fetchLogData = async () => {
            if (!selectedBox) return

            try {
                setIsLogLoading(true)
                const response = await getBoxLog(selectedBox.id)
                console.log("Box logs:", response)

                // 중첩된 구조를 평탄화
                const flattenedLogs = response ? response.map((item) => item.boxLog) : []
                setLogData(flattenedLogs)
            } catch (error) {
                console.error("Error fetching box logs:", error)
                setLogData([])
            } finally {
                setIsLogLoading(false)
            }
        }

        fetchLogData()
    }, [selectedBox, year, month, day, logType])

    // Replace the boxList and filteredBoxList variables with this:
    const filteredBoxList = boxData.filter(
        (box) =>
            box.name.toLowerCase().includes(boxSearchTerm.toLowerCase()) ||
            (box.location && box.location.toLowerCase().includes(boxSearchTerm.toLowerCase())),
    )

    // 로그 상세 보기 핸들러
    const handleViewDetails = async (log) => {
        try {
            setModalLoading(true)
            setIsModalOpen(true)
            setModalTitle(log.type === "COLLECTION" || log.type === "수거" ? "수거 이미지" : "배출 아이템 이미지")

            // 로그 타입에 따라 다른 API 호출
            if (log.type === "COLLECTION" || log.type === "수거") {
                // 수거 이미지 가져오기
                const imageUrl = await getCollectionImage(log.id)
                setModalImages({ collection: imageUrl })
            } else {
                // 배출 아이템 이미지 가져오기
                const imageUrls = await getItemsImage(log.id)
                setModalImages(imageUrls)
            }
        } catch (error) {
            console.error("이미지 로드 실패:", error)
            setModalImages(null)
        } finally {
            setModalLoading(false)
        }
    }

    // 필터링된 로그 데이터 - 수정된 버전
    const filteredLogData = logData.filter((log) => {
        // 로그 타입 필터링 - 수정된 로직
        if (logType === "discharge") {
            // 배출 로그: DISCHARGE 또는 "분리"
            if (log.type !== "DISCHARGE" && log.type !== "분리") return false
        } else if (logType === "collection") {
            // 수거 로그: COLLECTION 또는 "수거"
            if (log.type !== "COLLECTION" && log.type !== "수거") return false
        }

        // 날짜 필터링
        if (year || month || day) {
            const logDate = new Date(log.date)

            if (year && logDate.getFullYear().toString() !== year) return false

            if (month) {
                const logMonth = (logDate.getMonth() + 1).toString().padStart(2, "0")
                if (logMonth !== month) return false
            }

            if (day) {
                const logDay = logDate.getDate().toString().padStart(2, "0")
                if (logDay !== day) return false
            }
        }

        // 검색어 필터링 - 수정된 필드명
        if (logSearchTerm) {
            const searchTerm = logSearchTerm.toLowerCase()
            const boxName = boxData.find((box) => box.id === log.boxId)?.name || ""

            return (log.userId && log.userId.toLowerCase().includes(searchTerm)) || boxName.toLowerCase().includes(searchTerm)
        }

        return true
    })

    // Replace the statsData object with this:
    const statsData = {
        totalBoxes: selectedBox?.volume1 || 0,
        batteryCount: selectedBox?.volume2 || 0,
        activeBatteries: selectedBox?.volume3 || 0,
    }

    const [controlStates, setControlStates] = useState({
        battery: {
            isOpen: false,
        },
        dischargedBattery: {
            isOpen: false,
        },
        remainingCapacityBattery: {
            isOpen: false,
        },
        collectorEntrance: {
            isOpen: false,
        },
    })

    const [isBoxBlocked, setIsBoxBlocked] = useState(false)

    // Handle dropdown changes with reset capability
    const handleYearChange = (e) => {
        setYear(e.target.value)
    }

    const handleMonthChange = (e) => {
        setMonth(e.target.value)
    }

    const handleDayChange = (e) => {
        setDay(e.target.value)
    }

    // 박스 검색 입력 필드 핸들러 추가 (handleDayChange 함수 아래에 추가)
    const handleBoxSearch = (e) => {
        setBoxSearchTerm(e.target.value)
    }

    // 로그 검색 입력 필드 추가 (로그 테이블 위에 추가할 예정)
    const handleLogSearch = (e) => {
        setLogSearchTerm(e.target.value)
    }

    // 박스 선택 및 지도 포커싱 핸들러
    const handleBoxSelect = (box) => {
        setSelectedBox(box)

        // 좌표 파싱
        const coords = parseCoordinates(box.location)
        if (coords && coords !== 0 && mapRef.current) {
            // 지도 중심 이동
            mapRef.current.setCenter(new window.kakao.maps.LatLng(coords.lat, coords.lng))
        }
    }

    // 박스 이름 가져오기 - 수정된 버전
    const getBoxName = (boxId) => {
        const box = boxData.find((box) => box.id === boxId)
        return box ? box.name : "알 수 없는 수거함"
    }

    return (
        <div className="flex min-h-screen w-full bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <div className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-[#272F42] text-xl">수거함 현황 / 제어</p>
                    <div className="flex">
                        {/* Collection Box Control Interface - Left and Center sections */}
                        <div className="flex w-full h-[520px] bg-white rounded-2xl shadow-md overflow-hidden">
                            {/* Left Sidebar - Box List */}
                            <div className="w-[350px] h-full flex flex-col border-r">
                                <div>
                                    <div className="relative mx-2 my-4 p-3">
                                        <input
                                            type="text"
                                            placeholder="장소, 주소, 수거함 코드 검색"
                                            className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                                            value={boxSearchTerm}
                                            onChange={handleBoxSearch}
                                        />
                                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                            <img src={SearchIcon || "/placeholder.svg?height=20&width=20"} alt="검색" />
                                        </div>
                                    </div>
                                </div>

                                {/* Box list with scrollbar */}
                                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                                    {isLoading ? (
                                        <div className="p-4 text-center text-gray-500">데이터 로딩 중...</div>
                                    ) : filteredBoxList.length > 0 ? (
                                        filteredBoxList.map((box) => (
                                            <BoxListItem
                                                key={box.id}
                                                id={box.id}
                                                name={box.name}
                                                location={box.location || "위치 정보 없음"}
                                                date={box.install_date || "날짜 정보 없음"}
                                                isActive={selectedBox?.id ? box.id === selectedBox.id : box.id === filteredBoxList[0]?.id}
                                                onClick={() => handleBoxSelect(box)}
                                                handleCopy={handleCopy}
                                                copiedBoxId={copiedBoxId}
                                                addressMap={addressMap}
                                                box={box}
                                            />
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">검색 결과가 없습니다</div>
                                    )}
                                </div>
                            </div>

                            {/* Center Section - Map and Image View */}
                            <div className="flex-1 relative flex">
                                {/* Map Section */}
                                <div className="flex-1 flex flex-col">
                                    {/* Map title overlay */}
                                    <div className="p-10 pb-9 bg-white">
                                        <h2 className="text-2xl text-[#21262B] font-bold mb-1">
                                            {selectedBox?.name || "수거함 선택 필요"}
                                        </h2>
                                        <p className="text-[#60697E]">
                                            <span className="font-bold pr-1">주소</span>{" "}
                                            <span className="font-normal">
                        {selectedBox ? addressMap[selectedBox.id] || "주소 변환 중..." : "-"}
                      </span>
                                        </p>
                                    </div>

                                    {/* Map */}
                                    <div className="flex-1 w-full px-10 pb-10">
                                        <Map
                                            ref={mapRef}
                                            center={{
                                                lat: selectedBox?.latitude || 36.8082,
                                                lng: selectedBox?.longitude || 127.009,
                                            }}
                                            style={{ width: "100%", height: "100%" }}
                                            level={3}
                                            className={"border rounded-2xl"}
                                        >
                                            {filteredBoxList.map((box) => {
                                                const coords = parseCoordinates(box.location)
                                                if (coords && coords !== 0) {
                                                    const maxVolume = getMaxVolume(box)
                                                    let markerIcon = GreenIcon

                                                    if (maxVolume > 80) {
                                                        markerIcon = RedIcon
                                                    } else if (maxVolume > 50) {
                                                        markerIcon = YellowIcon
                                                    }

                                                    return (
                                                        <MapMarker
                                                            key={box.id}
                                                            position={{ lat: coords.lat, lng: coords.lng }}
                                                            image={{
                                                                src: markerIcon,
                                                                size: { width: 34, height: 40 },
                                                            }}
                                                            onClick={() => handleBoxSelect(box)}
                                                        />
                                                    )
                                                }
                                                return null
                                            })}
                                        </Map>
                                    </div>
                                </div>

                                {/* Image Section */}
                                <div className="w-[300px] border-l bg-gray-50 flex flex-col">
                                    <div className="p-4 border-b bg-white">
                                        <h3 className="text-lg font-bold text-[#21262B]">수거함 이미지</h3>
                                    </div>
                                    <div className="flex-1 p-4 flex items-center justify-center">
                                        {imageLoading ? (
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <p className="text-sm text-gray-500">이미지 로딩 중...</p>
                                            </div>
                                        ) : imageError || !selectedBoxImage ? (
                                            <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-sm text-center">
                                                    {selectedBox ? "이미지를 불러올 수 없습니다" : "수거함을 선택해주세요"}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <img
                                                    src={selectedBoxImage || "/placeholder.svg"}
                                                    alt={`${selectedBox?.name} 이미지`}
                                                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                                    onError={() => {
                                                        setImageError(true)
                                                        setSelectedBoxImage(null)
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {selectedBox && selectedBoxImage && !imageError && (
                                        <div className="p-4 border-t bg-white">
                                            <p className="text-sm text-gray-600 text-center">{selectedBox.name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Box Info - Now as a separate element */}
                        <div className="w-[320px] space-y-4 pl-6">
                            {/* 건전지 (Battery Boxes) */}
                            <div className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">건전지</div>
                                        <div className="text-xl text-[#21262B] font-bold">{statsData.totalBoxes}개</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방</div>
                                            <RadioButton
                                                selected={controlStates.battery.isOpen}
                                                color="green"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        battery: { isOpen: true },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄</div>
                                            <RadioButton
                                                selected={!controlStates.battery.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        battery: { isOpen: false },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 방전 배터리 (Discharged Batteries) */}
                            <div className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">방전 배터리</div>
                                        <div className="text-xl text-[#21262B] font-bold">{statsData.batteryCount}개</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방</div>
                                            <RadioButton
                                                selected={controlStates.dischargedBattery.isOpen}
                                                color="green"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        dischargedBattery: { isOpen: true },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄</div>
                                            <RadioButton
                                                selected={!controlStates.dischargedBattery.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        dischargedBattery: { isOpen: false },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 잔여 용량 배터리 (Remaining Capacity Batteries) */}
                            <div className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">잔여 용량 배터리</div>
                                        <div className="text-xl text-[#21262B] font-bold">{statsData.activeBatteries}개</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방</div>
                                            <RadioButton
                                                selected={controlStates.remainingCapacityBattery.isOpen}
                                                color="green"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        remainingCapacityBattery: { isOpen: true },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄</div>
                                            <RadioButton
                                                selected={!controlStates.remainingCapacityBattery.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        remainingCapacityBattery: { isOpen: false },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 수거자 입구 (Collector Entrance) */}
                            <div className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">수거자 입구</div>
                                        <div className="text-[#60697E]">개폐 제어</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방</div>
                                            <RadioButton
                                                selected={controlStates.collectorEntrance.isOpen}
                                                color="green"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        collectorEntrance: { isOpen: true },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄</div>
                                            <RadioButton
                                                selected={!controlStates.collectorEntrance.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        collectorEntrance: { isOpen: false },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 수거함 차단 Button (Collection Box Block) */}
                            <button
                                onClick={() => setIsBoxBlocked(!isBoxBlocked)}
                                className={`w-full py-6 ${isBoxBlocked ? "bg-red-600" : "bg-[#21262B]"} text-white rounded-2xl font-medium flex items-center justify-start pl-6 hover:${isBoxBlocked ? "bg-red-700" : "bg-[#1a1f23]"} transition-colors`}
                            >
                                수거함 차단
                                <div className="pl-[60px]">{isBoxBlocked ? "차단됨" : "차단"}</div>
                                <div
                                    className={`w-4 h-4 rounded-full ml-2 ${isBoxBlocked ? "bg-white" : "border-2 border-white"}`}
                                ></div>
                            </button>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-[#272F42] text-xl pt-10 pb-1">수거함 로그</p>
                        {/* Log Type Dropdown */}
                        <div className="flex">
                            <div className="relative">
                                <select
                                    className={`appearance-none py-3 pr-8 text-base text-[#21262B] focus:outline-none bg-transparent ${logType === "discharge" ? "font-bold" : "font-medium"}`}
                                    value={logType}
                                    onChange={(e) => setLogType(e.target.value)}
                                >
                                    <option value="discharge" className="font-medium">
                                        배출로그
                                    </option>
                                    <option value="collection" className="font-medium">
                                        수거로그
                                    </option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                                    <img src={DownIcon || "/placeholder.svg"} alt="아래화살표" className="w-3 h-2" />
                                </div>
                            </div>
                            {/* Date Selectors - Year, Month, Day */}
                            <div className="flex items-center ml-4">
                                {/* Year Dropdown */}
                                <div className="relative">
                                    <select
                                        className="appearance-none py-3 pr-6 text-base text-[#21262B] focus:outline-none bg-transparent font-bold"
                                        value={year}
                                        onChange={handleYearChange}
                                    >
                                        <option value="">연도</option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                        <img src={DownIcon || "/placeholder.svg"} alt="아래화살표" className="w-3 h-2" />
                                    </div>
                                </div>

                                {/* Month Dropdown */}
                                <div className="relative pl-4">
                                    <select
                                        className={`appearance-none py-3 pr-6 text-base text-[#21262B] focus:outline-none bg-transparent font-bold ${!year ? "opacity-50" : ""}`}
                                        value={month}
                                        onChange={handleMonthChange}
                                        disabled={!year}
                                    >
                                        <option value="">월</option>
                                        {months.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                        <img src={DownIcon || "/placeholder.svg"} alt="아래화살표" className="w-3 h-2" />
                                    </div>
                                </div>

                                {/* Day Dropdown */}
                                <div className="relative pl-4">
                                    <select
                                        className={`appearance-none py-3 pr-6 text-base text-[#21262B] focus:outline-none bg-transparent font-bold ${!month || !year ? "opacity-50" : ""}`}
                                        value={day}
                                        onChange={handleDayChange}
                                        disabled={!month || !year}
                                    >
                                        <option value="">일</option>
                                        {days.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                        <img src={DownIcon || "/placeholder.svg"} alt="아래화살표" className="w-3 h-2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 밑줄 추가 - 간격 좁힘 */}
                        <div className="relative -mt-2 mb-8">
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0" />
                        </div>
                    </div>

                    {/* 로그 검색 입력 필드 */}
                    <div className="relative mt-4 mb-4 w-1/3">
                        <input
                            type="text"
                            placeholder="로그 검색 (사용자, 수거함)"
                            className="w-full py-2 pl-4 pr-10 rounded-2xl border border-black/20 text-sm focus:outline-none"
                            value={logSearchTerm}
                            onChange={handleLogSearch}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg?height=20&width=20"} alt="검색" />
                        </div>
                    </div>

                    {/* Log Tables - Conditionally render based on logType */}
                    {logType === "discharge" ? (
                        <div className="mt-4 px-6 py-4 bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="w-full">
                                {/* 고정된 헤더 테이블 */}
                                <table className="w-full table-fixed border-b border-gray-200">
                                    <colgroup>
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "30%" }} />
                                    </colgroup>
                                    <thead className="text-left bg-white">
                                    <tr className="w-full">
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">사용자 이름</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">배출일자</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">수거함 이름</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">배출정보</th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>

                            {/* 스크롤 가능한 본문 테이블 */}
                            <div className="h-[300px] max-h-[300px] overflow-auto scrollbar-container">
                                <table className="w-full table-fixed border-collapse">
                                    <colgroup>
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "30%" }} />
                                    </colgroup>
                                    <tbody>
                                    {isLogLoading ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                로그 데이터 로딩 중...
                                            </td>
                                        </tr>
                                    ) : filteredLogData.length > 0 ? (
                                        filteredLogData.map((log) => (
                                            <tr key={log.log_id} className="hover:bg-blue-50">
                                                <td className="py-4 px-6 text-sm text-gray-500">{log.userId || "-"}</td>
                                                <td className="py-4 px-6 text-sm text-gray-500">{formatDate(log.date)}</td>
                                                <td className="py-4 px-6 text-sm text-gray-500">{getBoxName(log.boxId)}</td>
                                                <td className="py-4 px-6 text-sm text-gray-500 flex justify-between items-center">
                                                    <span>{log.value ? `${log.value}개` : "-"}</span>
                                                    <button
                                                        onClick={() => handleViewDetails(log)}
                                                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium transition-colors"
                                                    >
                                                        자세히 보기
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                검색 결과가 없습니다
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 px-6 py-4 bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="w-full">
                                {/* 고정된 헤더 테이블 */}
                                <table className="w-full table-fixed border-b border-gray-200">
                                    <colgroup>
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "30%" }} />
                                    </colgroup>
                                    <thead className="text-left bg-white">
                                    <tr className="w-full">
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">사용자 이름</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">수거일자</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">수거함 이름</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">수거정보</th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>

                            {/* 스크롤 가능한 본문 테이블 */}
                            <div className="h-[300px] max-h-[300px] overflow-auto scrollbar-container">
                                <table className="w-full table-fixed border-collapse">
                                    <colgroup>
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "30%" }} />
                                    </colgroup>
                                    <tbody>
                                    {isLogLoading ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                로그 데이터 로딩 중...
                                            </td>
                                        </tr>
                                    ) : filteredLogData.length > 0 ? (
                                        filteredLogData.map((log) => (
                                            <tr key={log.log_id} className="hover:bg-blue-50">
                                                <td className="py-4 px-6 text-sm text-gray-500">{log.userId || "-"}</td>
                                                <td className="py-4 px-6 text-sm text-gray-500">{formatDate(log.date)}</td>
                                                <td className="py-4 px-6 text-sm text-gray-500">{getBoxName(log.boxId)}</td>
                                                <td className="py-4 px-6 text-sm text-gray-500 flex justify-between items-center">
                                                    <span>{log.value ? `${log.value}개` : "-"}</span>
                                                    <button
                                                        onClick={() => handleViewDetails(log)}
                                                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium transition-colors"
                                                    >
                                                        자세히 보기
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                검색 결과가 없습니다
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
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
                    <div className="pb-32" />
                </div>
            </div>
            {/* 이미지 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold">{modalTitle}</h3>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false)
                                    setModalImages(null)
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-auto flex-1">
                            {modalLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : !modalImages ? (
                                <div className="text-center py-12 text-gray-500">이미지를 불러올 수 없습니다.</div>
                            ) : modalTitle === "수거 이미지" ? (
                                <div className="flex justify-center">
                                    <img
                                        src={modalImages.collection || "/placeholder.svg"}
                                        alt="수거 이미지"
                                        className="max-w-full max-h-[60vh] object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.entries(modalImages).map(([key, url]) => (
                                        <div key={key} className="flex flex-col items-center">
                                            <img
                                                src={url || "/placeholder.svg"}
                                                alt={key}
                                                className="max-w-full h-auto object-contain border rounded-lg"
                                            />
                                            <p className="mt-2 text-sm font-medium text-center">
                                                {key === "battery"
                                                    ? "배터리"
                                                    : key === "discharged"
                                                        ? "방전 배터리"
                                                        : key === "notDischarged"
                                                            ? "미방전 배터리"
                                                            : key}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function BoxListItem({ id, name, location, box, isActive, onClick, handleCopy, copiedBoxId, addressMap }) {
    // 주소 정보 가져오기
    const address = addressMap[id] || "주소 변환 중..."

    // 최대 수거량 계산
    const maxVolume = getMaxVolume(box)

    return (
        <div
            className={`p-4 border-b flex justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div className="flex items-start">
                <div>
                    <h3 className="text-base text-[#21262B] font-bold pb-2">{name}</h3>
                    <p className="text-sm font-normal text-[#60697E]">{address}</p>
                    <p className="text-sm font-normal text-[#60697E]">수거량: {maxVolume}%</p>
                </div>
            </div>
            <div className="text-gray-400 self-start relative">
                <button onClick={(e) => handleCopy(e, id, name)}>
                    <img src={CopyIcon || "/placeholder.svg?height=16&width=16"} alt="복사" width={16} height={16} />
                </button>
                {copiedBoxId === id && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                        ✓
                    </div>
                )}
            </div>
        </div>
    )
}

// Radio button component
function RadioButton({ selected, color = "green", onClick, disabled = false }) {
    // Map color prop to actual Tailwind classes
    const getColorClass = () => {
        switch (color) {
            case "green":
                return "bg-[#6DDFC0]"
            case "red":
                return "bg-[#FF7571]"
            default:
                return "bg-[#FF7571]"
        }
    }

    return (
        <div
            className={`relative w-5 h-5 rounded-full ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onClick={disabled ? undefined : onClick}
        >
            {selected ? (
                <div className="w-full h-full rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <div className={`w-[14px] h-[14px] rounded-full ${getColorClass()}`}></div>
                </div>
            ) : (
                <div className="w-full h-full rounded-full border-2 border-gray-300"></div>
            )}
        </div>
    )
}

export default N_boxControlLogPage