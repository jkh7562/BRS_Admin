"use client"

import { useState, useEffect } from "react"
import { Map, MapMarker } from "react-kakao-maps-sdk"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import { findAllBox, fetchUnresolvedAlarms, findUserAll } from "../../api/apiServices"

export default function RemoveStatus({
                                         statuses = ["REMOVE_REQUEST", "REMOVE_IN_PROGRESS", "REMOVE_CONFIRMED", "REMOVE_COMPLETED"],
                                     }) {
    const [boxes, setBoxes] = useState([])
    const [filteredBoxes, setFilteredBoxes] = useState([])
    const [selectedBox, setSelectedBox] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [addressData, setAddressData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [alarmData, setAlarmData] = useState({})
    const [debug, setDebug] = useState({ boxCount: 0, alarmCount: 0, removeAlarmCount: 0 })

    // 박스 데이터 로드 부분
    useEffect(() => {
        const loadBoxes = async () => {
            setIsLoading(true)
            try {
                // 박스 데이터, 알람 데이터, 사용자 데이터를 병렬로 가져오기
                const [boxData, alarmData, userData] = await Promise.all([findAllBox(), fetchUnresolvedAlarms(), findUserAll()])

                console.log("Box Data:", boxData) // 디버깅용 로그
                console.log("Alarm Data:", alarmData) // 디버깅용 로그
                console.log("User Data:", userData) // 디버깅용 로그

                // 디버깅 정보 저장
                setDebug({
                    boxCount: boxData?.length || 0,
                    alarmCount: alarmData?.length || 0,
                    removeAlarmCount: alarmData?.filter((a) => a.type && a.type.startsWith("REMOVE"))?.length || 0,
                })

                // 사용자 정보 처리
                const userMap = {}
                console.log("Raw user data:", userData)
                userData.forEach((user, index) => {
                    if (user && user.id) {
                        userMap[user.id] = {
                            id: user.id,
                            name: user.name || user.id,
                            createdAt: user.date ? formatDate(user.date) : "정보 없음",
                            location: user.location || "정보 없음",
                            phoneNumber: user.phone_number || "정보 없음",
                            role: user.role || "정보 없음",
                        }
                        console.log(`User ${index} mapped:`, user.id, "->", userMap[user.id].name)
                    } else {
                        console.log(`User ${index} skipped:`, user)
                    }
                })

                // 알람 데이터 매핑
                const alarmsByBoxId = {}
                const alarmsByBoxIdForState = {} // UserListItem에서 사용할 알람 데이터

                console.log("Processing alarms for box mapping...")
                alarmData.forEach((alarm, index) => {
                    if (alarm.boxId) {
                        if (!alarmsByBoxId[alarm.boxId]) {
                            alarmsByBoxId[alarm.boxId] = []
                        }
                        alarmsByBoxId[alarm.boxId].push(alarm)

                        // UserListItem에서 사용할 알람 데이터 저장
                        // 각 박스 ID에 대해 가장 최근 알람만 저장
                        if (
                            !alarmsByBoxIdForState[alarm.boxId] ||
                            new Date(alarm.date) > new Date(alarmsByBoxIdForState[alarm.boxId].date)
                        ) {
                            alarmsByBoxIdForState[alarm.boxId] = alarm
                        }

                        console.log(`Alarm ${index} mapped to box ${alarm.boxId}, userId: ${alarm.userId}, type: ${alarm.type}`)
                    } else {
                        console.log(`Alarm ${index} has no boxId:`, alarm)
                    }
                })

                // 알람 데이터를 상태에 저장
                setAlarmData(alarmsByBoxIdForState)

                // 중요: 제거 요청이 있는 모든 박스를 포함하도록 수정
                // 이 부분이 핵심입니다 - 박스에 remove_status가 없더라도 REMOVE 알람이 있으면 포함시킵니다
                const boxesWithRemoveAlarms = new Set()
                alarmData.forEach((alarm) => {
                    if (alarm.type && alarm.type.startsWith("REMOVE")) {
                        boxesWithRemoveAlarms.add(alarm.boxId)
                    }
                })

                console.log("Boxes with REMOVE alarms:", Array.from(boxesWithRemoveAlarms))

                // 박스 매핑 부분에서 사용자 정보 처리
                const mappedBoxes = boxData
                    .map((entry) => {
                        // entry 구조 확인
                        const box = entry.box || entry
                        const id = box.id
                        const name = box.name
                        const location = box.location

                        // 중요: 상태 필드가 없는 경우를 처리합니다
                        // remove_status 또는 removeStatus 필드가 없는 경우 알람 타입에 따라 상태를 결정합니다
                        let status = box.remove_status || box.removeStatus

                        console.log(`\n--- Processing Box ${id} (${name}) ---`)
                        console.log(`Original status: ${status}`)

                        // 해당 박스의 알람 정보 가져오기
                        const boxAlarms = alarmsByBoxId[id] || []
                        console.log(`Box ${id} has ${boxAlarms.length} alarms`)

                        // 제거 관련 알람만 필터링
                        const removeAlarms = boxAlarms.filter((alarm) => alarm.type && alarm.type.startsWith("REMOVE"))
                        console.log(`Box ${id} has ${removeAlarms.length} removal alarms`)

                        // 가장 최근 알람 사용
                        const latestAlarm =
                            removeAlarms.length > 0 ? removeAlarms.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null

                        // 중요: 상태가 없지만 REMOVE 알람이 있는 경우 상태를 설정합니다
                        if (!status && latestAlarm) {
                            status = latestAlarm.type // REMOVE_REQUEST 등으로 설정
                            console.log(`Setting status from alarm: ${status}`)
                        }

                        if (latestAlarm) {
                            console.log(`Latest alarm for box ${id}:`, {
                                date: latestAlarm.date,
                                type: latestAlarm.type,
                                userId: latestAlarm.userId,
                            })
                        }

                        // 위치 파싱 (띄어쓰기 유무 상관없이 처리)
                        let lng = 0
                        let lat = 0
                        if (location) {
                            const coordsMatch = location.match(/POINT\s*\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)/)
                            if (coordsMatch) {
                                lng = Number.parseFloat(coordsMatch[1])
                                lat = Number.parseFloat(coordsMatch[2])
                                console.log(`Box ${id} coordinates: ${lat}, ${lng}`)
                            } else {
                                console.log(`Box ${id} has invalid location format:`, location)
                            }
                        } else {
                            console.log(`Box ${id} has no location data`)
                        }

                        // 사용자 정보 처리 - 알람에서 사용자 ID를 가져옴
                        let userName = "미지정"
                        let userCreatedAt = "정보 없음"
                        let userId = null

                        // 알람에서 사용자 정보를 가져오는 경우
                        if (latestAlarm && latestAlarm.userId) {
                            userId = latestAlarm.userId
                            console.log(`Box ${id} has userId ${userId} from alarm`)

                            // userMap에서 사용자 정보 조회
                            if (userMap[userId]) {
                                userName = userMap[userId].name
                                userCreatedAt = userMap[userId].createdAt
                                console.log(`Found user in userMap: ${userId} -> ${userName}`)
                            } else {
                                userName = userId
                                console.log(`User ${userId} not found in userMap, using ID as name`)
                            }
                        } else {
                            console.log(`Box ${id} has no user information from alarms`)
                        }

                        console.log(`Final user info for box ${id}: ${userName} (${userId})`)
                        console.log(`Final status: ${status}`)

                        return {
                            id,
                            name,
                            lat,
                            lng,
                            removeStatus: status,
                            createdAt: latestAlarm ? formatDate(latestAlarm.date) : "정보 없음",
                            alarmDate: latestAlarm ? formatDate(latestAlarm.date) : null,
                            alarmType: latestAlarm ? latestAlarm.type : null,
                            user: {
                                id: userId,
                                name: userName,
                                createdAt: userCreatedAt,
                            },
                            hasRemoveAlarm: removeAlarms.length > 0,
                        }
                    })
                    .filter((box) => {
                        // 중요: 필터링 로직을 수정합니다
                        // 1. 상태가 statuses 배열에 포함되어 있거나
                        // 2. REMOVE 알람이 있는 경우 포함
                        return (box.removeStatus && statuses.includes(box.removeStatus)) || box.hasRemoveAlarm
                    })

                console.log("Mapped boxes:", mappedBoxes)
                console.log("Filtered boxes count:", mappedBoxes.length)

                setBoxes(mappedBoxes)
                setFilteredBoxes(mappedBoxes)

                // 첫 번째 박스 선택
                if (mappedBoxes.length > 0) {
                    setSelectedBox(mappedBoxes[0])
                }

                // 주소 변환 시작
                loadKakaoAPI(mappedBoxes)
            } catch (error) {
                console.error("데이터 로딩 실패:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadBoxes()
    }, [statuses])

    // 검색어에 따른 필터링
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredBoxes(boxes)
        } else {
            const filtered = boxes.filter((box) => box.user.name.includes(searchTerm) || box.name.includes(searchTerm))
            setFilteredBoxes(filtered)
        }
    }, [searchTerm, boxes])

    // 카카오 API 로드 및 주소 변환 함수
    const loadKakaoAPI = (boxesData) => {
        // 이미 카카오 API가 로드되어 있는 경우
        if (window.kakao && window.kakao.maps) {
            convertAddresses(boxesData)
            return
        }

        // 카카오 API 스크립트 로드
        const script = document.createElement("script")
        script.async = true
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY || process.env.NEXT_PUBLIC_KAKAO_API_KEY || "발급받은_API_키_입력"}&libraries=services&autoload=false`

        script.onload = () => {
            window.kakao.maps.load(() => {
                convertAddresses(boxesData)
            })
        }

        document.head.appendChild(script)
    }

    // 좌표를 주소로 변환하는 함수
    const convertCoordsToAddress = (lng, lat) => {
        return new Promise((resolve) => {
            if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
                resolve({ region: "", city: "" })
                return
            }

            const geocoder = new window.kakao.maps.services.Geocoder()

            geocoder.coord2Address(lng, lat, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK && result[0]) {
                    const addressInfo = result[0]

                    // 주소 정보 추출
                    const region = addressInfo.address ? addressInfo.address.region_1depth_name || "" : ""
                    const city = addressInfo.address ? addressInfo.address.region_2depth_name || "" : ""

                    resolve({ region, city })
                } else {
                    resolve({ region: "", city: "" })
                }
            })
        })
    }

    // 모든 박스의 주소 변환 (배치 처리)
    const convertAddresses = async (boxesData) => {
        if (!window.kakao || !window.kakao.maps || boxesData.length === 0) return

        try {
            // 주소 변환 요청을 10개씩 배치 처리
            const batchSize = 10
            const addressMap = { ...addressData }

            for (let i = 0; i < boxesData.length; i += batchSize) {
                const batch = boxesData.slice(i, i + batchSize)
                const promises = batch.map(async (box) => {
                    if (box.lat && box.lng) {
                        const address = await convertCoordsToAddress(box.lng, box.lat)
                        return { id: box.id, address }
                    }
                    return { id: box.id, address: { region: "", city: "" } }
                })

                const results = await Promise.all(promises)

                results.forEach((result) => {
                    if (result) {
                        addressMap[result.id] = result.address
                    }
                })

                // 각 배치 후 상태 업데이트
                setAddressData(addressMap)

                // 너무 빠른 요청으로 인한 API 제한 방지를 위한 지연
                if (i + batchSize < boxesData.length) {
                    await new Promise((resolve) => setTimeout(resolve, 300))
                }
            }
        } catch (error) {
            console.error("주소 변환 중 오류 발생:", error)
        }
    }

    // 날짜 포맷 함수
    const formatDate = (dateString) => {
        if (!dateString) return "정보 없음"

        try {
            const date = new Date(dateString)
            return date
                .toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                })
                .replace(/\. /g, ".")
                .replace(/\.$/, "")
        } catch (e) {
            return "정보 없음"
        }
    }

    // 제거 상태 한글 변환
    const getStatusText = (status) => {
        const statusMap = {
            REMOVE_REQUEST: "제거 요청",
            REMOVE_IN_PROGRESS: "제거 진행중",
            REMOVE_CONFIRMED: "제거 확인",
            REMOVE_COMPLETED: "제거 완료",
        }
        return statusMap[status] || status
    }

    // 좌표 복사 함수
    const copyCoordinates = () => {
        if (selectedBox) {
            const coordText = `${selectedBox.lat} / ${selectedBox.lng}`
            navigator.clipboard
                .writeText(coordText)
                .then(() => alert("좌표가 클립보드에 복사되었습니다."))
                .catch((err) => console.error("좌표 복사 실패:", err))
        }
    }

    // 알람 타입 한글 변환
    const getAlarmTypeText = (type) => {
        const typeMap = {
            INSTALL_REQUEST: "설치 요청",
            REMOVE_REQUEST: "제거 요청",
        }
        return typeMap[type] || type
    }

    if (isLoading) {
        return (
            <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (boxes.length === 0) {
        return (
            <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden justify-center items-center">
                <div className="text-center">
                    <p className="text-xl font-bold text-gray-700">데이터가 없습니다</p>
                    <p className="text-gray-500 mt-2">해당 상태의 수거함이 없습니다.</p>
                    <p className="text-gray-500 mt-2">
                        디버그 정보: 박스 {debug.boxCount}개, 알람 {debug.alarmCount}개, 제거 알람 {debug.removeAlarmCount}개
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-[350px] h-full flex flex-col border-r">
                <div>
                    <div className="relative mx-2 my-4 p-3">
                        <input
                            type="text"
                            placeholder="수거자 이름 검색"
                            className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg"} alt="검색" />
                        </div>
                    </div>
                </div>

                {/* User list with scrollbar */}
                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    {filteredBoxes.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">검색 결과가 없습니다</div>
                    ) : (
                        filteredBoxes.map((box) => (
                            <UserListItem
                                key={box.id}
                                boxId={box.id}
                                name={box.user.name}
                                status={getStatusText(box.removeStatus || box.alarmType || "REMOVE_REQUEST")}
                                date={box.createdAt}
                                isActive={selectedBox && selectedBox.id === box.id}
                                onClick={() => setSelectedBox(box)}
                                alarmData={alarmData[box.id]}
                                formatDate={formatDate}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Center Section - Map View */}
            {selectedBox && (
                <div className="flex-1 relative flex flex-col">
                    {/* Map title overlay */}
                    <div className="p-10 pb-9 bg-white">
                        <h2 className="text-2xl text-[#21262B] font-bold mb-1">
                            [{getStatusText(selectedBox.removeStatus || selectedBox.alarmType || "REMOVE_REQUEST")}]{" "}
                            {selectedBox.name}
                        </h2>
                        <p className="text-[#60697E]">
                            <span className="font-bold">제거 좌표</span>{" "}
                            <span className="font-normal cursor-pointer hover:text-blue-500" onClick={copyCoordinates}>
                {selectedBox.lat} / {selectedBox.lng}
              </span>
                            <span className="float-right text-sm">알림 일자 {selectedBox.alarmDate || selectedBox.createdAt}</span>
                        </p>
                    </div>

                    {/* Map */}
                    <div className="flex-1 w-full px-10 pb-10">
                        <Map
                            center={{ lat: selectedBox.lat, lng: selectedBox.lng }}
                            style={{ width: "100%", height: "100%" }}
                            level={3}
                            className={"border rounded-2xl"}
                        >
                            <MapMarker position={{ lat: selectedBox.lat, lng: selectedBox.lng }} />
                        </Map>
                    </div>
                </div>
            )}

            {/* Right Sidebar - User Info */}
            {selectedBox && (
                <div className="w-[290px] h-full flex flex-col border-l p-8">
                    <div className="mb-10">
                        <h2 className="text-2xl text-[#21262B] font-bold pb-1">{selectedBox.user.name}</h2>
                        <p className="text-[#60697E]">
                            <span className="font-bold">가입일자</span>
                            <span className="ml-3 font-normal">{selectedBox.user.createdAt}</span>
                        </p>
                    </div>

                    <div className="space-y-2 text-sm text-[#60697E]">
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">광역시/도</span>
                            <span className="font-nomal">{addressData[selectedBox.id]?.region || "정보 없음"}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">담당지역</span>
                            <span className="font-nomal">{addressData[selectedBox.id]?.city || "정보 없음"}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">상태</span>
                            <span className="font-nomal">
                {getStatusText(selectedBox.removeStatus || selectedBox.alarmType || "REMOVE_REQUEST")}
              </span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">알림일자</span>
                            <span className="font-nomal">{selectedBox.alarmDate || selectedBox.createdAt}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">알림타입</span>
                            <span className="font-nomal">
                {selectedBox.alarmType ? getAlarmTypeText(selectedBox.alarmType) : "정보 없음"}
              </span>
                        </div>
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

function UserListItem({ boxId, name, status, date, isActive, onClick, alarmData, formatDate }) {
    // alarmData가 없는 경우 기본값 사용
    const userId = alarmData ? alarmData.userId : "미지정"
    const alarmDate = alarmData ? formatDate(alarmData.date) : "정보 없음"

    return (
        <div
            className={`p-4 border-b flex justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div className="flex items-start">
                <div>
                    <h3 className="text-base text-[#21262B] font-bold">{userId}</h3>
                    <p className="text-sm text-[#60697E] font-normal text-gray-500 mt-1">{status}</p>
                    <p className="text-sm text-[#60697E] font-normal text-gray-500">{alarmDate}</p>
                </div>
            </div>
            <button
                className="text-gray-400 self-start"
                onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(userId)
                }}
            >
                <img src={CopyIcon || "/placeholder.svg"} alt="복사" width={16} height={16} />
            </button>
        </div>
    )
}
