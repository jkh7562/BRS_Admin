import { useState, useEffect, useRef } from "react"
import { Map, MapMarker } from "react-kakao-maps-sdk"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import Sample from "../../assets/Sample.png"
import DownIcon from "../../assets/Down.png"
import Expansion from "../../assets/Expansion.png"
import FireIcon from "../../assets/아이콘 화재감지.svg"
import {
    fetchUnresolvedAlarms,
    findAllBox,
    findUserAll,
    requestFireConfirmed,
    getFireImage,
} from "../../api/apiServices"

export default function FireMonitoring() {
    // 검색어 상태 추가
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedOption, setSelectedOption] = useState("전체")
    const [isOpen, setIsOpen] = useState(false)
    const [showModal, setShowModal] = useState(false)
    // 복사된 사용자 ID 상태 추가
    const [copiedId, setCopiedId] = useState(null)
    // 선택된 사용자 상태 추가
    const [selectedUser, setSelectedUser] = useState(null)
    // 알람 데이터 상태
    const [alarms, setAlarms] = useState([])
    // 사용자 데이터 상태
    const [users, setUsers] = useState({})
    // 수거함 데이터 상태
    const [boxes, setBoxes] = useState({})
    // 주소 데이터 상태
    const [addressMap, setAddressMap] = useState({})
    // 로딩 상태
    const [isLoading, setIsLoading] = useState(false)
    // 지도 관련 상태
    const [kakaoMap, setKakaoMap] = useState(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const mapContainerRef = useRef(null)
    const geocoderRef = useRef(null)
    // 화재 이미지 관련 상태 추가
    const [fireImageUrl, setFireImageUrl] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)

    const options = ["전체", "화재 발생", "화재처리 진행", "화재처리 완료", "화재처리 확정"]

    // 상태 매핑
    const statusMap = {
        FIRE: "화재 발생",
        FIRE_IN_PROGRESS: "화재처리 진행",
        FIRE_COMPLETED: "화재처리 완료",
        FIRE_CONFIRMED: "화재처리 확정",
    }

    // 지오코더 초기화
    useEffect(() => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            geocoderRef.current = new window.kakao.maps.services.Geocoder()
        }
    }, [])

    // 알람 타입을 한글 상태로 변환하는 함수
    const getStatusFromType = (type) => {
        return statusMap[type] || type
    }

    // 사용자 데이터 로드
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const userData = await findUserAll()
                // 사용자 ID를 키로 하는 객체로 변환
                const userMap = {}
                userData.forEach((user) => {
                    userMap[user.id] = user
                })
                setUsers(userMap)
            } catch (error) {
                console.error("사용자 데이터 로딩 실패:", error)
            }
        }

        loadUsers()
    }, [])

    // 수거함 데이터 로드
    useEffect(() => {
        const loadBoxes = async () => {
            try {
                const boxData = await findAllBox()
                // 수거함 ID를 키로 하는 객체로 변환
                const boxMap = {}
                boxData.forEach((box) => {
                    // box 객체가 있는 경우와 없는 경우 모두 처리
                    const boxInfo = box.box || box
                    boxMap[boxInfo.id] = boxInfo
                })
                setBoxes(boxMap)
            } catch (error) {
                console.error("수거함 데이터 로딩 실패:", error)
            }
        }

        loadBoxes()
    }, [])

    // 좌표 파싱 함수
    const parseCoordinates = (location) => {
        if (!location) return 0

        const coordsMatch = location.match(/POINT\s*$$\s*([-\d.]+)\s+([-\d.]+)\s*$$/)
        if (coordsMatch) {
            return {
                lng: Number.parseFloat(coordsMatch[1]),
                lat: Number.parseFloat(coordsMatch[2]),
            }
        }

        return 0 // 기본값
    }

    // 좌표를 주소로 변환하는 함수
    const convertCoordsToAddress = async (boxId, lng, lat) => {
        if (!geocoderRef.current) return null

        return new Promise((resolve) => {
            geocoderRef.current.coord2Address(lng, lat, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK && result[0]) {
                    const address = result[0].road_address || result[0].address
                    if (address) {
                        // 주소 정보 추출
                        const rawRegion = address.region_1depth_name || ""
                        const rawCity = address.region_2depth_name || ""
                        const roadAddress = result[0].road_address ? result[0].road_address.address_name : ""
                        const jibunAddress = result[0].address ? result[0].address.address_name : ""

                        // 도로명 주소가 있으면 도로명 주소를, 없으면 지번 주소를 사용
                        const fullAddress = roadAddress || jibunAddress

                        setAddressMap((prev) => ({
                            ...prev,
                            [boxId]: {
                                fullAddress: fullAddress,
                                region: rawRegion,
                                city: rawCity,
                                roadAddress: roadAddress,
                                jibunAddress: jibunAddress,
                            },
                        }))
                        resolve(address)
                    } else {
                        resolve(null)
                    }
                } else {
                    resolve(null)
                }
            })
        })
    }

    // 수거함 좌표를 주소로 변환
    useEffect(() => {
        const fetchAddresses = async () => {
            // 수거함 데이터가 없거나 지오코더가 없으면 실행하지 않음
            if (Object.keys(boxes).length === 0 || !geocoderRef.current) return

            // 주소 변환이 필요한 수거함 필터링
            const boxesNeedingAddress = Object.values(boxes).filter((box) => box && box.location && !addressMap[box.id])

            // 배치 처리 (5개씩)
            const batchSize = 5
            for (let i = 0; i < boxesNeedingAddress.length; i += batchSize) {
                const batch = boxesNeedingAddress.slice(i, i + batchSize)

                // 병렬 처리
                await Promise.all(
                    batch.map(async (box) => {
                        const coords = parseCoordinates(box.location)
                        if (coords !== 0 && coords.lat && coords.lng) {
                            // 기본값이 아닌 경우만 처리
                            await convertCoordsToAddress(box.id, coords.lng, coords.lat)
                        }
                    }),
                )
            }
        }

        fetchAddresses()
    }, [boxes])

    // API에서 알람 데이터 가져오기
    useEffect(() => {
        const loadAlarms = async () => {
            try {
                setIsLoading(true)
                const alarmsData = await fetchUnresolvedAlarms()

                // 화재 관련 알람만 필터링
                const fireAlarms = alarmsData.filter(
                    (alarm) =>
                        alarm.type === "FIRE" ||
                        alarm.type === "FIRE_IN_PROGRESS" ||
                        alarm.type === "FIRE_COMPLETED" ||
                        alarm.type === "FIRE_CONFIRMED",
                )

                // 알람 데이터 로드 후 처리
                setAlarms(fireAlarms)

                // 첫 번째 알람을 기본 선택
                if (fireAlarms.length > 0) {
                    setSelectedUser(fireAlarms[0])
                }
            } catch (error) {
                console.error("알람 데이터 로딩 실패:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadAlarms()
    }, [])

    // 화재 이미지 로드 useEffect 추가
    useEffect(() => {
        const loadFireImage = async () => {
            // Reset image URL
            setFireImageUrl(null)

            // Only fetch image for FIRE_COMPLETED or FIRE_CONFIRMED status
            if (
                selectedUser &&
                selectedUser.id &&
                (selectedUser.type === "FIRE_COMPLETED" || selectedUser.type === "FIRE_CONFIRMED")
            ) {
                try {
                    setImageLoading(true)
                    // Use the getFireImage API to fetch the image URL
                    const imageUrl = await getFireImage(selectedUser.id)
                    setFireImageUrl(imageUrl)
                } catch (error) {
                    console.log(`알람 ID ${selectedUser.id}에 대한 화재 이미지를 불러올 수 없습니다.`)
                    // Set to null on error to show the Sample image
                    setFireImageUrl(null)
                } finally {
                    setImageLoading(false)
                }
            }
        }

        loadFireImage()

        // Clean up the image URL when component unmounts or selectedUser changes
        return () => {
            if (fireImageUrl) {
                URL.revokeObjectURL(fireImageUrl)
            }
        }
    }, [selectedUser])

    // 복사 핸들러 함수 추가
    const handleCopy = (e, userId, text) => {
        e.stopPropagation() // 이벤트 버블링 방지

        // 수거함 이름만 추출 (괄호 앞 부분만)
        const boxNameOnly = text.split("(")[0].trim()

        try {
            // 임시 텍스트 영역 생성
            const textArea = document.createElement("textarea")
            textArea.value = boxNameOnly

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
                setCopiedId(userId)

                // 1.5초 후 상태 초기화
                setTimeout(() => {
                    setCopiedId(null)
                }, 1500)
            } else {
                console.error("execCommand 복사 실패")
            }
        } catch (err) {
            console.error("복사 실패:", err)
        }
    }

    // 사용자 선택 핸들러
    const handleUserSelect = (alarm) => {
        setSelectedUser(alarm)
    }

    const toggleDropdown = () => setIsOpen(!isOpen)

    const selectOption = (option) => {
        setSelectedOption(option)
        setIsOpen(false)
    }

    const openModal = () => setShowModal(true)

    const closeModal = () => setShowModal(false)

    // 지도 생성 완료 핸들러
    const handleMapCreated = (map) => {
        setKakaoMap(map)
        setMapLoaded(true)
    }

    // 검색어와 선택된 옵션에 따라 필터링된 알람 목록 계산
    const filteredAlarms = alarms.filter((alarm) => {
        // 수거함 이름과 사용자 이름으로 검색 필터링
        const box = boxes[alarm.boxId] || {}
        const user = users[alarm.userId] || {}

        const boxName = box.name || `수거함 ID: ${alarm.boxId}` || ""
        const userName = user.name || alarm.userId || ""

        // 수거함 이름 또는 사용자 이름이 검색어를 포함하는지 확인
        const nameMatch =
            boxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userName.toLowerCase().includes(searchTerm.toLowerCase())

        // 상태로 필터링 (전체 옵션이면 모든 상태 포함)
        const status = getStatusFromType(alarm.type)
        const statusMatch = selectedOption === "전체" || status === selectedOption

        return nameMatch && statusMatch
    })

    // 현재 선택된 알람의 수거함 정보
    const selectedBox = selectedUser ? boxes[selectedUser.boxId] : null

    // 현재 선택된 알람의 사용자 정보
    const selectedUserInfo = selectedUser ? users[selectedUser.userId] : null

    // 선택된 수거함의 좌표
    const coordinates = selectedBox ? parseCoordinates(selectedBox.location) : 0
    const selectedBoxCoordinates = typeof coordinates === "object" ? coordinates : { lat: 36, lng: 127 }

    // 지도 센터 업데이트 - 좌표 변경 시
    useEffect(() => {
        if (kakaoMap && selectedBoxCoordinates.lat && selectedBoxCoordinates.lng) {
            // 지도 중심 설정
            const moveLatLng = new window.kakao.maps.LatLng(selectedBoxCoordinates.lat, selectedBoxCoordinates.lng)
            kakaoMap.setCenter(moveLatLng)

            // 지도 영역 재설정 (마커가 중앙에 오도록)
            setTimeout(() => {
                kakaoMap.setCenter(moveLatLng)
            }, 100)
        }
    }, [kakaoMap, selectedBoxCoordinates])

    // 지도 컨테이너 크기 변경 감지
    useEffect(() => {
        if (!mapContainerRef.current || !kakaoMap) return

        const resizeObserver = new ResizeObserver(() => {
            kakaoMap.relayout()
            if (selectedBoxCoordinates.lat && selectedBoxCoordinates.lng) {
                const moveLatLng = new window.kakao.maps.LatLng(selectedBoxCoordinates.lat, selectedBoxCoordinates.lng)
                kakaoMap.setCenter(moveLatLng)
            }
        })

        resizeObserver.observe(mapContainerRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [kakaoMap, selectedBoxCoordinates])

    // 선택된 알람의 상태 확인
    const isCompletedOrConfirmed =
        selectedUser && (selectedUser.type === "FIRE_COMPLETED" || selectedUser.type === "FIRE_CONFIRMED")

    const isCompleted = selectedUser && selectedUser.type === "FIRE_COMPLETED"

    const handleAccept = async () => {
        if (!selectedUser || !selectedUser.id) return

        try {
            await requestFireConfirmed(selectedUser.id)
            alert("화재처리 확정 완료")

            const alarmData = await fetchUnresolvedAlarms()
            const FireAlarms = alarmData.filter((a) => a.type.startsWith("FIRE"))
            setAlarms(FireAlarms)

            const updated = FireAlarms.find((a) => a.id === selectedUser.id)
            if (updated) {
                setSelectedUser(updated)
            } else {
                setSelectedUser(FireAlarms[0] || null)
            }
        } catch (err) {
            console.error("화재처리 확정 실패:", err)
            alert("화재처리 확정 실패")
        }
    }

    return (
        <div className="flex h-[555px] bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-[386px] h-full flex flex-col border-r">
                <div className="flex items-center gap-2 mx-2 my-4 pl-3">
                    {/* 검색 입력 필드 */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="수거함 이름 검색"
                            className="w-full py-2 px-5 rounded-2xl border border-gray-300 text-sm focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg"} alt="검색" />
                        </div>
                    </div>

                    {/* 드롭다운 */}
                    <div className="relative min-w-[140px] pr-3">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center justify-between w-full py-2 px-5 rounded-2xl border border-[#7A7F8A] text-sm"
                        >
                            <span>{selectedOption}</span>
                            <img src={DownIcon || "/placeholder.svg"} alt="Down" className="w-3 h-2 ml-2" />
                        </button>

                        {isOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                                {options.map((option) => (
                                    <div
                                        key={option}
                                        className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
                                        onClick={() => selectOption(option)}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 로딩 상태 표시 */}
                {isLoading && (
                    <div className="p-4 text-center">
                        <p>알람 데이터 로딩 중...</p>
                    </div>
                )}

                {/* User list with scrollbar */}
                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    {!isLoading && filteredAlarms.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">검색 결과가 없습니다</div>
                    ) : (
                        filteredAlarms.map((alarm) => {
                            const user = users[alarm.userId] || {}
                            const box = boxes[alarm.boxId] || {}
                            const date = new Date(alarm.date)
                            const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`

                            // 수거함 이름과 사용자 이름을 조합하여 표시
                            const displayName = `${box.name || `수거함 ID: ${alarm.boxId}` || "수거함 정보 없음"} (${user.name || alarm.userId || "사용자 정보 없음"})`

                            return (
                                <UserListItem
                                    key={`alarm-${alarm.id}`}
                                    userId={`alarm-${alarm.id}`}
                                    name={displayName}
                                    status={getStatusFromType(alarm.type)}
                                    date={formattedDate}
                                    isActive={selectedUser && selectedUser.id === alarm.id}
                                    onClick={() => handleUserSelect(alarm)}
                                    handleCopy={handleCopy}
                                    copiedId={copiedId}
                                />
                            )
                        })
                    )}
                </div>
            </div>

            {/* Center Section - Map View */}
            <div className="flex-1 relative flex flex-col">
                {/* Map title overlay */}
                {selectedUser && (
                    <div className="px-10 pt-10 bg-white">
                        <h2 className="text-2xl text-[#21262B] font-bold mb-1">
                            [{getStatusFromType(selectedUser.type)}]{" "}
                            {selectedBox ? selectedBox.name : `수거함 ID: ${selectedUser.boxId}`}
                        </h2>
                        <p className="text-[#60697E]">
                            <span className="font-bold">화재처리 주소</span>{" "}
                            <span className="font-normal">
                {selectedUser && addressMap[selectedUser.boxId] ? addressMap[selectedUser.boxId].fullAddress : ""}
              </span>
                            <span className="float-right text-sm">
                알림 일자{" "}
                                {new Date(selectedUser.date)
                                    .toLocaleDateString("ko-KR", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    })
                                    .replace(/\. /g, ".")
                                    .replace(/\.$/, "")}
              </span>
                        </p>
                    </div>
                )}

                {/* Map */}
                <div className="flex-1 w-full px-10 py-14" ref={mapContainerRef}>
                    <Map
                        center={selectedBoxCoordinates}
                        style={{ width: "100%", height: "100%" }}
                        level={3}
                        className={"border rounded-2xl"}
                        onCreate={handleMapCreated}
                        isPanto={true}
                    >
                        {selectedBox && (
                            <MapMarker
                                position={selectedBoxCoordinates}
                                image={{
                                    src: FireIcon || "/placeholder.svg",
                                    size: { width: 34, height: 40 },
                                }}
                                clickable={true}
                                onClick={() => {
                                    if (selectedUser && addressMap[selectedUser.boxId]) {
                                        const address = addressMap[selectedUser.boxId]
                                        alert(`주소: ${address.fullAddress}\n광역시/도: ${address.region}\n담당지역: ${address.city}`)
                                    } else {
                                        alert(
                                            `좌표: ${selectedBoxCoordinates.lat.toFixed(6)} / ${selectedBoxCoordinates.lng.toFixed(6)}\n주소 정보를 불러오는 중입니다.`,
                                        )
                                    }
                                }}
                            />
                        )}
                    </Map>
                </div>
            </div>

            {/* Right Sidebar - User Info */}
            {selectedUser && selectedUser.type !== "FIRE" && (
                <div className="w-[290px] h-full flex flex-col border-l p-8">
                    <div className="mb-10">
                        <h2 className="text-2xl text-[#21262B] font-bold pb-1">
                            {selectedUserInfo ? selectedUserInfo.name : selectedUser.userId}
                        </h2>
                    </div>

                    <div className="space-y-2 text-sm text-[#60697E]">
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">광역시/도</span>
                            <span className="font-nomal">
                {selectedUser && addressMap[selectedUser.boxId]
                    ? addressMap[selectedUser.boxId].region
                    : selectedUserInfo?.location1 || "정보 없음"}
              </span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">담당지역</span>
                            <span className="font-nomal">
                {selectedUser && addressMap[selectedUser.boxId]
                    ? addressMap[selectedUser.boxId].city
                    : selectedUserInfo?.location2 || "정보 없음"}
              </span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">상태</span>
                            <span className="font-nomal">{getStatusFromType(selectedUser.type)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">알림일자</span>
                            <span className="font-nomal">
                {new Date(selectedUser.date)
                    .toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    })
                    .replace(/\. /g, ".")
                    .replace(/\.$/, "")}
              </span>
                        </div>
                    </div>

                    {/* 사진은 FIRE_COMPLETED 또는 FIRE_CONFIRMED 상태일 때만 표시 */}
                    {isCompletedOrConfirmed && (
                        <div className="relative inline-block">
                            {imageLoading ? (
                                <div className="w-[234px] h-[189px] rounded-2xl mt-7 bg-gray-200 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <img
                                    src={fireImageUrl || selectedUser.file || Sample || "/placeholder.svg"}
                                    alt="화재 사진"
                                    width="234px"
                                    height="189px"
                                    className="rounded-2xl mt-7 cursor-pointer object-cover"
                                    onClick={openModal}
                                />
                            )}
                            <img
                                src={Expansion || "/placeholder.svg"}
                                alt="확대"
                                width="20px"
                                height="20px"
                                className="absolute bottom-4 right-4 cursor-pointer"
                                onClick={openModal}
                            />
                        </div>
                    )}

                    {/* 수락/거절 버튼은 FIRE_COMPLETED 상태일 때만 표시 */}
                    {isCompleted && (
                        <span className="mt-2 flex gap-2">
              <button className="bg-[#21262B] text-white rounded-2xl py-2 px-14" onClick={handleAccept}>
                수락
              </button>
              <button className="bg-[#FF7571] text-white rounded-2xl py-2 px-6">거절</button>
            </span>
                    )}
                </div>
            )}

            {showModal && selectedUser && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={fireImageUrl || selectedUser.file || Sample || "/placeholder.svg"}
                            alt="화재 사진 확대"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
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

function UserListItem({ userId, name, status, date, isActive, onClick, handleCopy, copiedId }) {
    return (
        <div
            className={`p-4 border-b flex justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div className="flex items-start">
                <div>
                    <h3 className="text-base text-[#21262B] font-bold">{name}</h3>
                    <p className="text-sm font-normal text-[#60697E] mt-1">{status}</p>
                    <p className="text-sm font-normal text-[#60697E]">{date}</p>
                </div>
            </div>
            <div className="text-gray-400 self-start relative">
                <button onClick={(e) => handleCopy(e, userId, name)}>
                    <img src={CopyIcon || "/placeholder.svg"} alt="복사" width={16} height={16} />
                </button>
                {copiedId === userId && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                        ✓
                    </div>
                )}
            </div>
        </div>
    )
}

function InfoItem({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-[#21262B] font-bold">{label}</span>
            <span className="font-nomal">{value}</span>
        </div>
    )
}