import { useState, useEffect, useRef } from "react"
import { Map, MapMarker } from "react-kakao-maps-sdk"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import Sample from "../../assets/Sample.png"
import DownIcon from "../../assets/Down.png"
import Expansion from "../../assets/Expansion.png"
import GreenIcon from "../../assets/아이콘 GREEN.png"
import {
    getUserUnresolvedAlarms,
    findAllBox,
    findUserAll,
    requestCollectionConfirmed,
    getCollectionImage,
} from "../../api/apiServices"

const typeToStatusMap = {
    COLLECTION_NEEDED: "수거 필요",
    COLLECTION_RECOMMENDED: "수거 권장",
    COLLECTION_IN_PROGRESS: "수거 진행중",
    COLLECTION_COMPLETED: "수거 완료",
    COLLECTION_CONFIRMED: "수거 확정",
}

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
    경남: "경상남도",
    제주: "제주특별자치도",
    // 특별자치도
    제주도: "제주특별자치도",
    세종시: "세종특별자치시",
}

// 지역 및 도시 데이터
const regionData = {
    "광역시/도": [], // 전체 선택 옵션
    서울특별시: ["강남구", "서초구", "송파구", "강동구", "마포구", "용산구", "종로구", "중구", "성동구", "광진구"],
    부산광역시: ["해운대구", "수영구", "남구", "동구", "서구", "북구", "사상구", "사하구", "사하구", "연제구", "영도구"],
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

export default function CollectMonitoring({ selectedRegion = "광역시/도", selectedCity = "시/군/구" }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedOption, setSelectedOption] = useState("전체")
    const [isOpen, setIsOpen] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [copiedId, setCopiedId] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)
    const [collectionImageUrl, setCollectionImageUrl] = useState(null)

    const [alarms, setAlarms] = useState([])
    const [users, setUsers] = useState({})
    const [boxes, setBoxes] = useState({})
    const [addressMap, setAddressMap] = useState({})

    const [kakaoMap, setKakaoMap] = useState(null)
    const mapContainerRef = useRef(null)
    const geocoderRef = useRef(null)

    const options = ["전체", "수거 권장", "수거 필요", "수거 진행중", "수거 완료", "수거 확정"]

    const isSimpleStatus = (type) => type === "COLLECTION_RECOMMENDED" || type === "COLLECTION_NEEDED"

    useEffect(() => {
        if (window.kakao?.maps?.services) {
            geocoderRef.current = new window.kakao.maps.services.Geocoder()
        }
    }, [])

    const parseCoordinates = (location) => {
        if (!location) return null
        const match = location.match(/POINT\s*\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)/)
        if (!match) return null
        return { lng: Number.parseFloat(match[1]), lat: Number.parseFloat(match[2]) }
    }

    const convertCoordsToAddress = async (boxId, lng, lat) => {
        if (!geocoderRef.current) return
        return new Promise((resolve) => {
            geocoderRef.current.coord2Address(lng, lat, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK && result[0]) {
                    const address = result[0].road_address || result[0].address
                    if (address) {
                        // 지역명 정규화
                        const rawRegion = address.region_1depth_name || ""
                        const rawCity = address.region_2depth_name || ""
                        const region = normalizeRegionName(rawRegion)

                        setAddressMap((prev) => ({
                            ...prev,
                            [boxId]: {
                                fullAddress: address.address_name,
                                region: region,
                                city: rawCity,
                            },
                        }))
                    }
                }
                resolve()
            })
        })
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [alarmData, userData, boxData] = await Promise.all([
                    getUserUnresolvedAlarms(),
                    findUserAll(),
                    findAllBox(),
                ])

                const userMap = {}
                userData.forEach((u) => (userMap[u.id] = u))
                setUsers(userMap)

                const boxMap = {}
                boxData.forEach((b) => {
                    const box = b.box || b
                    boxMap[box.id] = box
                })
                setBoxes(boxMap)

                const collectionAlarms = alarmData.filter((a) => a.type.startsWith("COLLECTION_"))
                setAlarms(collectionAlarms)

                if (collectionAlarms.length > 0) setSelectedUser(collectionAlarms[0])
            } catch (err) {
                console.error("데이터 로딩 실패:", err)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        const fetchAddressMap = async () => {
            const pending = Object.values(boxes).filter((b) => b.location && !addressMap[b.id])
            const batchSize = 5

            for (let i = 0; i < pending.length; i += batchSize) {
                const batch = pending.slice(i, i + batchSize)
                await Promise.all(
                    batch.map((box) => {
                        const coord = parseCoordinates(box.location)
                        if (coord && coord.lat && coord.lng) {
                            return convertCoordsToAddress(box.id, coord.lng, coord.lat)
                        }
                    }),
                )
            }
        }

        if (Object.keys(boxes).length > 0 && geocoderRef.current) {
            fetchAddressMap()
        }
    }, [boxes])

    // 수거 이미지 로드 useEffect 추가
    useEffect(() => {
        const loadCollectionImage = async () => {
            console.log("=== 수거 이미지 로딩 시작 ===")
            console.log("selectedUser:", selectedUser)

            // 이전 이미지 URL 정리
            if (collectionImageUrl && collectionImageUrl.startsWith("blob:")) {
                console.log("🗑️ 이전 이미지 URL 해제:", collectionImageUrl)
                URL.revokeObjectURL(collectionImageUrl)
            }

            // 이미지 URL 초기화
            setCollectionImageUrl(null)

            // 선택된 사용자가 있고, COLLECTION_COMPLETED 또는 COLLECTION_CONFIRMED 상태이며, box_log_id가 있는 경우에만 이미지 로드
            if (
                selectedUser &&
                selectedUser.boxLogId &&
                (selectedUser.type === "COLLECTION_COMPLETED" || selectedUser.type === "COLLECTION_CONFIRMED")
            ) {
                try {
                    setImageLoading(true)
                    console.log(`📡 getCollectionImage API 호출: ${selectedUser.boxLogId}`)

                    // getCollectionImage API 호출
                    const imageUrl = await getCollectionImage(selectedUser.boxLogId)
                    console.log(`✅ getCollectionImage API 응답:`, imageUrl)

                    setCollectionImageUrl(imageUrl)
                } catch (error) {
                    console.error("❌ 수거 이미지 로딩 실패:", error)
                    setCollectionImageUrl(null)
                } finally {
                    setImageLoading(false)
                }
            } else {
                console.log("🚫 수거 이미지 로딩 조건 불만족")
            }
        }

        loadCollectionImage()

        // 컴포넌트 언마운트 시 이미지 URL 리소스 해제
        return () => {
            if (collectionImageUrl && collectionImageUrl.startsWith("blob:")) {
                console.log("🗑️ useEffect cleanup - 이미지 URL 리소스 해제:", collectionImageUrl)
                URL.revokeObjectURL(collectionImageUrl)
            }
        }
    }, [selectedUser])

    const handleCopy = (e, userId, text) => {
        e.stopPropagation()

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

    const filteredAlarms = alarms.filter((alarm) => {
        const user = users[alarm.userId] || {}
        const box = boxes[alarm.boxId] || {}

        // 사용자 이름과 수거함 이름 모두로 검색
        const userName = user.name || alarm.userId || ""
        const boxName = box.name || `수거함 ID: ${alarm.boxId}` || ""

        // 사용자 이름 또는 수거함 이름이 검색어를 포함하는지 확인
        const nameMatch =
            userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            boxName.toLowerCase().includes(searchTerm.toLowerCase())

        const status = typeToStatusMap[alarm.type] || alarm.type
        const statusMatch = selectedOption === "전체" || selectedOption === status
        const regionMatch = matchesRegionFilter(alarm.boxId)

        // 단순 상태(COLLECTION_RECOMMENDED, COLLECTION_NEEDED)인 경우에도
        // 이름 검색을 적용하도록 수정
        return nameMatch && statusMatch && regionMatch
    })

    const selectedBox = selectedUser ? boxes[selectedUser.boxId] : null
    const selectedUserInfo = selectedUser ? users[selectedUser.userId] : null
    const coordinates = selectedBox ? parseCoordinates(selectedBox.location) : null
    const selectedCoords = coordinates || { lat: 36.8082, lng: 127.009 }
    const selectedAddress = selectedUser && addressMap[selectedUser.boxId]?.fullAddress

    const isCompletedOrConfirmed =
        selectedUser && (selectedUser.type === "COLLECTION_COMPLETED" || selectedUser.type === "COLLECTION_CONFIRMED")
    const isCompleted = selectedUser && selectedUser.type === "COLLECTION_COMPLETED"
    const showRightPanel = selectedUser && !isSimpleStatus(selectedUser.type)

    useEffect(() => {
        if (!kakaoMap || !coordinates) return

        const center = new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng)
        kakaoMap.setCenter(center)

        setTimeout(() => {
            kakaoMap.relayout()
            kakaoMap.setCenter(center)
        }, 150)
    }, [coordinates])

    const handleAccept = async () => {
        if (!selectedUser || !selectedUser.id) return

        try {
            await requestCollectionConfirmed(selectedUser.id)
            alert("수거 확정 완료")

            const alarmData = await getUserUnresolvedAlarms()
            const collectionAlarms = alarmData.filter((a) => a.type.startsWith("COLLECTION_"))
            setAlarms(collectionAlarms)

            const updated = collectionAlarms.find((a) => a.id === selectedUser.id)
            if (updated) {
                setSelectedUser(updated)
            } else {
                setSelectedUser(collectionAlarms[0] || null)
            }
        } catch (err) {
            console.error("수거 확정 실패:", err)
            alert("수거 확정 실패")
        }
    }

    return (
        <div className="flex h-[555px] bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="w-[386px] h-full flex flex-col border-r">
                <div className="flex items-center gap-2 mx-2 my-4 pl-3">
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

                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    {filteredAlarms.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">검색 결과가 없습니다</div>
                    ) : (
                        filteredAlarms.map((alarm) => {
                            const user = users[alarm.userId] || {}
                            const box = boxes[alarm.boxId] || {}
                            const status = typeToStatusMap[alarm.type] || alarm.type
                            const date = new Date(alarm.date).toLocaleDateString("ko-KR").replace(/\. /g, ".").replace(/\.$/, "")

                            // 수거함 이름과 사용자 이름을 조합하여 표시
                            const displayName = `${box.name || "수거함 정보 없음"} (${user.name || alarm.userId || "사용자 정보 없음"})`

                            return (
                                <UserListItem
                                    key={alarm.id}
                                    userId={alarm.id}
                                    name={displayName}
                                    status={status}
                                    date={date}
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
            <div className="flex-1 relative flex flex-col">
                {selectedUser && (
                    <div className="px-10 pt-10 bg-white">
                        <h2 className="text-2xl text-[#21262B] font-bold mb-1">
                            [{typeToStatusMap[selectedUser.type]}] {selectedBox?.name || `수거함 ID: ${selectedUser.boxId}`}
                        </h2>
                        <p className="text-[#60697E]">
                            <span className="font-bold">수거 주소</span>{" "}
                            <span className="font-normal">{selectedAddress || "주소 변환 중..."}</span>
                            <span className="float-right text-sm">
                알림 일자{" "}
                                {new Date(selectedUser.date).toLocaleDateString("ko-KR").replace(/\. /g, ".").replace(/\.$/, "")}
              </span>
                        </p>
                    </div>
                )}
                <div className="flex-1 w-full px-10 py-14" ref={mapContainerRef}>
                    <Map
                        center={selectedCoords}
                        style={{ width: "100%", height: "100%" }}
                        level={3}
                        className="border rounded-2xl"
                        onCreate={(map) => setKakaoMap(map)}
                    >
                        {coordinates && (
                            <MapMarker position={coordinates} image={{ src: GreenIcon, size: { width: 34, height: 40 } }} />
                        )}
                    </Map>
                </div>
            </div>
            {showRightPanel && (
                <div className="w-[290px] h-full flex flex-col border-l p-8">
                    <div className="mb-10">
                        <h2 className="text-2xl text-[#21262B] font-bold pb-1">{selectedUserInfo?.name || selectedUser.userId}</h2>
                    </div>
                    <div className="space-y-2 text-sm text-[#60697E]">
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">광역시/도</span>
                            <span>{addressMap[selectedUser.boxId]?.region || "정보 없음"}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">담당지역</span>
                            <span>{addressMap[selectedUser.boxId]?.city || "정보 없음"}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">상태</span>
                            <span>{typeToStatusMap[selectedUser.type]}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">알림일자</span>
                            <span>
                {new Date(selectedUser.date).toLocaleDateString("ko-KR").replace(/\. /g, ".").replace(/\.$/, "")}
              </span>
                        </div>
                    </div>
                    {isCompletedOrConfirmed && (
                        <div className="relative inline-block mt-7">
                            {imageLoading ? (
                                <div className="w-[234px] h-[189px] rounded-2xl bg-gray-200 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <div
                                    className="w-[234px] h-[189px] rounded-2xl overflow-hidden relative cursor-pointer"
                                    onClick={openModal}
                                >
                                    <img
                                        src={collectionImageUrl || selectedUser.file || Sample || "/placeholder.svg"}
                                        alt="수거 사진"
                                        className="w-full h-full object-cover"
                                    />
                                    <img
                                        src={Expansion || "/placeholder.svg"}
                                        alt="확대"
                                        className="absolute bottom-4 right-4 cursor-pointer"
                                        width="20px"
                                        height="20px"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            openModal()
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    {isCompleted && (
                        <button className="bg-[#21262B] text-white rounded-2xl py-2 w-full mt-2" onClick={handleAccept}>
                            확인
                        </button>
                    )}
                </div>
            )}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={collectionImageUrl || selectedUser.file || Sample || "/placeholder.svg"}
                            alt="수거 사진 확대"
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                        <button
                            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all"
                            onClick={closeModal}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

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
            <div>
                <h3 className="text-base text-[#21262B] font-bold">{name}</h3>
                <p className="text-sm text-[#60697E] mt-1">{status}</p>
                <p className="text-sm text-[#60697E]">{date}</p>
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