import { useState, useEffect } from "react"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import InfoIcon from "../../assets/추가정보2.png"
import LineIcon from "../../assets/구분선.png"
import UserIcon from "../../assets/user.png"
import { findUserAll, getBoxLog } from "../../api/apiServices" // API 임포트
import CollectorCollectionChart from "../chart/CollectorCollectionChart" // 차트 컴포넌트 임포트

export default function CollectorInfoSection() {
    const [selectedPeriod, setSelectedPeriod] = useState("일")
    const [collectors, setCollectors] = useState([])
    const [selectedCollector, setSelectedCollector] = useState(null)
    const [boxLogs, setBoxLogs] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState({
        collectors: true,
        boxLogs: true,
    })
    const [copiedId, setCopiedId] = useState(null)

    // 배터리 타입 선택 상태 추가
    const [selectedBatteryType, setSelectedBatteryType] = useState("전체")

    const handleCopy = (e, userId, text) => {
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

    // 툴팁 상태 관리 추가
    const [tooltips, setTooltips] = useState({
        totalCollection: false,
        province: false,
        city: false,
    })

    // 툴팁 토글 함수
    const toggleTooltip = (name, e) => {
        e.stopPropagation() // 이벤트 버블링 방지
        setTooltips((prev) => ({
            ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), // 모든 툴팁 닫기
            [name]: !prev[name], // 선택한 툴팁만 토글
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

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // 수거자 목록 불러오기 (ROLE_EMPLOYEE만 필터링)
    useEffect(() => {
        const loadCollectors = async () => {
            try {
                setLoading((prev) => ({ ...prev, collectors: true }))
                const allUsers = await findUserAll()
                // ROLE_EMPLOYEE만 필터링
                const filteredCollectors = allUsers.filter((user) => user.role === "ROLE_EMPLOYEE")
                setCollectors(filteredCollectors)

                // 첫 번째 수거자를 기본 선택
                if (filteredCollectors.length > 0) {
                    setSelectedCollector(filteredCollectors[0])
                }
            } catch (error) {
                console.error("수거자 목록 로딩 실패:", error)
            } finally {
                setLoading((prev) => ({ ...prev, collectors: false }))
            }
        }

        loadCollectors()
    }, [])

    // 박스 로그 데이터 불러오기
    useEffect(() => {
        const loadBoxLogs = async () => {
            try {
                setLoading((prev) => ({ ...prev, boxLogs: true }))
                const logs = await getBoxLog()
                setBoxLogs(logs || [])
            } catch (error) {
                console.error("박스 로그 로딩 실패:", error)
                setBoxLogs([])
            } finally {
                setLoading((prev) => ({ ...prev, boxLogs: false }))
            }
        }

        loadBoxLogs()
    }, [])

    // 수거자 선택 핸들러
    const handleCollectorSelect = (collector) => {
        setSelectedCollector(collector)
    }

    // 검색어로 수거자 필터링
    const filteredCollectors = collectors.filter(
        (collector) => collector.name && collector.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // 선택된 수거자의 총 수거량 계산 (배터리 타입별)
    const getCollectorTotalAmount = (batteryType = "전체") => {
        if (!selectedCollector || !boxLogs) return "0개"

        // 선택된 수거자의 수거 로그만 필터링
        const collectorLogs = boxLogs.filter((entry) => {
            const { boxLog } = entry
            return boxLog && boxLog.type === "수거" && boxLog.collectorId === selectedCollector.id
        })

        let totalAmount = 0
        collectorLogs.forEach(({ items }) => {
            if (items && Array.isArray(items)) {
                if (batteryType === "전체") {
                    const totalCount = items.reduce((sum, item) => sum + (item.count || 0), 0)
                    totalAmount += totalCount
                } else {
                    const batteryTypeMap = {
                        건전지: "battery",
                        "방전 배터리": "discharged",
                        "잔여 용량 배터리": "undischarged",
                    }

                    const targetType = batteryTypeMap[batteryType]
                    const targetItem = items.find((item) => item.name === targetType)
                    totalAmount += targetItem ? targetItem.count || 0 : 0
                }
            }
        })

        return `${totalAmount.toLocaleString()}개`
    }

    // 선택된 수거자의 담당 지역 정보 가져오기
    const getCollectorRegion = () => {
        if (!selectedCollector) return { province: "정보 없음", city: "정보 없음" }

        // location1과 location2 필드에서 지역 정보 가져오기
        const province = selectedCollector.location1 || "정보 없음"
        const city = selectedCollector.location2 || "정보 없음"

        return { province, city }
    }

    const region = getCollectorRegion()

    return (
        <div className="flex flex-col md:flex-row bg-white h-[525px] rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - Collector List */}
            <div className="w-full md:w-[350px] h-full flex flex-col shadow-lg">
                <div className="p-3 pt-8">
                    <div className="flex items-center justify-between mx-4">
                        <h2 className="text-2xl text-[#21262B] font-bold">총 수거자 수 {collectors.length}명</h2>
                    </div>
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

                {/* 수거자 목록 영역에만 스크롤바 적용 */}
                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    {loading.collectors ? (
                        <div className="p-4 text-center">수거자 목록을 불러오는 중...</div>
                    ) : filteredCollectors.length === 0 ? (
                        <div className="p-4 text-center">수거자가 없습니다.</div>
                    ) : (
                        filteredCollectors.map((collector) => (
                            <UserListItem
                                key={collector.id}
                                collectorId={collector.id}
                                name={collector.name}
                                points={getCollectorAmount(collector.id, boxLogs)}
                                date={formatDate(collector.date)}
                                isActive={selectedCollector && selectedCollector.id === collector.id}
                                onClick={() => handleCollectorSelect(collector)}
                                handleCopy={handleCopy}
                                copiedId={copiedId}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Main Content - 전체 너비로 확장 */}
            {selectedCollector ? (
                <div className="flex-1 h-full flex flex-col overflow-hidden p-4">
                    <div className="p-4">
                        {/* Collector profile section */}
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
                                        <span className="font-normal">{formatDate(selectedCollector.date)}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="ml-auto pt-7 pr-2">
                                <p className="text-sm font-medium text-gray-500">
                                    마지막 이용일 {getLastActiveDate(selectedCollector.id, boxLogs)}
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex items-center mt-6 mb-6">
                            <StatCard
                                title={`총 수거량 (${selectedBatteryType})`}
                                value={getCollectorTotalAmount(selectedBatteryType)}
                                tooltipVisible={tooltips.totalCollection}
                                onTooltipToggle={(e) => toggleTooltip("totalCollection", e)}
                                tooltipContent={
                                    <>
                                        <h3 className="font-bold text-sm mb-2">총 수거량</h3>
                                        <p className="text-xs">
                                            수거자가 지금까지 수거한 {selectedBatteryType === "전체" ? "모든 " : `${selectedBatteryType} `}
                                            배터리의 총 개수입니다.
                                        </p>
                                    </>
                                }
                                tooltipPosition="left"
                            />
                            <div className="h-12 flex items-center">
                                <img src={LineIcon || "/placeholder.svg"} alt="구분선" className="h-full mx-11" />
                            </div>
                            <StatCard
                                title="광역시/도"
                                value={region.province}
                                tooltipVisible={tooltips.province}
                                onTooltipToggle={(e) => toggleTooltip("province", e)}
                                tooltipContent={
                                    <>
                                        <h3 className="font-bold text-sm mb-2">광역시/도</h3>
                                        <p className="text-xs">수거자가 담당하는 광역시/도 정보입니다.</p>
                                        <p className="text-xs mt-2">담당 지역은 관리자가 수정할 수 있습니다.</p>
                                    </>
                                }
                            />
                            <div className="h-12 flex items-center">
                                <img src={LineIcon || "/placeholder.svg"} alt="구분선" className="h-full mx-11" />
                            </div>
                            <StatCard
                                title="시/군/구"
                                value={region.city}
                                tooltipVisible={tooltips.city}
                                onTooltipToggle={(e) => toggleTooltip("city", e)}
                                tooltipContent={
                                    <>
                                        <h3 className="font-bold text-sm mb-2">시/군/구</h3>
                                        <p className="text-xs">수거자가 담당하는 시/군/구 정보입니다.</p>
                                        <p className="text-xs mt-2">담당 지역은 관리자가 수정할 수 있습니다.</p>
                                    </>
                                }
                            />
                        </div>

                        {/* Chart Section */}
                        <div className="mb-3">
                            <div className="tabs">
                                {/* 배터리 타입 선택 탭 - UserInfoSection과 동일한 스타일 */}
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
                                    {/* Recharts 기반 차트 컴포넌트 사용 */}
                                    <CollectorCollectionChart
                                        boxLogs={boxLogs}
                                        collectorId={selectedCollector.id}
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
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p>수거자를 선택해주세요.</p>
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

// 수거자 목록 아이템 컴포넌트
function UserListItem({ collectorId, name, points, date, isActive, onClick, handleCopy, copiedId }) {
    return (
        <div
            className={`p-4 border-b flex items-center justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div>
                <h3 className="text-base text-[#21262B] font-bold">{name}</h3>
                <p className="text-sm text-[#60697E] font-normal text-gray-500 mt-1">총 수거량 {points}</p>
                <p className="text-sm text-[#60697E] font-normal text-gray-500">{date}</p>
            </div>
            <div className="pb-10 text-gray-400 relative">
                <button onClick={(e) => handleCopy(e, collectorId, name)}>
                    <img src={CopyIcon || "/placeholder.svg"} alt="복사" className="w-4 h-5" />
                </button>
                {copiedId === collectorId && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                        ✓
                    </div>
                )}
            </div>
        </div>
    )
}

// 통계 카드 컴포넌트 - 툴팁 기능 추가
function StatCard({ title, value, tooltipVisible, onTooltipToggle, tooltipContent, tooltipPosition = "right" }) {
    return (
        <div className="py-4 relative">
            <div className="flex items-center justify-start gap-2 mb-2">
                <span className="text-sm font-normal text-[#60697E]">{title}</span>
                <div className="tooltip-container relative">
                    <img
                        src={InfoIcon || "/placeholder.svg"}
                        alt="정보"
                        className="w-4 h-4 object-contain cursor-pointer"
                        onClick={onTooltipToggle}
                    />
                    {tooltipVisible && (
                        <div
                            className={`absolute ${tooltipPosition === "left" ? "left-0" : "right-0"} mt-2 w-64 bg-white text-gray-800 rounded-md shadow-lg p-4`}
                            style={{ zIndex: 99999, position: "absolute" }}
                        >
                            <div
                                className={`absolute -top-2 ${tooltipPosition === "left" ? "left-1" : "right-1"} w-4 h-4 bg-white transform rotate-45`}
                            ></div>
                            {tooltipContent}
                        </div>
                    )}
                </div>
            </div>
            <div className="text-[22px] text-[#21262B] font-bold">{value}</div>
        </div>
    )
}

// 유틸리티 함수들
function formatDate(dateString) {
    if (!dateString) return "N/A"

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

function getCollectorAmount(collectorId, boxLogs) {
    if (!collectorId || !boxLogs || boxLogs.length === 0) return 0

    const collectorLogs = boxLogs.filter((entry) => {
        const { boxLog } = entry
        return boxLog && boxLog.type === "수거" && boxLog.collectorId === collectorId
    })

    let totalAmount = 0
    collectorLogs.forEach(({ items }) => {
        if (items && Array.isArray(items)) {
            const totalCount = items.reduce((sum, item) => sum + (item.count || 0), 0)
            totalAmount += totalCount
        }
    })

    return totalAmount.toLocaleString()
}

function getLastActiveDate(collectorId, boxLogs) {
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