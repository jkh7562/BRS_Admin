import { useState, useRef, useEffect } from "react"
import SearchIcon from "../assets/검색.png"
import CopyIcon from "../assets/copy.png"
import InfoIcon from "../assets/추가정보2.png"
import DownIcon from "../assets/Down.png"
import UserIcon from "../assets/user.png"
import CollectorCollectionChart from "../component/chart/CollectorCollectionChart"
import { findUserAll, getBoxLog, changeUserLocation } from "../api/apiServices"

function CustomDropdown({ options, value, onChange, width = "200px", disabled = false }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState(value)
    const dropdownRef = useRef(null)

    useEffect(() => {
        setSelectedValue(value)
    }, [value])

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [dropdownRef])

    const handleSelect = (option) => {
        setSelectedValue(option)
        onChange(option)
        setIsOpen(false)
    }

    return (
        <div ref={dropdownRef} className="relative" style={{ width }}>
            <button
                type="button"
                className={`w-full px-3 py-2 border border-black/20 rounded-lg text-base text-left flex justify-between items-center ${
                    disabled ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <span>{selectedValue}</span>
                {!disabled && <img src={DownIcon || "/placeholder.svg"} alt="Down" className="ml-2 w-3 h-2" />}
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-black/20 rounded-lg shadow-lg max-h-[200px] overflow-y-auto custom-dropdown-scrollbar">
                    {options.map((option) => (
                        <div
                            key={option}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${option === selectedValue ? "bg-gray-100" : ""}`}
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function CollectorAssignment({ selectedRegion, selectedCity, employeeCounts, onLocationChange }) {
    // 검색어 상태 변수 추가
    const [searchTerm, setSearchTerm] = useState("")

    // 수거자 목록 데이터 추가
    const [collectors, setCollectors] = useState([])
    const [loading, setLoading] = useState(true)
    const [collectionAmounts, setCollectionAmounts] = useState({})

    // 배터리 타입 선택 상태 추가
    const [selectedBatteryType, setSelectedBatteryType] = useState("전체")

    // Fetch users when component mounts
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                const users = await findUserAll()
                // Filter users to only include those with ROLE_EMPLOYEE role
                const employeeUsers = users.filter((user) => user.role === "ROLE_EMPLOYEE")

                // Map the API response to match our component's expected format
                const formattedUsers = employeeUsers.map((user) => ({
                    id: user.id,
                    name: user.name || "이름 없음",
                    points: user.point || 0,
                    date: formatDate(user.date),
                    isActive: false,
                    location1: user.location1 || "",
                    location2: user.location2 || "",
                    phoneNumber: user.phone_number || "",
                }))

                setCollectors(formattedUsers)

                // 모든 사용자의 수거량 정보 가져오기
                await fetchAllUserCollectionAmounts(formattedUsers)
            } catch (error) {
                console.error("Error fetching users:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    // 모든 사용자의 수거량 정보를 가져오는 함수
    const fetchAllUserCollectionAmounts = async (users) => {
        try {
            const amounts = {}

            // 각 사용자별로 수거함 로그를 가져와서 총 수거량 계산
            await Promise.all(
                users.map(async (user) => {
                    try {
                        const logs = await getBoxLog(user.id)
                        // 총 수거량 계산 (모든 로그의 value 합계)
                        const totalAmount = logs.reduce((sum, log) => sum + (log.value || 0), 0)
                        amounts[user.id] = totalAmount
                    } catch (error) {
                        console.error(`Error fetching box logs for user ${user.id}:`, error)
                        amounts[user.id] = 0
                    }
                }),
            )

            setCollectionAmounts(amounts)
        } catch (error) {
            console.error("Error fetching collection amounts:", error)
        }
    }

    // Add a helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date
            .toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            })
            .replace(/\. /g, ".")
            .replace(/\.$/, "")
    }

    // 선택된 수거자 상태 추가
    const [selectedCollector, setSelectedCollector] = useState(null)
    const [boxLogs, setBoxLogs] = useState([])

    // Fetch box logs when component mounts
    useEffect(() => {
        const fetchBoxLogs = async () => {
            try {
                const logs = await getBoxLog()
                setBoxLogs(logs || [])
            } catch (error) {
                console.error("Error fetching box logs:", error)
                setBoxLogs([])
            }
        }

        fetchBoxLogs()
    }, [])

    // 컴포넌트 마운트 시 기본 선택 수거자 설정
    useEffect(() => {
        // 기본적으로 첫 번째 수거자 선택 또는 isActive가 true인 수거자 선택
        const defaultCollector = collectors.find((c) => c.isActive) || collectors[0]
        setSelectedCollector(defaultCollector)
    }, [collectors])

    // 수거자 선택 핸들러 함수 추가
    const handleCollectorSelect = (collector) => {
        setSelectedCollector(collector)
        // 선택된 수거자의 담당 지역 정보로 드롭다운 값 업데이트
        if (collector) {
            setCollectorRegion(collector.location1 || "")
            setCollectorCity(collector.location2 || "")
        }
    }

    // 변수명 충돌 문제를 해결하기 위해 내부 state 변수명을 변경합니다.
    const [selectedPeriod, setSelectedPeriod] = useState("일")

    // 수거자의 담당 지역 정보를 저장하는 상태
    const [collectorRegion, setCollectorRegion] = useState("")
    const [collectorCity, setCollectorCity] = useState("")

    // 부모로부터 받은 필터링 지역 정보
    const [filterRegion, setFilterRegion] = useState(selectedRegion || "광역시/도")
    const [filterCity, setFilterCity] = useState(selectedCity || "시/군/구")

    // 부모 컴포넌트에서 전달받은 지역 정보가 변경될 때 필터링 상태 업데이트
    useEffect(() => {
        if (selectedRegion) {
            setFilterRegion(selectedRegion)
        }
        if (selectedCity) {
            setFilterCity(selectedCity)
        }
    }, [selectedRegion, selectedCity])

    // 선택된 수거자가 변경될 때 담당 지역 정보 업데이트
    useEffect(() => {
        if (selectedCollector) {
            setCollectorRegion(selectedCollector.location1 || "")
            setCollectorCity(selectedCollector.location2 || "")
        }
    }, [selectedCollector])

    // 검색어와 지역 정보에 따라 필터링된 수거자 목록 계산
    const filteredCollectors = collectors.filter((collector) => {
        // 이름으로 필터링
        const nameMatch = collector.name.toLowerCase().includes(searchTerm.toLowerCase())

        // 지역 필터링
        let regionMatch = true
        if (filterRegion && filterRegion !== "광역시/도") {
            regionMatch = collector.location1 === filterRegion
        }

        // 도시 필터링
        let cityMatch = true
        if (filterCity && filterCity !== "시/군/구" && regionMatch) {
            cityMatch = collector.location2 === filterCity
        }

        return nameMatch && regionMatch && cityMatch
    })

    const [tooltips, setTooltips] = useState({
        province: false,
        city: false,
    })

    // 복사된 사용자 ID 상태 추가
    const [copiedId, setCopiedId] = useState(null)

    // 복사 핸들러 함수 수정
    const handleCopy = (e, userId, text) => {
        e.stopPropagation()

        try {
            const textArea = document.createElement("textarea")
            textArea.value = text

            textArea.style.position = "fixed"
            textArea.style.left = "-999999px"
            textArea.style.top = "-999999px"
            document.body.appendChild(textArea)

            textArea.focus()
            textArea.select()

            const successful = document.execCommand("copy")

            document.body.removeChild(textArea)

            if (successful) {
                setCopiedId(userId)

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

    // 툴팁 토글 함수
    const toggleTooltip = (name, e) => {
        e.stopPropagation()
        setTooltips((prev) => ({
            ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
            [name]: !prev[name],
        }))
    }

    // 툴팁 외부 클릭 시 닫기 함수
    const handleClickOutside = (e) => {
        if (!e.target.closest(".tooltip-container")) {
            setTooltips((prev) => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}))
        }
    }

    // 컴포넌트가 마운트될 때 document에 이벤트 리스너 추가
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // 툴팁 컴포넌트
    const Tooltip = ({ isVisible, content, position = "right" }) => {
        if (!isVisible) return null

        const positionClass = position === "right" ? "right-0 mt-2" : position === "left" ? "left-0 mt-2" : "right-0 mt-2"

        const arrowPositionClass = position === "left" ? "left-1" : "right-1"

        return (
            <div
                className={`absolute ${positionClass} w-64 bg-white text-gray-800 rounded-md shadow-lg p-4`}
                style={{ zIndex: 99999 }}
            >
                <div className={`absolute -top-2 ${arrowPositionClass} w-4 h-4 bg-white transform rotate-45`}></div>
                {content}
            </div>
        )
    }

    // 지역 및 도시 데이터
    const regionData = {
        "광역시/도": [],
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

    // 담당 지역 변경 핸들러
    const handleRegionChange = (region) => {
        setCollectorRegion(region)
        setCollectorCity("")
    }

    // 담당 도시 변경 핸들러
    const handleCityChange = (city) => {
        setCollectorCity(city)
    }

    // 변경사항 저장 핸들러
    const [isSaving, setIsSaving] = useState(false)

    // 마지막 수거 로그 날짜를 가져오는 함수
    const getLastCollectionDate = (collectorId) => {
        if (!collectorId || !boxLogs || boxLogs.length === 0) return "기록 없음"

        // 해당 수거자의 수거 로그만 필터링
        const collectorLogs = boxLogs.filter((entry) => {
            const { boxLog } = entry
            return boxLog && boxLog.type === "수거" && boxLog.collectorId === collectorId
        })

        if (collectorLogs.length === 0) return "기록 없음"

        // 가장 최근 수거 로그 찾기
        const latestLog = collectorLogs.reduce((latest, current) => {
            if (!latest.boxLog || !latest.boxLog.date) return current
            if (!current.boxLog || !current.boxLog.date) return latest

            const currentDate = new Date(current.boxLog.date)
            const latestDate = new Date(latest.boxLog.date)
            return currentDate > latestDate ? current : latest
        })

        if (!latestLog.boxLog || !latestLog.boxLog.date) return "기록 없음"

        return formatDate(latestLog.boxLog.date)
    }

    const handleSaveChanges = async () => {
        if (!selectedCollector || !collectorRegion || !collectorCity) return

        try {
            setIsSaving(true)

            await changeUserLocation(selectedCollector.id, collectorRegion, collectorCity)

            const updatedCollectors = collectors.map((collector) => {
                if (collector.id === selectedCollector.id) {
                    return {
                        ...collector,
                        location1: collectorRegion,
                        location2: collectorCity,
                    }
                }
                return collector
            })

            setCollectors(updatedCollectors)

            setSelectedCollector({
                ...selectedCollector,
                location1: collectorRegion,
                location2: collectorCity,
            })

            alert("담당 지역이 변경되었습니다.")

            if (typeof onLocationChange === "function") {
                onLocationChange(selectedCollector.id, collectorRegion, collectorCity)
            } else {
                window.location.reload()
            }
        } catch (error) {
            console.error("담당 지역 변경 실패:", error)
            alert("담당 지역 변경에 실패했습니다. 다시 시도해주세요.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col md:flex-row bg-white h-[525px] rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-full md:w-[350px] h-full flex flex-col shadow-lg">
                <div className="p-3">
                    <div className="flex items-center justify-between mx-4"></div>
                    <div className="relative mt-4">
                        <input
                            type="text"
                            placeholder="수거자 이름 검색"
                            className="w-full pl-4 pr-4 py-2 text-sm border border border-black/20 rounded-2xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-5 top-2 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg"} alt="검색" className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* 사용자 목록 영역에만 스크롤바 적용 */}
                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    {loading ? (
                        <div className="p-4 text-center">데이터를 불러오는 중...</div>
                    ) : filteredCollectors.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">검색 결과가 없습니다</div>
                    ) : (
                        filteredCollectors.map((collector) => (
                            <UserListItem
                                key={collector.id}
                                userId={collector.id}
                                name={collector.name}
                                collectionAmount={collectionAmounts[collector.id] || 0}
                                date={collector.date}
                                location1={collector.location1}
                                location2={collector.location2}
                                isActive={selectedCollector && selectedCollector.id === collector.id}
                                onClick={() => handleCollectorSelect(collector)}
                                handleCopy={handleCopy}
                                copiedId={copiedId}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row h-full">
                {/* Center Section - User Stats */}
                <div className="flex-1 h-full flex flex-col overflow-hidden p-4">
                    <div className="p-4">
                        {/* User profile section */}
                        {selectedCollector && (
                            <div className="flex">
                                <div className="mr-4">
                                    <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                                        <img
                                            src={UserIcon || "/placeholder.svg"}
                                            alt="프로필 이미지"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#21262B] text-lg">{selectedCollector.name}</h2>
                                    <div className="flex">
                                        <p className="text-sm text-[#60697E]">
                                            <span className="font-bold">가입일자</span>{" "}
                                            <span className="font-normal">{selectedCollector.date}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="ml-auto pt-7 pr-2">
                                    <p className="text-sm font-medium text-gray-500">
                                        마지막 이용일 {getLastCollectionDate(selectedCollector.id)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Stats Cards */}
                        <div className="flex flex-col md:flex-row items-start md:items-center mt-6 mb-6">
                            <div className="py-4 relative">
                                <div className="flex items-center justify-start gap-2 mb-2">
                                    <span className="text-sm font-normal text-[#60697E]">광역시/도</span>
                                    <div className="tooltip-container relative">
                                        <img
                                            src={InfoIcon || "/placeholder.svg"}
                                            alt="정보"
                                            className="w-4 h-4 object-contain cursor-pointer"
                                            onClick={(e) => toggleTooltip("province", e)}
                                        />
                                        {tooltips.province && (
                                            <Tooltip
                                                isVisible={tooltips.province}
                                                position="left"
                                                content={
                                                    <>
                                                        <h3 className="font-bold text-sm mb-2">광역시/도</h3>
                                                        <p className="text-xs">수거자가 담당하는 광역시/도를 선택합니다.</p>
                                                        <p className="text-xs mt-2">선택한 광역시/도에 따라 시/군/구 목록이 변경됩니다.</p>
                                                    </>
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="dropdown-container">
                                    <CustomDropdown
                                        options={Object.keys(regionData).filter((r) => r !== "광역시/도")}
                                        value={collectorRegion || "광역시/도를 선택하세요"}
                                        onChange={handleRegionChange}
                                        width="200px"
                                        disabled={!selectedCollector}
                                    />
                                </div>
                            </div>

                            <div className="w-8 md:w-4"></div>

                            <div className="py-4 relative">
                                <div className="flex items-center justify-start gap-2 mb-2">
                                    <span className="text-sm font-normal text-[#60697E]">시/군/구</span>
                                    <div className="tooltip-container relative">
                                        <img
                                            src={InfoIcon || "/placeholder.svg"}
                                            alt="정보"
                                            className="w-4 h-4 object-contain cursor-pointer"
                                            onClick={(e) => toggleTooltip("city", e)}
                                        />
                                        {tooltips.city && (
                                            <Tooltip
                                                isVisible={tooltips.city}
                                                content={
                                                    <>
                                                        <h3 className="font-bold text-sm mb-2">시/군/구</h3>
                                                        <p className="text-xs">수거자가 담당하는 시/군/구를 선택합니다.</p>
                                                        <p className="text-xs mt-2">선택한 지역의 수거함을 담당하게 됩니다.</p>
                                                    </>
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="dropdown-container">
                                    <CustomDropdown
                                        options={regionData[collectorRegion] || []}
                                        value={collectorCity || "시/군/구를 선택하세요"}
                                        onChange={handleCityChange}
                                        width="200px"
                                        disabled={!collectorRegion || !selectedCollector}
                                    />
                                </div>
                            </div>

                            <div className="h-12 flex items-center pt-6 md:mt-0 md:ml-[20px]">
                                <button
                                    className={`px-6 py-2 rounded-2xl transition-colors ${
                                        !collectorRegion || !collectorCity
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-[#E8F1F7] text-[#21262B] hover:bg-gray-200"
                                    }`}
                                    onClick={handleSaveChanges}
                                    disabled={!collectorRegion || !collectorCity || !selectedCollector || isSaving}
                                >
                                    {isSaving ? "저장 중..." : "변경사항 저장"}
                                </button>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="mb-3">
                            <div className="tabs">
                                {/* 배터리 타입 선택 탭 추가 */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <div className="absolute bottom-0 left-0 w-full border-b border-gray-200" />
                                        <div className="flex gap-6">
                                            {["전체", "건전지", "방전 배터리", "잔여 용량 배터리"].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setSelectedBatteryType(type)}
                                                    className={`pb-2 text-sm font-medium transition-colors ${
                                                        selectedBatteryType === type
                                                            ? "border-b-2 border-black text-[#21262B]"
                                                            : "text-[#60697E] hover:text-[#21262B]"
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 시간 단위 선택 */}
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                        {["연", "월", "일"].map((period) => (
                                            <button
                                                key={period}
                                                onClick={() => setSelectedPeriod(period)}
                                                className={`px-3 py-1 text-sm font-medium transition-colors ${
                                                    selectedPeriod === period
                                                        ? "bg-[#21262B] text-white"
                                                        : "bg-white text-[#60697E] hover:bg-gray-50"
                                                }`}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="tab-content">
                                    {/* CollectorCollectionChart 컴포넌트 사용 */}
                                    <CollectorCollectionChart
                                        boxLogs={boxLogs}
                                        collectorId={selectedCollector?.id}
                                        selectedPeriod={selectedPeriod}
                                        selectedBatteryType={selectedBatteryType}
                                    />

                                    {/* Slider pagination */}
                                    <div className="flex items-center justify-center mt-4">
                                        <button className="px-2 text-sm text-gray-400 hover:text-gray-600">&lt;</button>
                                        <div className="w-64 h-2 bg-gray-200 rounded-full relative mx-2">
                                            <div className="absolute left-0 w-1/3 h-full bg-gray-700 rounded-full"></div>
                                        </div>
                                        <button className="px-2 text-sm text-gray-400 hover:text-gray-600">&gt;</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

            {/* Custom styles for dropdown scrollbar */}
            <style jsx global>{`
        .custom-dropdown-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-dropdown-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-dropdown-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d1d1;
          border-radius: 10px;
        }
        
        .custom-dropdown-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b1b1b1;
        }
      `}</style>
        </div>
    )
}

// Update the UserListItem component to display collection amount instead of points
function UserListItem({
                          name,
                          userId,
                          collectionAmount,
                          date,
                          location1,
                          location2,
                          isActive,
                          onClick,
                          handleCopy,
                          copiedId,
                      }) {
    return (
        <div
            className={`p-4 border-b flex items-center justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div>
                <h3 className="text-base text-[#21262B] font-bold">{name}</h3>
                <p className="text-sm font-normal text-[#60697E] mt-1">총 수거량 {collectionAmount}</p>
                {location1 && (
                    <p className="text-xs font-normal text-blue-600 mt-1">
                        담당: {location1} {location2 && `> ${location2}`}
                    </p>
                )}
            </div>
            <div className="pb-10 text-gray-400 relative">
                <button onClick={(e) => handleCopy(e, userId, name)}>
                    <img src={CopyIcon || "/placeholder.svg"} alt="복사" className="w-4 h-5" />
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