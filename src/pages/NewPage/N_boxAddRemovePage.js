import { useState, useEffect } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import MapWithSidebar from "../../component/MapWithSidebar"
import DownIcon from "../../assets/Down.png"
import InstallationStatus from "../../component/Status/InstallationStatus"
import RemoveStatus from "../../component/Status/InstallationStatus"
import SGIS_Login from "../../assets/SGIS_Login.png"
import zaryo1 from "../../assets/자료신청1.png"
import zaryo2 from "../../assets/자료신청2.png"
import zaryo2_1 from "../../assets/자료신청2-1(인구밀도).png"
import zaryo2_2 from "../../assets/자료신청2-2(경계데이터).png"
import zaryo3 from "../../assets/신청완료.png"
import Download1 from "../../assets/다운로드1.png"
import Download2 from "../../assets/다운로드2.png"
import { findAllBox, fetchUnresolvedAlarms, findUserAll, uploadFile } from "../../api/apiServices"

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
    const [files, setFiles] = useState({})
    const [showUploader, setShowUploader] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadStatus, setUploadStatus] = useState({})
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [isFireStationExpanded, setIsFireStationExpanded] = useState(false)
    const [isChildSafetyExpanded, setIsChildSafetyExpanded] = useState(false)
    const [isPopulationDataExpanded, setIsPopulationDataExpanded] = useState(false)

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

    // 파일 변경 핸들러
    const handleFileChange = (e, key) => {
        setFiles((prev) => ({ ...prev, [key]: e.target.files[0] }))
    }

    const handleUploadAll = async () => {
        setIsUploading(true)
        setUploadProgress(0)
        setUploadStatus({})

        const totalFiles = Object.keys(files).length

        if (totalFiles === 0) {
            alert("업로드할 파일을 선택해주세요.")
            setIsUploading(false)
            return
        }

        try {
            const formData = new FormData()
            for (const key in files) {
                formData.append(key, files[key])
                console.log(`📦 FormData에 추가됨 - key: ${key}, name: ${files[key].name}`)
            }

            // 👉 FormData 확인용 로그
            for (const pair of formData.entries()) {
                console.log(`🧾 전송 데이터 - ${pair[0]}:`, pair[1])
            }

            const response = await uploadFile(formData)

            if (response) {
                alert("파일 업로드 완료.")
                setUploadStatus(
                    Object.keys(files).reduce((status, key) => {
                        status[key] = { success: true, message: "업로드 성공" }
                        return status
                    }, {}),
                )
            } else {
                alert("파일 업로드 실패.")
            }
        } catch (error) {
            console.error("❌ 파일 업로드 실패:", error)
            alert("파일 업로드 중 오류가 발생했습니다.")
            setUploadStatus(
                Object.keys(files).reduce((status, key) => {
                    status[key] = { success: false, message: error.message || "업로드 실패" }
                    return status
                }, {}),
            )
        } finally {
            setIsUploading(false)
            setUploadProgress(100)
        }
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
        } else {
            // 제거 상태 필터링 로직 수정
            filtered = boxes.filter(
                (box) =>
                    // removeStatus가 있거나
                    removeStatuses.includes(box?.removeStatus) ||
                    // removeInfo.alarmType이 REMOVE로 시작하거나
                    (box?.removeInfo?.alarmType && box.removeInfo.alarmType.startsWith("REMOVE")) ||
                    // installStatus가 REMOVE로 시작하는 경우도 포함
                    (box?.installStatus && box.installStatus.startsWith("REMOVE")),
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

    // 제거 상태 컴포넌트에 전달할 데이터 생성 부분
    const removalBoxes = processedBoxes
        .filter(
            (box) =>
                removeStatuses.includes(box?.removeStatus) ||
                (box?.removeInfo?.alarmType && box.removeInfo.alarmType.startsWith("REMOVE")) ||
                (box?.installStatus && box.installStatus.startsWith("REMOVE")),
        )
        .map((box) => ({
            ...box,
            user: box.removeInfo?.user || { name: box.name || "미지정", createdAt: "정보 없음" },
            createdAt: box.removeInfo?.createdAt || "정보 없음",
            alarmDate: box.removeInfo?.alarmDate || null,
            alarmType: box.removeInfo?.alarmType || box.installStatus || null,
        }))

    // 디버깅을 위한 로그 추가
    console.log("제거 컴포넌트에 전달할 데이터:", removalBoxes)

    // 모달 외부 클릭 시 닫기 핸들러
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 정보 아이콘이나 모달 내부를 클릭한 경우가 아니라면 모달 닫기
            if (showInfoModal && !event.target.closest(".info-modal-container") && !event.target.closest(".info-icon")) {
                setShowInfoModal(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showInfoModal])

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

                    {/* 업로드 토글 버튼 */}
                    <div className="mt-4 w-full text-right">
                        <button
                            onClick={() => setShowUploader(!showUploader)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            {showUploader ? "📁 업로드 창 닫기" : "📁 수거함 위치 추천 최신화"}
                        </button>
                    </div>

                    {/* 파일 업로드 박스 */}
                    {showUploader && (
                        <div className="mt-4 w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-blue-50 to-white p-2.5 border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-base font-bold text-gray-800 flex items-center">
                                        <span className="text-blue-500 mr-1.5">📁</span>
                                        수거함 추천 시스템 최신화를 위한 데이터 업로드
                                    </h2>
                                    <div
                                        className="flex items-center cursor-pointer info-guide-button"
                                        onClick={() => setShowInfoModal(true)}
                                    >
                                        <span className="text-blue-600 mr-2 text-sm font-medium hover:underline">업로드 가이드 보기</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-2.5 rounded-md hover:bg-gray-100 transition-colors">
                                        <label className="font-medium text-sm text-gray-700 block mb-1">인구밀도 데이터</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".csv,.txt"
                                                onChange={(e) => handleFileChange(e, "population")}
                                                className="block w-full text-xs text-gray-500
                file:mr-2 file:py-1 file:px-2
                file:rounded-md file:border-0
                file:text-xs file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
                                            />
                                        </div>
                                    </div>

                                    {["cpg", "dbf", "prj", "shp", "shx"].map((n) => (
                                        <div key={n} className="bg-gray-50 p-2.5 rounded-md hover:bg-gray-100 transition-colors">
                                            <label className="font-medium text-sm text-gray-700 block mb-1">
                                                경계 데이터 <span className="text-blue-600 font-mono">.{n}</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept={`.${n}`}
                                                    onChange={(e) => handleFileChange(e, `boundary${n}`)}
                                                    className="block w-full text-xs text-gray-500
                  file:mr-2 file:py-1 file:px-2
                  file:rounded-md file:border-0
                  file:text-xs file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 업로드 진행률 표시 - 컴팩트한 디자인 */}
                                {isUploading && uploadProgress > 0 && (
                                    <div className="mt-3 mb-1">
                                        <div className="flex justify-between mb-0.5">
                                            <span className="text-xs font-medium text-blue-700">업로드 진행 중</span>
                                            <span className="text-xs font-medium text-blue-700">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-row gap-3 mt-3 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={handleUploadAll}
                                        className="flex items-center justify-center bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        disabled={isUploading}
                                    >
                                        <span className="mr-1">{isUploading ? "📤" : "📤"}</span>
                                        <span>{isUploading ? "업로드 중..." : "업로드 실행"}</span>
                                    </button>

                                    {/* 업로드 중 표시 */}
                                    {isUploading && (
                                        <div className="flex items-center text-blue-600 text-xs">
                                            <svg
                                                className="animate-spin mr-1.5 h-3 w-3 text-blue-600"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            파일 업로드 중... 최대 7시간이 소요될 수 있습니다.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

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

            {/* 도움말 모달 - 화면 중앙에 크게 표시 */}
            {showInfoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto info-modal-container">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold flex items-center">
                                    <span className="mr-2">📋</span>
                                    데이터 업로드 안내
                                </h2>
                                <button className="text-white hover:text-gray-200 text-xl" onClick={() => setShowInfoModal(false)}>
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">개요</h3>
                                <p className="text-gray-700 mb-4">
                                    수거함 추천 시스템은 다양한 데이터를 분석하여 최적의 수거함 설치 위치를 추천합니다. 이 시스템을
                                    최신화하기 위해서는 아래의 데이터를 업로드해야 합니다.
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">필요한 데이터 파일</h3>

                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setIsPopulationDataExpanded(!isPopulationDataExpanded)}
                                    >
                                        <h4 className="font-bold text-blue-800 mb-2">인구밀도 데이터 및 경계 데이터 파일</h4>
                                        <span className="text-blue-800">{isPopulationDataExpanded ? "▼" : "▶"}</span>
                                    </div>

                                    {isPopulationDataExpanded && (
                                        <>
                                            <p className="text-gray-700 mb-2">
                                                지역별 인구 분포를 분석하기 위한 데이터와 지역 경계를 정의하는 GIS 데이터 파일입니다.
                                            </p>
                                            <ul className="list-disc pl-5 text-gray-600 mb-2">
                                                <li>인구밀도 데이터 파일 형식: TXT</li>
                                                <li>경계 데이터 파일 형식: .cpg, .dbf, .prj, .shp, .shx (모두 필수)</li>
                                                <li>데이터 출처: SGIS 통계지리정보서비스(https://sgis.kostat.go.kr/view/index)</li>
                                            </ul>
                                            <p className="text-black font-bold text-lg mt-4 mb-2">1. SGIS 홈페이지 회원가입 및 로그인</p>
                                            <p className="text-gray-700 mb-2">
                                                SGIS 통계지리정보서비스(https://sgis.kostat.go.kr/view/index)에 진입하여 회원가입 및 로그인을
                                                진행합니다.
                                            </p>
                                            <img src={SGIS_Login || "/placeholder.svg"} />
                                            <p className="text-black font-bold text-lg mt-4 mb-2">2. 자료신청</p>
                                            <p className="text-gray-700 mb-2">자료제공 -> 자료신청으로 진입합니다.</p>
                                            <img src={zaryo1 || "/placeholder.svg"} />
                                            <p className="text-black font-bold text-lg mt-4 mb-2">2-1. 기본정보 입력</p>
                                            <p className="text-gray-700 mb-2">활용목적 및 수행과제 예시 문장입니다. 복사하여 사용하세요.</p>
                                            <ul className="list-disc pl-5 text-gray-600 mb-2">
                                                <li>
                                                    본 자료는 스마트 도시 환경에서 폐전지 수거함의 최적 배치를 위한 연구에 활용하고자 합니다.
                                                    인구밀도, 유동인구, 안전시설 위치 등의 데이터를 종합적으로 분석하여 효율적인 쓰레기 수거
                                                    시스템을 구축하고, 이를 통해 도시 환경 개선 및 주민 생활 편의성 향상에 기여하고자 합니다. 특히
                                                    어린이보호구역과 소방서 위치 데이터를 활용하여 안전성과 접근성을 모두 고려한 최적의 수거함
                                                    위치 선정 알고리즘을 개발하는 데 중점을 두고 있습니다.
                                                </li>
                                                <li>
                                                    스마트 도시 환경에서 폐전지 수거함의 최적 위치 선정을 위한 데이터 기반 의사결정 시스템 개발 및
                                                    실증 분석
                                                </li>
                                            </ul>
                                            <img src={zaryo2 || "/placeholder.svg"} />
                                            <p className="text-black font-bold text-lg mt-4 mb-2">2-2. 인구밀도 데이터</p>
                                            <img src={zaryo2_1 || "/placeholder.svg"} />
                                            <p className="text-black font-bold text-lg mt-4 mb-2">2-3. 경계 데이터</p>
                                            <img src={zaryo2_2 || "/placeholder.svg"} />
                                            <p className="text-black font-bold text-lg mt-4 mb-2">2-4. 신청 완료</p>
                                            <img src={zaryo3 || "/placeholder.svg"} />
                                            <p className="text-black font-bold text-lg mt-4 mb-2">3. 신청자료 다운로드</p>
                                            <img src={Download1 || "/placeholder.svg"} />
                                            <img src={Download2 || "/placeholder.svg"} />
                                        </>
                                    )}
                                </div>

                                <div className="bg-red-50 p-4 rounded-lg mb-4">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setIsFireStationExpanded(!isFireStationExpanded)}
                                    >
                                        <h4 className="font-bold text-red-800 mb-2">119안전센터 현황</h4>
                                        <span className="text-red-800">{isFireStationExpanded ? "▼" : "▶"}</span>
                                    </div>

                                    {isFireStationExpanded && (
                                        <>
                                            <p className="text-gray-700 mb-2">소방서 및 안전센터 위치 정보입니다.</p>
                                            <ul className="list-disc pl-5 text-gray-600">
                                                <li>파일 형식: CSV</li>
                                                <li>필수 열: 센터명, 주소, 좌표(위도/경도)</li>
                                                <li>데이터 출처: 국가공공데이터포털</li>
                                            </ul>
                                        </>
                                    )}
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setIsChildSafetyExpanded(!isChildSafetyExpanded)}
                                    >
                                        <h4 className="font-bold text-yellow-800 mb-2">어린이보호구역 표준데이터</h4>
                                        <span className="text-yellow-800">{isChildSafetyExpanded ? "▼" : "▶"}</span>
                                    </div>

                                    {isChildSafetyExpanded && (
                                        <>
                                            <p className="text-gray-700 mb-2">어린이보호구역 위치 및 범위 정보입니다.</p>
                                            <ul className="list-disc pl-5 text-gray-600">
                                                <li>파일 형식: CSV</li>
                                                <li>필수 열: 보호구역명, 주소, 좌표(위도/경도), 범위정보</li>
                                                <li>데이터 출처: 국가공공데이터포털</li>
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">처리 과정</h3>
                                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                                    <li>모든 필요 파일을 업로드합니다.</li>
                                    <li>시스템이 데이터를 검증하고 처리합니다.</li>
                                    <li>인구밀도, 안전센터 접근성, 어린이보호구역 등을 고려하여 최적의 위치를 분석합니다.</li>
                                    <li>분석 결과를 바탕으로 추천 위치가 지도에 표시됩니다.</li>
                                </ol>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h3 className="text-lg font-bold text-orange-800 mb-2">주의사항</h3>
                                <ul className="list-disc pl-5 text-gray-700">
                                    <li>데이터 처리에는 최대 7시간이 소요될 수 있습니다.</li>
                                    <li>모든 파일은 UTF-8 인코딩으로 저장되어야 합니다.</li>
                                    <li>모든 경계 데이터 파일(.cpg, .dbf, .prj, .shp, .shx)은 함께 업로드해야 합니다.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-b-lg border-t border-gray-200">
                            <div className="flex justify-end">
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                    onClick={() => setShowInfoModal(false)}
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add custom styles for scrollbar */}
            <style jsx global>{`
                .dropdown-container div {
                    padding-right: 4px; /* 스크롤바 오른쪽 간격 */
                }

                .dropdown-container div::-webkit-scrollbar {
                    width: 4px;
                }

                .dropdown-container div::-webkit-scrollbar-track {
                    background: transparent;ent;
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