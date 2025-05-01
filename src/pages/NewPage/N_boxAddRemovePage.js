"use client"

import { useState, useEffect } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import MapWithSidebar from "../../component/MapWithSidebar"
import DownIcon from "../../assets/Down.png"
import InstallationStatus from "../../component/Status/InstallationStatus"
import RemoveStatus from "../../component/Status/RemoveStatus"
import { findAllBox, fetchUnresolvedAlarms, findUserAll } from "../../api/apiServices"

const N_boxAddRemovePage = () => {
    const [activeTab, setActiveTab] = useState("전체")
    const tabs = ["전체", "설치 상태", "제거 상태"]
    const [boxes, setBoxes] = useState([])
    const [addressData, setAddressData] = useState({})
    const [isAddressLoading, setIsAddressLoading] = useState(false)
    const [alarmData, setAlarmData] = useState({})
    const [userMap, setUserMap] = useState({})
    const [processedBoxes, setProcessedBoxes] = useState([])
    const [isDataLoading, setIsDataLoading] = useState(true)

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

    // 모든 데이터 로드 (박스, 알람, 사용자)
    const loadAllData = async () => {
        setIsDataLoading(true)
        try {
            // 박스 데이터, 알람 데이터, 사용자 데이터를 병렬로 가져오기
            const [boxData, alarmData, userData] = await Promise.all([findAllBox(), fetchUnresolvedAlarms(), findUserAll()])

            console.log("Box Data:", boxData)
            console.log("Alarm Data:", alarmData)
            console.log("User Data:", userData)

            // 사용자 정보 처리
            const userMapObj = {}
            userData.forEach((user) => {
                if (user && user.id) {
                    userMapObj[user.id] = {
                        id: user.id,
                        name: user.name || user.id,
                        createdAt: user.date ? formatDate(user.date) : "정보 없음",
                        location: user.location || "정보 없음",
                        phoneNumber: user.phoneNumber || "정보 없음",
                        role: user.role || "정보 없음",
                    }
                }
            })
            setUserMap(userMapObj)

            // 알람 데이터 처리
            const alarmsByBoxId = {}
            const alarmsByBoxIdForState = {}

            alarmData.forEach((alarm) => {
                if (alarm.boxId) {
                    if (!alarmsByBoxId[alarm.boxId]) {
                        alarmsByBoxId[alarm.boxId] = []
                    }
                    alarmsByBoxId[alarm.boxId].push(alarm)

                    // 각 박스 ID에 대해 가장 최근 알람만 저장
                    if (
                        !alarmsByBoxIdForState[alarm.boxId] ||
                        new Date(alarm.date) > new Date(alarmsByBoxIdForState[alarm.boxId].date)
                    ) {
                        alarmsByBoxIdForState[alarm.boxId] = alarm
                    }
                }
            })
            setAlarmData(alarmsByBoxIdForState)

            // 박스 데이터 처리
            const mappedBoxes = boxData.map((entry) => {
                const box = entry.box || entry
                const id = box.id
                const name = box.name
                const location = box.location
                const installStatus = box.install_status || box.installStatus
                const removeStatus = box.remove_status || box.removeStatus

                // 위치 파싱 (띄어쓰기 유무 상관없이 처리)
                let lng = 0
                let lat = 0
                if (location) {
                    const coordsMatch = location.match(/POINT\s*\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)/)
                    if (coordsMatch) {
                        lng = Number.parseFloat(coordsMatch[1])
                        lat = Number.parseFloat(coordsMatch[2])
                    }
                }

                // 설치 관련 알람 찾기
                const boxAlarms = alarmsByBoxId[id] || []
                const installAlarms = boxAlarms.filter((alarm) => alarm.type && alarm.type.startsWith("INSTALL"))
                const removeAlarms = boxAlarms.filter((alarm) => alarm.type && alarm.type.startsWith("REMOVE"))

                const latestInstallAlarm =
                    installAlarms.length > 0 ? installAlarms.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null

                const latestRemoveAlarm =
                    removeAlarms.length > 0 ? removeAlarms.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null

                // 설치 사용자 정보
                let installUserName = "미지정"
                let installUserCreatedAt = "정보 없음"
                let installUserId = null

                if (latestInstallAlarm && latestInstallAlarm.userId) {
                    installUserId = latestInstallAlarm.userId
                    if (userMapObj[installUserId]) {
                        installUserName = userMapObj[installUserId].name
                        installUserCreatedAt = userMapObj[installUserId].createdAt
                    } else {
                        installUserName = installUserId
                        const matchingUsers = userData.filter((u) => u.id === installUserId)
                        if (matchingUsers.length > 0 && matchingUsers[0].date) {
                            installUserCreatedAt = formatDate(matchingUsers[0].date)
                        }
                    }
                }

                // 제거 사용자 정보
                let removeUserName = "미지정"
                let removeUserCreatedAt = "정보 없음"
                let removeUserId = null

                if (latestRemoveAlarm && latestRemoveAlarm.userId) {
                    removeUserId = latestRemoveAlarm.userId
                    if (userMapObj[removeUserId]) {
                        removeUserName = userMapObj[removeUserId].name
                        removeUserCreatedAt = userMapObj[removeUserId].createdAt
                    } else {
                        removeUserName = removeUserId
                        const matchingUsers = userData.filter((u) => u.id === removeUserId)
                        if (matchingUsers.length > 0 && matchingUsers[0].date) {
                            removeUserCreatedAt = formatDate(matchingUsers[0].date)
                        }
                    }
                }

                return {
                    id,
                    name,
                    lat,
                    lng,
                    installStatus,
                    removeStatus,
                    installInfo: {
                        createdAt: latestInstallAlarm ? formatDate(latestInstallAlarm.date) : "정보 없음",
                        alarmDate: latestInstallAlarm ? formatDate(latestInstallAlarm.date) : null,
                        alarmType: latestInstallAlarm ? latestInstallAlarm.type : null,
                        user: {
                            id: installUserId,
                            name: installUserName,
                            createdAt: installUserCreatedAt,
                        },
                    },
                    removeInfo: {
                        createdAt: latestRemoveAlarm ? formatDate(latestRemoveAlarm.date) : "정보 없음",
                        alarmDate: latestRemoveAlarm ? formatDate(latestRemoveAlarm.date) : null,
                        alarmType: latestRemoveAlarm ? latestRemoveAlarm.type : null,
                        user: {
                            id: removeUserId,
                            name: removeUserName,
                            createdAt: removeUserCreatedAt,
                        },
                    },
                }
            })

            setBoxes(mappedBoxes)
            setProcessedBoxes(mappedBoxes)

            // 박스 데이터가 로드된 후 카카오 API 로드
            loadKakaoAPI(mappedBoxes)
        } catch (error) {
            console.error("데이터 로딩 실패:", error)
        } finally {
            setIsDataLoading(false)
        }
    }

    // 날짜 포맷 함수
    const formatDate = (dateString) => {
        if (!dateString) {
            return "정보 없음"
        }

        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                return "정보 없음"
            }

            const formatted = date
                .toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                })
                .replace(/\. /g, ".")
                .replace(/\.$/, "")

            return formatted
        } catch (e) {
            console.error(`Date formatting error for ${dateString}:`, e)
            return "정보 없음"
        }
    }

    // 카카오 API 로드 및 주소 변환 함수
    const loadKakaoAPI = (boxesData) => {
        console.log("카카오 API 로드 시도")

        // 이미 카카오 API가 로드되어 있는 경우
        if (window.kakao && window.kakao.maps) {
            console.log("카카오 API가 이미 로드되어 있습니다.")
            convertAddresses(boxesData)
            return
        }

        console.log("카카오 API 스크립트 로드 중...")
        // 카카오 API 스크립트 로드
        const script = document.createElement("script")
        script.async = true
        const apiKey = process.env.REACT_APP_KAKAO_API_KEY || "발급받은_API_키_입력"
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`

        script.onload = () => {
            console.log("카카오 API 스크립트 로드 완료, 초기화 중...")
            window.kakao.maps.load(() => {
                console.log("카카오 맵 API 초기화 완료")
                convertAddresses(boxesData)
            })
        }

        script.onerror = (error) => {
            console.error("카카오 API 스크립트 로드 실패:", error)
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
                    const rawRegion = addressInfo.address ? addressInfo.address.region_1depth_name || "" : ""
                    const rawCity = addressInfo.address ? addressInfo.address.region_2depth_name || "" : ""

                    // 지역명 정규화
                    const region = normalizeRegionName(rawRegion)
                    const city = rawCity

                    console.log(`주소 변환: ${rawRegion} -> ${region}, ${rawCity} -> ${city}`)

                    resolve({ region, city })
                } else {
                    resolve({ region: "", city: "" })
                }
            })
        })
    }

    // 모든 박스의 주소 변환 (배치 처리)
    const convertAddresses = async (boxesData) => {
        if (!window.kakao || !window.kakao.maps || boxesData.length === 0) {
            console.warn("카카오 맵 API가 로드되지 않았거나 박스 데이터가 비어 있습니다.")
            return
        }

        console.log("주소 변환 시작:", boxesData.length, "개의 박스")
        setIsAddressLoading(true)

        try {
            // 주소 변환 요청을 10개씩 배치 처리
            const batchSize = 10
            const addressMap = { ...addressData }

            for (let i = 0; i < boxesData.length; i += batchSize) {
                const batch = boxesData.slice(i, i + batchSize)
                console.log(`배치 ${i / batchSize + 1} 처리 중: ${batch.length}개 항목`)

                const promises = batch.map(async (box) => {
                    if (box.lat && box.lng) {
                        const address = await convertCoordsToAddress(box.lng, box.lat)
                        console.log(`박스 ${box.id} 주소 변환 결과:`, address)
                        return { id: box.id, address }
                    }
                    console.warn(`박스 ${box.id}에 좌표 정보가 없습니다.`)
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
                console.log("주소 데이터 업데이트:", Object.keys(addressMap).length, "개의 주소")

                // 너무 빠른 요청으로 인한 API 제한 방지를 위한 지연
                if (i + batchSize < boxesData.length) {
                    console.log("API 제한 방지를 위한 지연 중...")
                    await new Promise((resolve) => setTimeout(resolve, 300))
                }
            }

            console.log("주소 변환 완료. 총", Object.keys(addressMap).length, "개의 주소 데이터")

            // 주소 데이터 디버깅
            console.log("주소 데이터 샘플:")
            const addressEntries = Object.entries(addressMap)
            if (addressEntries.length > 0) {
                addressEntries.slice(0, 5).forEach(([id, address]) => {
                    console.log(`ID: ${id}, 지역: ${address.region}, 도시: ${address.city}`)
                })
            }
        } catch (error) {
            console.error("주소 변환 중 오류 발생:", error)
        } finally {
            setIsAddressLoading(false)
        }
    }

    useEffect(() => {
        loadAllData()
    }, [])

    // 모든 지역 목록
    const allRegions = Object.keys(regionData)

    // 설치 상태 값 매핑 (API 응답의 installStatus 값에 맞게 수정)
    const installStatuses = ["INSTALL_REQUEST", "INSTALL_IN_PROGRESS", "INSTALL_CONFIRMED", "INSTALL_COMPLETED"]
    const removeStatuses = ["REMOVE_REQUEST", "REMOVE_IN_PROGRESS", "REMOVE_CONFIRMED", "REMOVE_COMPLETED"]

    // 필터 상태
    const [filters, setFilters] = useState({
        type: "설치",
        statuses: ["INSTALL_REQUEST", "INSTALL_IN_PROGRESS", "INSTALL_CONFIRMED", "INSTALL_COMPLETED"],
        region: "광역시/도",
        city: "시/군/구",
    })

    // 도시 옵션 상태
    const [cityOptions, setCityOptions] = useState([])

    // 드롭다운 열림/닫힘 상태
    const [openDropdown, setOpenDropdown] = useState({
        type: false,
        region: false,
        city: false,
    })

    // 호버 상태 관리
    const [hoveredItem, setHoveredItem] = useState({
        type: null,
        region: null,
        city: null,
    })

    // 선택된 지역에 따라 도시 옵션 업데이트
    useEffect(() => {
        if (filters.region === "광역시/도") {
            setCityOptions([])
        } else {
            setCityOptions(regionData[filters.region] || [])
        }

        // 지역이 변경되면 도시를 기본값으로 재설정
        setFilters((prev) => ({
            ...prev,
            city: "시/군/구",
        }))
    }, [filters.region])

    const handleFilterChange = (filterType, value, statuses = undefined) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
            ...(statuses && { statuses }),
        }))
        // 드롭다운 닫기
        setOpenDropdown((prev) => ({
            ...prev,
            [filterType]: false,
        }))
    }

    // 드롭다운 토글 핸들러 - 한 번에 하나의 드롭다운만 열리도록 수정
    const toggleDropdown = (dropdownName) => {
        // 시/군/구 드롭다운은 지역이 선택되지 않았으면 열지 않음
        if (dropdownName === "city" && filters.region === "광역시/도") {
            return
        }

        // 모든 드롭다운을 닫고, 클릭한 드롭다운만 토글
        setOpenDropdown((prev) => {
            // 새로운 상태 객체 생성
            const newState = {
                type: false,
                region: false,
                city: false,
            }

            // 클릭한 드롭다운이 이미 열려있으면 닫고, 닫혀있으면 열기
            newState[dropdownName] = !prev[dropdownName]

            return newState
        })
    }

    // 드롭다운 외부 클릭 시 모든 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 드롭다운 버튼이나 메뉴를 클릭한 경우가 아니라면 모든 드롭다운 닫기
            if (!event.target.closest(".dropdown-container")) {
                setOpenDropdown({
                    type: false,
                    region: false,
                    city: false,
                })
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // 도시 드롭다운 비활성화 여부
    const isCityDisabled = filters.region === "광역시/도"

    // 호버 상태 설정 핸들러
    const handleMouseEnter = (dropdownType, item) => {
        setHoveredItem((prev) => ({
            ...prev,
            [dropdownType]: item,
        }))
    }

    // 호버 상태 해제 핸들러
    const handleMouseLeave = (dropdownType) => {
        setHoveredItem((prev) => ({
            ...prev,
            [dropdownType]: null,
        }))
    }

    // 선택된 탭에 따라 데이터 필터링
    const getFilteredBoxesByTab = () => {
        return activeTab === "전체"
            ? boxes
            : activeTab === "설치 상태"
                ? boxes.filter((box) => installStatuses.includes(box?.installStatus))
                : activeTab === "제거 상태"
                    ? boxes.filter((box) => removeStatuses.includes(box?.installStatus))
                    : []
    }

    // 지역별 필터링된 박스 데이터 계산
    const getRegionFilteredBoxes = () => {
        console.log("필터링 실행:", filters.type, filters.region, filters.city)
        console.log("현재 주소 데이터:", addressData)
        console.log("전체 박스 데이터:", boxes)

        // 먼저 타입에 따라 필터링
        let filtered = []

        if (filters.type === "설치") {
            filtered = boxes.filter((box) => installStatuses.includes(box?.installStatus))
            console.log("설치 상태 필터링 결과:", filtered.length, filtered)
        } else {
            filtered = boxes.filter(
                (box) =>
                    removeStatuses.includes(box?.removeStatus) ||
                    (box?.removeInfo?.alarmType && box.removeInfo.alarmType.startsWith("REMOVE")),
            )
            console.log("제거 상태 필터링 결과:", filtered.length, filtered)
        }

        // 지역 필터링
        if (filters.region !== "광역시/도") {
            const beforeCount = filtered.length

            // 주소 데이터가 있는지 확인
            if (Object.keys(addressData).length === 0) {
                console.warn("주소 데이터가 비어 있습니다. 지역 필터링을 건너뜁니다.")
                return filtered
            }

            filtered = filtered.filter((box) => {
                const boxAddress = addressData[box.id]
                if (!boxAddress) {
                    console.warn(`박스 ID ${box.id}에 대한 주소 정보가 없습니다.`)
                    return false
                }
                const isMatch = boxAddress.region === filters.region
                console.log(`박스 ${box.id} 지역 필터링: ${boxAddress.region} === ${filters.region} => ${isMatch}`)
                return isMatch
            })
            console.log(`지역(${filters.region}) 필터링: ${beforeCount} -> ${filtered.length}`)

            // 도시 필터링
            if (filters.city !== "시/군/구") {
                const beforeCityCount = filtered.length
                filtered = filtered.filter((box) => {
                    const boxAddress = addressData[box.id]
                    if (!boxAddress) return false
                    const isMatch = boxAddress.city === filters.city
                    console.log(`박스 ${box.id} 도시 필터링: ${boxAddress.city} === ${filters.city} => ${isMatch}`)
                    return isMatch
                })
                console.log(`도시(${filters.city}) 필터링: ${beforeCityCount} -> ${filtered.length}`)
            }
        }

        return filtered
    }

    // 필터링된 박스 데이터 업데이트
    useEffect(() => {
        console.log("필터 또는 데이터 변경 감지됨")
        const filtered = getRegionFilteredBoxes()
        console.log("필터링 결과:", filtered.length, "개의 박스")
        setProcessedBoxes(filtered)
    }, [filters, addressData, boxes, activeTab])

    // 맵에 표시할 데이터
    const mapBoxes = getFilteredBoxesByTab()

    // 설치 상태 컴포넌트에 전달할 데이터
    const installationBoxes = processedBoxes
        .filter((box) => installStatuses.includes(box?.installStatus))
        .map((box) => ({
            ...box,
            user: box.installInfo.user,
            createdAt: box.installInfo.createdAt,
            alarmDate: box.installInfo.alarmDate,
            alarmType: box.installInfo.alarmType,
        }))

    // 제거 상태 컴포넌트에 전달할 데이터
    const removalBoxes = processedBoxes
        .filter(
            (box) =>
                removeStatuses.includes(box?.removeStatus) ||
                (box?.removeInfo?.alarmType && box.removeInfo.alarmType.startsWith("REMOVE")),
        )
        .map((box) => ({
            ...box,
            user: box.removeInfo.user,
            createdAt: box.removeInfo.createdAt,
            alarmDate: box.removeInfo.alarmDate,
            alarmType: box.removeInfo.alarmType,
        }))

    return (
        <div className="flex min-h-screen w-full bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-[#272F42] text-xl">수거함 설치 / 제거 요청</p>
                    <div>
                        <div className="relative mb-6">
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0" />
                            <div className="flex gap-6 relative z-10">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-1 bg-transparent ${
                                            activeTab === tab ? "border-b-[3px] border-black text-[#21262B] font-bold" : "text-[#60697E]"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 맵 컴포넌트에 필터링된 데이터 전달 */}
                    <MapWithSidebar
                        filteredBoxes={mapBoxes}
                        isAddRemovePage={true}
                        onDataChange={loadAllData}
                        addressData={addressData}
                    />

                    <div className="pt-14 pb-3">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-[#272F42] text-xl">지역별 설치 / 제거 상세 현황</p>
                        </div>

                        {/* 필터 UI 추가 */}
                        <div className="relative pt-2">
                            <div className="flex flex-wrap gap-7 mt-2 pb-1 font-bold relative z-10">
                                <div className="relative dropdown-container">
                                    <button
                                        className={`flex items-center gap-2 text-base ${
                                            filters.type === "설치" ? "text-[#21262B] font-bold" : "text-[#21262B] font-bold"
                                        }`}
                                        onClick={() => toggleDropdown("type")}
                                    >
                                        {filters.type}
                                        <img src={DownIcon || "/placeholder.svg"} alt="Down" className="w-3 h-2" />
                                    </button>
                                    {/* 타입 드롭다운 메뉴 */}
                                    {openDropdown.type && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg w-[120px] overflow-hidden shadow-sm">
                                            {[
                                                {
                                                    value: "설치",
                                                    statuses: [
                                                        "INSTALL_REQUEST",
                                                        "INSTALL_IN_PROGRESS",
                                                        "INSTALL_CONFIRMED",
                                                        "INSTALL_COMPLETED",
                                                    ],
                                                },
                                                {
                                                    value: "제거",
                                                    statuses: ["REMOVE_REQUEST", "REMOVE_IN_PROGRESS", "REMOVE_CONFIRMED", "REMOVE_COMPLETED"],
                                                },
                                            ].map((typeOption) => (
                                                <div
                                                    key={typeOption.value}
                                                    className={`px-4 py-2 cursor-pointer font-normal ${
                                                        hoveredItem.type === typeOption.value ? "bg-[#F5F5F5] rounded-lg" : ""
                                                    }`}
                                                    onClick={() => handleFilterChange("type", typeOption.value, typeOption.statuses)}
                                                    onMouseEnter={() => handleMouseEnter("type", typeOption.value)}
                                                    onMouseLeave={() => handleMouseLeave("type")}
                                                >
                                                    {typeOption.value}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative dropdown-container">
                                    <button
                                        className={`flex items-center gap-2 ${
                                            filters.region !== "광역시/도" ? "text-[#21262B] font-bold" : "text-[#21262B] font-bold"
                                        }`}
                                        onClick={() => toggleDropdown("region")}
                                    >
                                        {filters.region}
                                        <img src={DownIcon || "/placeholder.svg"} alt="Down" className="w-3 h-2" />
                                    </button>
                                    {/* 지역 드롭다운 메뉴 */}
                                    {openDropdown.region && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg w-[200px] max-h-[200px] overflow-y-auto shadow-sm">
                                            {allRegions.map((region) => (
                                                <div
                                                    key={region}
                                                    className={`px-4 py-2 cursor-pointer font-normal ${
                                                        hoveredItem.region === region ? "bg-[#F5F5F5] rounded-lg" : ""
                                                    }`}
                                                    onClick={() => handleFilterChange("region", region)}
                                                    onMouseEnter={() => handleMouseEnter("region", region)}
                                                    onMouseLeave={() => handleMouseLeave("region")}
                                                >
                                                    {region}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative dropdown-container">
                                    <button
                                        className={`flex items-center gap-2 ${
                                            filters.city !== "시/군/구" ? "text-[#21262B] font-bold" : "text-[#21262B] font-bold"
                                        } ${isCityDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => toggleDropdown("city")}
                                        disabled={isCityDisabled}
                                    >
                                        {filters.city}
                                        <img src={DownIcon || "/placeholder.svg"} alt="Down" className="w-3 h-2" />
                                    </button>
                                    {/* 도시 드롭다운 메뉴 */}
                                    {openDropdown.city && !isCityDisabled && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg w-[120px] max-h-[240px] overflow-y-auto shadow-sm">
                                            <div
                                                className={`px-4 py-2 cursor-pointer font-normal ${
                                                    hoveredItem.city === "시/군/구" ? "bg-[#F5F5F5] rounded-lg" : ""
                                                }`}
                                                onClick={() => handleFilterChange("city", "시/군/구")}
                                                onMouseEnter={() => handleMouseEnter("city", "시/군/구")}
                                                onMouseLeave={() => handleMouseLeave("city")}
                                            >
                                                시/군/구
                                            </div>
                                            {cityOptions.map((city) => (
                                                <div
                                                    key={city}
                                                    className={`px-4 py-2 cursor-pointer font-normal ${
                                                        hoveredItem.city === city ? "bg-[#F5F5F5] rounded-lg" : ""
                                                    }`}
                                                    onClick={() => handleFilterChange("city", city)}
                                                    onMouseEnter={() => handleMouseEnter("city", city)}
                                                    onMouseLeave={() => handleMouseLeave("city")}
                                                >
                                                    {city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0" />
                        </div>
                    </div>

                    {/* 선택된 타입에 따라 컴포넌트 조건부 렌더링 */}
                    {isDataLoading || isAddressLoading ? (
                        <div className="flex justify-center items-center h-[200px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                    ) : processedBoxes.length === 0 ? (
                        <div className="flex justify-center items-center h-[200px] bg-white rounded-2xl shadow-md">
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-700">필터링 결과가 없습니다</p>
                                <p className="text-gray-500 mt-2">선택한 지역에 해당하는 수거함이 없습니다.</p>
                                <button
                                    className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={() =>
                                        setFilters({
                                            type: filters.type,
                                            statuses: filters.statuses,
                                            region: "광역시/도",
                                            city: "시/군/구",
                                        })
                                    }
                                >
                                    필터 초기화
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {filters.type === "설치" ? (
                                <InstallationStatus
                                    statuses={filters.statuses}
                                    addressData={addressData}
                                    processedBoxes={installationBoxes}
                                />
                            ) : (
                                <RemoveStatus statuses={filters.statuses} addressData={addressData} processedBoxes={removalBoxes} />
                            )}
                        </>
                    )}

                    <div className="pb-32" />
                </main>
            </div>

            {/* Add custom styles for scrollbar */}
            <style jsx global>{`
                .dropdown-container div {
                    padding-right: 4px; /* 스크롤바 오른쪽 간격 */
                }

                .dropdown-container div::-webkit-scrollbar {
                    width: 4px;
                }

                .dropdown-container div::-webkit-scrollbar-track {
                    background: transparent;
                    margin-left: 4px; /* 스크롤바 왼쪽 간격 */
                }

                .dropdown-container div::-webkit-scrollbar-thumb {
                    background: #d1d1d1;
                    border-radius: 10px;
                    margin-right: 4px; /* 스크롤바 오른쪽 간격 추가 */
                }

                .dropdown-container div::-webkit-scrollbar-thumb:hover {
                    background: #b1b1b1;
                }
            `}</style>
        </div>
    )
}

export default N_boxAddRemovePage