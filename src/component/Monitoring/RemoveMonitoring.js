import { useState, useEffect, useRef } from "react"
import { Map, MapMarker } from "react-kakao-maps-sdk"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import Sample from "../../assets/Sample.png"
import DownIcon from "../../assets/Down.png"
import Expansion from "../../assets/Expansion.png"
import RedIcon from "../../assets/아이콘 RED.png"
import { fetchUnresolvedAlarms, findAllBox, findUserAll, requestRemoveConfirmed } from "../../api/apiServices"

export default function RemoveMonitoring({ selectedRegion = "광역시/도", selectedCity = "시/군/구" }) {
    // 지역명 정규화를 위한 매핑 테이블
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
        경남: "제주특별자치도",
        // 특별자치도
        제주도: "제주특별자치도",
        세종시: "세종특별자치시",
    }

    // 지역 및 도시 데이터
    const regionData = {
        "광역시/도": [], // 전체 선택 옵션
        서울특별시: ["강남구", "서초구", "송파구", "강동구", "마포구", "용산구", "종로구", "중구", "성동구", "광진구"],
        부산광역시: [
            "해운대구",
            "수영구",
            "남구",
            "동구",
            "서구",
            "북구",
            "사상구",
            "사하구",
            "사하구",
            "연제구",
            "영도구",
        ],
        인천광역시: ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"],
        대구광역시: ["중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군"],
        광주광역시: ["동구", "서구", "남구", "북구", "광산구"],
        대전광역시: ["동구", "중구", "서구", "유성구", "대덕구"],
        울산광역시: ["중구", "남구", "동구", "북구", "울주군"],
        세종특별자치시: ["세종시"],
        경기도: ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시", "평택시"],
        강원도: ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군", "영월군"],
        충청북도: ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "진천군", "괴산군", "음성군", "단양군"],
        충청남도: ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군"],
        전라북도: ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군"],
        전라남도: ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군"],
        경상북도: ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시"],
        경상남도: ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군"],
        제주특별자치도: ["제주시", "서귀포시"],
    }

    // 지역명 정규화 함수
    const normalizeRegionName = (regionName) => {
        if (!regionName) return ""

        // 정확히 일치하는 경우 그대로 반환
        if (Object.keys(regionData).includes(regionName)) {
            return regionName
        }

        // 매핑 테이블에서 찾기
        if (regionNormalizationMap[regionName]) {
            return regionNormalizationMap[regionName]
        }

        // 부분 일치 검색
        for (const standardRegion of Object.keys(regionData)) {
            if (regionName.includes(standardRegion) || standardRegion.includes(regionName)) {
                return standardRegion
            }
        }

        console.warn(`정규화할 수 없는 지역명: ${regionName}`)
        return regionName
    }

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
    // 지오코더 참조
    const geocoderRef = useRef(null)
    // 지도 참조 추가
    const mapRef = useRef(null)
    // 지도 인스턴스 상태 추가
    const [kakaoMap, setKakaoMap] = useState(null)
    // 지도 로드 상태
    const [mapLoaded, setMapLoaded] = useState(false)

    const options = ["전체", "제거요청", "제거 진행중", "제거 완료", "제거 확정"]

    // 지오코더 초기화
    useEffect(() => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            geocoderRef.current = new window.kakao.maps.services.Geocoder()
        }
    }, [])

    // 알람 타입을 한글 상태로 변환하는 함수
    const getStatusFromType = (type) => {
        const statusMap = {
            REMOVE_REQUEST: "제거요청",
            REMOVE_IN_PROGRESS: "제거 진행중",
            REMOVE_COMPLETED: "제거 완료",
            REMOVE_CONFIRMED: "제거 확정",
        }
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

        const coordsMatch = location.match(/POINT\s*\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)/)
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

                        // 지역명 정규화
                        const region = normalizeRegionName(rawRegion)
                        const city = rawCity

                        console.log(`주소 변환: ${rawRegion} -> ${region}, ${rawCity} -> ${city}`)

                        setAddressMap((prev) => ({
                            ...prev,
                            [boxId]: {
                                fullAddress: address.address_name,
                                region: region,
                                city: city,
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

                console.log(alarmsData)

                // 제거 관련 알람만 필터링
                const removeAlarms = alarmsData.filter(
                    (alarm) =>
                        alarm.type === "REMOVE_REQUEST" ||
                        alarm.type === "REMOVE_IN_PROGRESS" ||
                        alarm.type === "REMOVE_COMPLETED" ||
                        alarm.type === "REMOVE_CONFIRMED",
                )

                // 알람 데이터 로드 후 처리
                setAlarms(removeAlarms)

                // 첫 번째 알람을 기본 선택
                if (removeAlarms.length > 0) {
                    setSelectedUser(removeAlarms[0])
                }
            } catch (error) {
                console.error("알람 데이터 로딩 실패:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadAlarms()
    }, [])

    // 복사 핸들러 함수 추가
    const handleCopy = (e, userId, text) => {
        e.stopPropagation() // 이벤트 버블링 방지

        navigator.clipboard
            .writeText(text)
            .then(() => {
                // 복사된 항목 ID 저장
                setCopiedId(userId)

                // 1.5초 후 ���태 초기화
                setTimeout(() => {
                    setCopiedId(null)
                }, 1500)
            })
            .catch((err) => {
                console.error("복사 실패:", err)
            })
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

    // 지역 필터링 함수
    const matchesRegionFilter = (boxId) => {
        // 필터가 설정되지 않은 경우 모두 표시
        if (selectedRegion === "광역시/도") return true

        // 주소 정보가 없는 경우 표시하지 않음
        if (!addressMap[boxId]) return false

        // 정규화된 선택 지역
        const normalizedSelectedRegion = normalizeRegionName(selectedRegion)

        // 시/도 필터링
        if (addressMap[boxId].region !== normalizedSelectedRegion) {
            return false
        }

        // 시/군/구 필터링
        if (selectedCity !== "시/군/구" && addressMap[boxId].city !== selectedCity) {
            return false
        }

        return true
    }

    // 검색어와 선택된 옵션에 따라 필터링된 알람 목록 계산
    const filteredAlarms = alarms.filter((alarm) => {
        // 이름으로 검색 필터링 (userId 또는 사용자 이름)
        const user = users[alarm.userId] || {}
        const userName = user.name || alarm.userId || ""
        const nameMatch = userName.toLowerCase().includes(searchTerm.toLowerCase())

        // 상태로 필터링 (전체 옵션이면 모든 상태 포함)
        const status = getStatusFromType(alarm.type)
        const statusMatch = selectedOption === "전체" || status === selectedOption

        // 지역 필터링
        const regionMatch = matchesRegionFilter(alarm.boxId)

        return nameMatch && statusMatch && regionMatch
    })

    // 현재 선택된 알람의 수거함 정보
    const selectedBox = selectedUser ? boxes[selectedUser.boxId] : null

    // 현재 선택된 알람의 사용자 정보
    const selectedUserInfo = selectedUser ? users[selectedUser.userId] : null

    // 선택된 수거함의 좌표
    const coordinates = selectedBox ? parseCoordinates(selectedBox.location) : 0
    const selectedBoxCoordinates = typeof coordinates === "object" ? coordinates : { lat: 36.8082, lng: 127.009 }

    // 선택된 수거함의 주소 정보
    const selectedBoxAddress =
        selectedUser && addressMap[selectedUser.boxId] ? addressMap[selectedUser.boxId].fullAddress : "주소 변환 중..."

    // 지도 생성 완료 핸들러
    const handleMapCreated = (map) => {
        setKakaoMap(map)
        setMapLoaded(true)
    }

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

    // 지도 컨테이너 참조
    const mapContainerRef = useRef(null)

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
        selectedUser && (selectedUser.type === "REMOVE_COMPLETED" || selectedUser.type === "REMOVE_CONFIRMED")

    const isCompleted = selectedUser && selectedUser.type === "REMOVE_COMPLETED"

    // 수락 버튼 핸들러
    const handleAccept = async () => {
        if (selectedUser && selectedUser.boxId) {
            try {
                await requestRemoveConfirmed(selectedUser.boxId)
                console.log(selectedUser.boxId)
                alert("확정되었습니다.")
                // 성공 후 알람 데이터 다시 로드
                const alarmsData = await fetchUnresolvedAlarms()

                // 제거 관련 알람만 필터링
                const removeAlarms = alarmsData.filter(
                    (alarm) =>
                        alarm.type === "REMOVE_REQUEST" ||
                        alarm.type === "REMOVE_IN_PROGRESS" ||
                        alarm.type === "REMOVE_COMPLETED" ||
                        alarm.type === "REMOVE_CONFIRMED",
                )

                setAlarms(removeAlarms)

                // 현재 선택된 알람 업데이트
                const updatedAlarm = removeAlarms.find((alarm) => alarm.id === selectedUser.id)
                if (updatedAlarm) {
                    setSelectedUser(updatedAlarm)
                }
            } catch (error) {
                console.error("수거함 설치 확정 실패:", error)
                // 에러 처리 로직 추가 (필요시)
            }
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
                            placeholder="수거자 이름 검색"
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

                            return (
                                <UserListItem
                                    key={`alarm-${alarm.id}`}
                                    userId={`alarm-${alarm.id}`}
                                    name={user.name || alarm.userId || "사용자 정보 없음"}
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
                            <span className="font-bold">제거 주소</span> <span className="font-normal">{selectedBoxAddress}</span>
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
                                    src: RedIcon,
                                    size: { width: 34, height: 40 },
                                }}
                            />
                        )}
                    </Map>
                </div>
            </div>

            {/* Right Sidebar - User Info */}
            {selectedUser && selectedUser.type !== "REMOVE_REQUEST" && (
                <div className="w-[290px] h-full flex flex-col border-l p-8">
                    <div className="mb-10">
                        <h2 className="text-2xl text-[#21262B] font-bold pb-1">
                            {selectedUserInfo ? selectedUserInfo.name : selectedUser.userId}
                        </h2>
                        <p className="text-[#60697E]">
                            <span className="font-bold">가입일자</span>
                            <span className="ml-3 font-normal">
                {selectedUserInfo && selectedUserInfo.date
                    ? new Date(selectedUserInfo.date)
                        .toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                        })
                        .replace(/\. /g, ".")
                        .replace(/\.$/, "")
                    : "2025.02.03"}
              </span>
                        </p>
                    </div>

                    <div className="space-y-2 text-sm text-[#60697E]">
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">광역시/도</span>
                            <span className="font-nomal">
                {selectedUser && addressMap[selectedUser.boxId]
                    ? addressMap[selectedUser.boxId].region
                    : selectedUserInfo?.location1 || "충청남도"}
              </span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">담당지역</span>
                            <span className="font-nomal">
                {selectedUser && addressMap[selectedUser.boxId]
                    ? addressMap[selectedUser.boxId].city
                    : selectedUserInfo?.location2 || "아산시"}
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

                    {/* 사진은 REMOVE_COMPLETED 또는 REMOVE_CONFIRMED 상태일 때만 표시 */}
                    {isCompletedOrConfirmed && (
                        <div className="relative inline-block">
                            <img
                                src={selectedUser.file || Sample || "/placeholder.svg"}
                                alt="사진"
                                width="234px"
                                height="189px"
                                className="rounded-2xl mt-7 cursor-pointer"
                                onClick={openModal}
                            />
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

                    {/* 수락/거절 버튼은 REMOVE_COMPLETED 상태일 때만 표시 */}
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
                            src={selectedUser.file || Sample || "/placeholder.svg"}
                            alt="사진 확대"
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