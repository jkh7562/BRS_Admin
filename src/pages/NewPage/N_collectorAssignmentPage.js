import { useState, useEffect, useRef } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import DownIcon from "../../assets/Down.png"
import { Map, CustomOverlayMap } from "react-kakao-maps-sdk"
import CollectorAssignment from "../../component/CollectorAssignment"
import { findUserAll } from "../../api/apiServices"

const N_collectorAssignmentPage = () => {
    // 지역 및 도시 데이터
    const regionData = {
        "광역시/도": [], // 전체 선택 옵션
        서울특별시: ["강남구", "서초구", "송파구", "강동구", "마포구", "용산구", "종로구", "중구", "성동구", "광진구"],
        부산광역시: ["해운대구", "수영구", "남구", "동구", "서구", "북구", "사상구", "사하구", "연제구", "영도구"],
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

    // 지역별 중심 좌표 및 확대 레벨
    const regionCenters = {
        서울특별시: { lat: 37.5665, lng: 126.978, level: 10 },
        부산광역시: { lat: 35.1796, lng: 129.0756, level: 10 },
        인천광역시: { lat: 37.4563, lng: 126.7052, level: 10 },
        대구광역시: { lat: 35.8714, lng: 128.6014, level: 10 },
        광주광역시: { lat: 35.1595, lng: 126.8526, level: 10 },
        대전광역시: { lat: 36.3504, lng: 127.3845, level: 10 },
        울산광역시: { lat: 35.5384, lng: 129.3114, level: 10 },
        세종특별자치시: { lat: 36.48, lng: 127.289, level: 10 },
        경기도: { lat: 37.4138, lng: 127.5183, level: 11 },
        강원도: { lat: 37.8228, lng: 128.1555, level: 11 },
        충청북도: { lat: 36.8, lng: 127.7, level: 11 },
        충청남도: { lat: 36.5184, lng: 126.8, level: 11 },
        전라북도: { lat: 35.82, lng: 127.108, level: 11 },
        전라남도: { lat: 34.816, lng: 126.463, level: 11 },
        경상북도: { lat: 36.4919, lng: 128.8889, level: 11 },
        경상남도: { lat: 35.4606, lng: 128.2132, level: 11 },
        제주특별자치도: { lat: 33.4996, lng: 126.5312, level: 10 },
    }

    // 모든 지역 목록
    const allRegions = Object.keys(regionData)

    // 필터 상태
    const [filters, setFilters] = useState({
        region: "광역시/도",
        city: "시/군/구",
    })

    // 지도 상태
    const [mapCenter, setMapCenter] = useState({ lat: 36.8082, lng: 127.009 })
    const [mapLevel, setMapLevel] = useState(13)

    // 도시 옵션 상태
    const [cityOptions, setCityOptions] = useState([])

    // 드롭다운 열림/닫힘 상태
    const [openDropdown, setOpenDropdown] = useState({
        region: false,
        city: false,
    })

    // 호버 상태 관리
    const [hoveredItem, setHoveredItem] = useState({
        region: null,
        city: null,
    })

    // 행정구역 경계 데이터
    const [boundaryData, setBoundaryData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // 유저 데이터 상태
    const [userData, setUserData] = useState([])
    const [employeeCounts, setEmployeeCounts] = useState({})
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)

    // 카카오맵 인스턴스 참조
    const mapRef = useRef(null)
    const geocoderRef = useRef(null)
    const boundaryPolygonsRef = useRef([])
    const boundaryLabelsRef = useRef([])

    // 유저 데이터 가져오기
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true)
            try {
                const response = await findUserAll()
                if (response && Array.isArray(response)) {
                    setUserData(response)
                    // 유저 데이터를 기반으로 지역별 ROLE_EMPLOYEE 카운트 계산
                    calculateEmployeeCounts(response)
                }
            } catch (err) {
                console.error("유저 데이터를 가져오는 중 오류 발생:", err)
                setError("유저 데이터를 가져오는 중 오류가 발생했습니다.")
            } finally {
                setIsLoadingUsers(false)
            }
        }

        fetchUsers()
    }, [])

    // 지역별 ROLE_EMPLOYEE 카운트 계산 함수
    const calculateEmployeeCounts = (users) => {
        const counts = {}

        // ROLE_EMPLOYEE 역할을 가진 유저만 필터링
        const employees = users.filter((user) => user.role === "ROLE_EMPLOYEE")

        // 지역별로 그룹화하여 카운트
        employees.forEach((employee) => {
            const location1 = employee.location1 || "미지정"
            const location2 = employee.location2 || "미지정"

            // location1 레벨 카운트
            if (!counts[location1]) {
                counts[location1] = { total: 0, cities: {} }
            }
            counts[location1].total += 1

            // location2 레벨 카운트
            if (!counts[location1].cities[location2]) {
                counts[location1].cities[location2] = 0
            }
            counts[location1].cities[location2] += 1
        })

        setEmployeeCounts(counts)
    }

    // 선택된 지역에 따라 도시 옵션 업데이트
    useEffect(() => {
        if (filters.region === "광역시/도") {
            setCityOptions([])
            // 전체 지도 보기로 리셋
            setMapCenter({ lat: 36.8082, lng: 127.009 })
            setMapLevel(13)
            setBoundaryData(null)
            clearBoundaries()
        } else {
            setCityOptions(regionData[filters.region] || [])

            // 선택된 지역으로 지도 중심 이동
            if (regionCenters[filters.region]) {
                setMapCenter({
                    lat: regionCenters[filters.region].lat,
                    lng: regionCenters[filters.region].lng,
                })
                setMapLevel(regionCenters[filters.region].level)

                // 지역 경계 데이터 가져오기
                searchRegionBoundary(filters.region)
            }
        }

        // 지역이 변경되면 도시를 기본값으로 재설정
        setFilters((prev) => ({
            ...prev,
            city: "시/군/구",
        }))
    }, [filters.region])

    // 도시 선택 시 지도 업데이트
    useEffect(() => {
        if (filters.city !== "시/군/구") {
            // 선택된 도시로 지도 중심 이동
            searchCityBoundary(filters.region, filters.city)
        } else if (filters.region !== "광역시/도") {
            // 지역 경계 데이터로 복원
            searchRegionBoundary(filters.region)
        }
    }, [filters.city])

    // 카카오맵 API를 사용하여 행정구역 경계 검색
    const searchRegionBoundary = (region) => {
        setIsLoading(true)
        setError(null)
        clearBoundaries()

        if (!window.kakao || !window.kakao.maps) {
            setError("카카오맵 API가 로드되지 않았습니다.")
            setIsLoading(false)
            return
        }

        // 카카오맵 객체가 초기화되었는지 확인
        if (!mapRef.current) {
            setError("지도가 초기화되지 않았습니다.")
            setIsLoading(false)
            return
        }

        // Geocoder 서비스 초기화
        if (!geocoderRef.current) {
            geocoderRef.current = new window.kakao.maps.services.Geocoder()
        }

        // 행정구역 검색
        geocoderRef.current.addressSearch(region, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const bounds = new window.kakao.maps.LatLngBounds()

                // 검색 결과의 좌표로 지도 이동
                const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x)

                // 행정구역 경계 표시 (카카오맵은 직접적인 경계 API를 제공하지 않음)
                // 대신 커스텀 오버레이를 사용하여 경계 표시
                displayCustomBoundary(region, coords, result[0].address, "region")

                bounds.extend(coords)
                mapRef.current.setBounds(bounds)
                // 명시적으로 레벨 설정 (bounds 설정 후)
                mapRef.current.setLevel(regionCenters[region]?.level || 9)

                setIsLoading(false)
            } else {
                setError(`'${region}' 지역을 찾을 수 없습니다.`)
                setIsLoading(false)
            }
        })
    }

    // 시/군/구 경계 검색
    const searchCityBoundary = (region, city) => {
        setIsLoading(true)
        setError(null)
        clearBoundaries()

        if (!window.kakao || !window.kakao.maps) {
            setError("카카오맵 API가 로드되지 않았습니다.")
            setIsLoading(false)
            return
        }

        // 카카오맵 객체가 초기화되었는지 확인
        if (!mapRef.current) {
            setError("지도가 초기화되지 않았습니다.")
            setIsLoading(false)
            return
        }

        // Geocoder 서비스 초기화
        if (!geocoderRef.current) {
            geocoderRef.current = new window.kakao.maps.services.Geocoder()
        }

        // 전체 주소 생성 (예: '서울특별시 강남구')
        const fullAddress = `${region} ${city}`

        // 행정구역 검색
        geocoderRef.current.addressSearch(fullAddress, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const bounds = new window.kakao.maps.LatLngBounds()

                // 검색 결과의 좌표로 지도 이동
                const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x)

                // 행정구역 경계 표시 (커스텀 오버레이 사용)
                displayCustomBoundary(fullAddress, coords, result[0].address, "city")

                bounds.extend(coords)
                mapRef.current.setCenter(coords) // 먼저 중심점 설정

                // 그 다음 레벨 설정 (더 가까이 확대)
                setTimeout(() => {
                    mapRef.current.setLevel(8) // 시군구 수준에서는 더 가까이 확대 (레벨 5로 변경)
                }, 100) // 약간의 지연을 두어 중심점 설정 후 레벨 적용

                setIsLoading(false)
            } else {
                setError(`'${fullAddress}' 지역을 찾을 수 없습니다.`)
                setIsLoading(false)
            }
        })
    }

    // 커스텀 경계 표시 함수
    const displayCustomBoundary = (address, centerCoords, addressInfo, type) => {
        if (!mapRef.current) return

        const map = mapRef.current

        // 지도 레벨에 따라 반경 조정
        let radius = 2000 // 기본 반경 (미터)
        let strokeColor = "#4F6CFF" // 기본 경계선 색상
        let fillColor = "#4F6CFF" // 기본 채우기 색상

        if (type === "region") {
            // 광역시/도 단위일 때
            if (address.includes("특별시") || address.includes("광역시")) {
                radius = 20000 // 광역시/특별시는 더 큰 반경
            } else if (address.includes("도")) {
                radius = 50000 // 도 단위는 큰 반경
            } else if (address.includes("세종")) {
                radius = 15000 // 세종특별자치시
            }
        } else if (type === "city") {
            // 시/군/구 단위일 때 (훨씬 작은 반경 사용)
            strokeColor = "#4F6CFF" // 시/군/구는 다른 색상 사용
            fillColor = "#4F6CFF"

            if (address.includes("구")) {
                radius = 5000 // 구 단위 (더 작게 조정)
            } else if (address.includes("군")) {
                radius = 5000 // 군 단위 (더 작게 조정)
            } else if (address.includes("시") && !address.includes("특별시") && !address.includes("광역시")) {
                radius = 7000 // 일반 시 단위 (더 작게 조정)
            }
        }

        // 원형 경계 생성
        const circle = new window.kakao.maps.Circle({
            center: centerCoords,
            radius: radius,
            strokeWeight: 3,
            strokeColor: strokeColor,
            strokeOpacity: 0.8,
            strokeStyle: "solid",
            fillColor: fillColor,
            fillOpacity: 0.2,
        })

        // 지도에 원 표시
        circle.setMap(map)
        boundaryPolygonsRef.current.push(circle)

        // 지역 이름과 사용자 수 표시
        let count = 0
        const displayName = address.split(" ").pop()

        if (type === "region") {
            count = employeeCounts[address]?.total || 0
        } else if (type === "city") {
            const region = address.split(" ")[0]
            const city = address.split(" ")[1]
            count = employeeCounts[region]?.cities[city] || 0
        }

        // 행정구역 이름 표시 (커스텀 오버레이)
        const content = document.createElement("div")
        content.className = "region-label"
        content.innerHTML = `
  <div style="padding: 5px 10px; background: white; border-radius: 4px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    ${displayName} <span style="color: #4F6CFF;">(${count}명)</span>
  </div>
`

        const customOverlay = new window.kakao.maps.CustomOverlay({
            position: centerCoords,
            content: content,
            yAnchor: 0.5,
        })

        // 지도에 커스텀 오버레이 표시
        customOverlay.setMap(map)
        boundaryLabelsRef.current.push(customOverlay)

        // 행정구역 정보 저장
        setBoundaryData({
            name: address,
            center: { lat: centerCoords.getLat(), lng: centerCoords.getLng() },
            addressInfo: addressInfo,
            type: type,
        })
    }

    // 경계 제거 함수
    const clearBoundaries = () => {
        // 폴리곤 제거
        boundaryPolygonsRef.current.forEach((polygon) => {
            polygon.setMap(null)
        })
        boundaryPolygonsRef.current = []

        // 라벨 제거
        boundaryLabelsRef.current.forEach((label) => {
            label.setMap(null)
        })
        boundaryLabelsRef.current = []
    }

    // 컴포넌트 언마운트 시 경계 제거
    useEffect(() => {
        return () => {
            clearBoundaries()
        }
    }, [])

    // 필터 변경 핸들러
    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
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

    // 현재 필터에 따른 직원 수 가져오기
    const getCurrentEmployeeCount = () => {
        if (filters.region === "광역시/도") {
            // 전체 직원 수 (모든 지역 합산)
            let totalCount = 0
            Object.values(employeeCounts).forEach((regionData) => {
                totalCount += regionData.total
            })
            return totalCount
        } else if (filters.city === "시/군/구") {
            // 선택된 지역의 전체 직원 수
            return employeeCounts[filters.region]?.total || 0
        } else {
            // 선택된 지역 및 도시의 직원 수
            return employeeCounts[filters.region]?.cities[filters.city] || 0
        }
    }

    // 지역별 직원 수 오버레이 렌더링
    const renderEmployeeCountOverlays = () => {
        if (filters.region === "광역시/도") {
            // 모든 지역에 대한 오버레이 표시
            return Object.keys(employeeCounts)
                .map((region) => {
                    if (regionCenters[region] && employeeCounts[region]?.total > 0) {
                        return (
                            <CustomOverlayMap
                                key={region}
                                position={{
                                    lat: regionCenters[region].lat,
                                    lng: regionCenters[region].lng,
                                }}
                                yAnchor={1}
                            >
                                <div className="employee-count-overlay">
                                    <div className="count-bubble">{employeeCounts[region].total}</div>
                                    <div className="count-label">{region}</div>
                                </div>
                            </CustomOverlayMap>
                        )
                    }
                    return null
                })
                .filter(Boolean)
        }
    }

    return (
        <div className="flex min-h-screen w-full bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-[#272F42] text-xl">수거자 배치 현황</p>

                    {/* 필터 UI 추가 */}
                    <div className="relative">
                        <div className="flex flex-wrap gap-7 mt-2 pb-1 font-bold relative z-10">
                            <div className="relative dropdown-container">
                                <button className="flex items-center gap-2 text-[#21262B]" onClick={() => toggleDropdown("region")}>
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
                                    className={`flex items-center gap-2 text-[#21262B] ${isCityDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
                    <div className="h-1"></div>

                    <div className="flex bg-white rounded-2xl shadow-md overflow-hidden h-[570px] relative">
                        <Map
                            center={mapCenter}
                            style={{ width: "100%", height: "100%" }}
                            level={mapLevel}
                            onCreate={(map) => {
                                mapRef.current = map
                            }}
                        >
                            {/* 직원 수 오버레이 렌더링 */}
                            {renderEmployeeCountOverlays()}
                        </Map>

                        {/* 로딩 인디케이터 */}
                        {(isLoading || isLoadingUsers) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                <div className="bg-white p-4 rounded-lg shadow-lg">
                                    <p className="text-gray-700">데이터를 불러오는 중...</p>
                                </div>
                            </div>
                        )}

                        {/* 오류 메시지 */}
                        {error && (
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-md border-l-4 border-red-500">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* 선택된 지역/도시 정보 표시 */}
                        {boundaryData && (
                            <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
                                <p className="font-bold text-sm text-[#21262B]">
                                    {filters.region !== "광역시/도" ? filters.region : ""}
                                    {filters.city !== "시/군/구" ? ` > ${filters.city}` : ""}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {boundaryData.type === "region" ? "광역시/도 단위" : "시/군/구 단위"}
                                </p>
                                <p className="text-xs font-semibold text-blue-600 mt-1">수거자 수: {getCurrentEmployeeCount()}명</p>
                            </div>
                        )}

                        {/* 범례 표시 */}
                        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md">
                            <div className="flex items-center mb-2">
                                <div className="w-4 h-4 rounded-full bg-[#4F6CFF] opacity-60 mr-2"></div>
                                <p className="text-xs text-gray-700">광역시/도</p>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-[#FF6B6B] opacity-60 mr-2"></div>
                                <p className="text-xs text-gray-700">시/군/구</p>
                            </div>
                            <div className="flex items-center mt-2">
                                <div className="w-4 h-4 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full mr-2">
                                    N
                                </div>
                                <p className="text-xs text-gray-700">수거자 수</p>
                            </div>
                        </div>
                    </div>
                    <CollectorAssignment
                        selectedRegion={filters.region}
                        selectedCity={filters.city}
                        employeeCounts={employeeCounts}
                    />
                    <div className="pb-32" />
                </main>
            </div>

            {/* Add custom styles for scrollbar and employee count overlays */}
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

                /* 직원 수 오버레이 스타일 */
                .employee-count-overlay {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                }

                .count-bubble {
                    background-color: #4F6CFF;
                    color: white;
                    font-weight: bold;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    font-size: 12px;
                }

                .count-label {
                    background-color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    margin-top: 4px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                    white-space: nowrap;
                    max-width: 100px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `}</style>
        </div>
    )
}

export default N_collectorAssignmentPage