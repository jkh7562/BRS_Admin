import { useState, useEffect } from "react"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import InfoIcon from "../../assets/추가정보2.png"
import LineIcon from "../../assets/구분선.png"
import VectorIcon from "../../assets/Vector.png"
import UserIcon from "../../assets/user.png"
import { findUserAll, getBoxLog, findAllBox } from "../../api/apiServices" // API 임포트

export default function CollectorInfoSection() {
    const [selectedPeriod, setSelectedPeriod] = useState("일")
    const [collectors, setCollectors] = useState([])
    const [selectedCollector, setSelectedCollector] = useState(null)
    const [boxLogs, setBoxLogs] = useState([])
    const [boxData, setBoxData] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState({
        collectors: true,
        boxLogs: true,
        boxData: true,
    })
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (e, userId, text) => {
        e.stopPropagation(); // 이벤트 버블링 방지

        try {
            // 임시 텍스트 영역 생성
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // 화면 밖으로 위치시키기
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);

            // 텍스트 선택 및 복사
            textArea.focus();
            textArea.select();

            const successful = document.execCommand("copy");

            // 임시 요소 제거
            document.body.removeChild(textArea);

            if (successful) {
                // 복사 성공
                setCopiedId(userId);
                setTimeout(() => {
                    setCopiedId(null);
                }, 1500);
            } else {
                console.error("execCommand 복사 실패");
            }
        } catch (err) {
            console.error("복사 실패:", err);
        }
    };

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

    // 박스 정보 불러오기
    useEffect(() => {
        const loadBoxData = async () => {
            try {
                setLoading((prev) => ({ ...prev, boxData: true }))
                const boxes = await findAllBox()
                setBoxData(boxes || [])
            } catch (error) {
                console.error("박스 데이터 로딩 실패:", error)
                setBoxData([])
            } finally {
                setLoading((prev) => ({ ...prev, boxData: false }))
            }
        }

        loadBoxData()
    }, [])

    // 수거자 선택 핸들러
    const handleCollectorSelect = (collector) => {
        setSelectedCollector(collector)
    }

    // 검색어로 수거자 필터링
    const filteredCollectors = collectors.filter(
        (collector) => collector.name && collector.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // 선택된 수거자의 총 수거량 계산
    const getCollectorTotalAmount = () => {
        if (!selectedCollector || !boxLogs) return "0g"

        // 선택된 수거자의 ID로 박스 로그 필터링
        const collectorLogs = boxLogs.filter((log) => log.collectorId === selectedCollector.id)
        const totalAmount = collectorLogs.reduce((total, log) => total + (log.amount || 0), 0)

        return `${totalAmount.toLocaleString()}g`
    }

    // 선택된 수거자의 담당 지역 정보 가져오기
    const getCollectorRegion = () => {
        if (!selectedCollector) return { province: "정보 없음", city: "정보 없음" }

        // 지역 정보가 있는 경우 파싱
        const location = selectedCollector.location || ""
        const parts = location.split(" ")

        if (parts.length >= 2) {
            return {
                province: parts[0] || "정보 없음",
                city: parts[1] || "정보 없음",
            }
        }

        return { province: location || "정보 없음", city: "정보 없음" }
    }

    // 차트 데이터 생성
    const generateChartData = () => {
        if (!selectedCollector || !boxLogs) {
            return Array(11)
                .fill(0)
                .map((_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - (10 - i))
                    return {
                        height: 0,
                        date: `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`,
                    }
                })
        }

        // 최근 11일 데이터 생성
        const chartData = []
        const today = new Date()

        for (let i = 10; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`

            // 해당 날짜의 수거자 로그 찾기
            const dayLogs = boxLogs.filter((log) => {
                if (!log.date || !log.collectorId) return false

                const logDate = new Date(log.date)
                return (
                    logDate.getDate() === date.getDate() &&
                    logDate.getMonth() === date.getMonth() &&
                    logDate.getFullYear() === date.getFullYear() &&
                    log.collectorId === selectedCollector.id
                )
            })

            // 해당 날짜의 총 수거량 계산
            const dayAmount = dayLogs.reduce((total, log) => total + (log.amount || 0), 0)

            // 높이는 최대값(2000g) 기준으로 퍼센트 계산
            const height = Math.min(100, (dayAmount / 2000) * 100)

            chartData.push({ date: dateStr, height })
        }

        return chartData
    }

    // 알림 내역 생성 (박스 데이터 기반)
    const generateNotifications = () => {
        if (!boxData || !selectedCollector) return []

        // 선택된 수거자의 담당 지역 박스만 필터링
        const collectorBoxes = boxData.filter((box) => {
            if (!box.location || !selectedCollector.location) return false
            return box.location.includes(selectedCollector.location)
        })

        // 알림 내역 생성 (최신순 정렬)
        return collectorBoxes
            .map((box) => {
                // 박스 상태에 따라 알림 상태 결정
                let status = "수거함 설치 완료"
                if (box.status === "INSTALLING") status = "수거함 설치 진행 중"
                else if (box.status === "REMOVING") status = "수거함 제거 진행 중"
                else if (box.status === "REMOVED") status = "수거함 제거 완료"
                else if (box.status === "MAINTENANCE") status = "화재 후 재가동 완료"

                // 날짜 포맷팅
                const date = box.installDate || box.lastUpdated || new Date()
                const formattedDate = new Date(date)
                    .toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    })
                    .replace(/\. /g, ".")
                    .replace(/\.$/, "")

                const formattedTime = new Date(date).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                })

                return {
                    status,
                    date: formattedDate,
                    time: formattedTime,
                    location: box.location || "위치 정보 없음",
                    coordinates: box.coordinates || "36.123123 / 127.34567", // 좌표 정보가 없는 경우 기본값
                }
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10) // 최근 10개만
    }

    // 툴팁 컴포넌트
    const Tooltip = ({ isVisible, content, position = "right" }) => {
        if (!isVisible) return null

        const positionClass = position === "right" ? "right-0 mt-2" : position === "left" ? "left-0 mt-2" : "right-0 mt-2"

        // 화살표 위치 클래스 추가
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

    const region = getCollectorRegion()
    const chartData = generateChartData()
    const notifications = generateNotifications()

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

            {/* Main Content */}
            {selectedCollector ? (
                <div className="flex-1 flex flex-col md:flex-row h-full">
                    {/* Center Section - Collector Stats */}
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
                                    title="총 수거량"
                                    value={getCollectorTotalAmount()}
                                    tooltipVisible={tooltips.totalCollection}
                                    onTooltipToggle={(e) => toggleTooltip("totalCollection", e)}
                                    tooltipContent={
                                        <>
                                            <h3 className="font-bold text-sm mb-2">총 수거량</h3>
                                            <p className="text-xs">수거자가 지금까지 수거한 배터리의 총량입니다.</p>
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
                                <div className="h-12 flex items-center ml-[100px]">
                                    <button
                                        className="bg-[#E8F1F7] text-[#21262B] px-6 py-2 rounded-2xl hover:bg-gray-200 transition-colors"
                                        onClick={() => console.log("담당지역 변경 clicked")}
                                    >
                                        담당지역 변경
                                    </button>
                                </div>
                            </div>

                            {/* Chart Section */}
                            <div className="mb-3">
                                <div className="tabs">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex border rounded-md overflow-hidden">
                                            <button
                                                className={`px-4 py-1.5 text-sm ${selectedPeriod === "연" ? "bg-gray-900 text-white font-medium" : ""}`}
                                                onClick={() => setSelectedPeriod("연")}
                                            >
                                                연
                                            </button>
                                            <button
                                                className={`px-4 py-1.5 text-sm ${selectedPeriod === "월" ? "bg-gray-900 text-white font-medium" : ""}`}
                                                onClick={() => setSelectedPeriod("월")}
                                            >
                                                월
                                            </button>
                                            <button
                                                className={`px-4 py-1.5 text-sm ${selectedPeriod === "일" ? "bg-gray-900 text-white font-medium" : ""}`}
                                                onClick={() => setSelectedPeriod("일")}
                                            >
                                                일
                                            </button>
                                        </div>
                                        <button className="text-sm font-medium text-[#60697E]">
                                            수거 로그 자세히보기{" "}
                                            <img
                                                src={VectorIcon || "/placeholder.svg"}
                                                alt="Vector Icon"
                                                className="ml-1 inline-block w-2 h-3 mb-1"
                                            />
                                        </button>
                                    </div>

                                    <div className="tab-content">
                                        {/* Chart with horizontal lines */}
                                        <div className="h-[200px] relative py-2 mt-2">
                                            {/* Horizontal grid lines */}
                                            <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col justify-between">
                                                <div className="border-b border-gray-100 w-full h-0"></div>
                                                <div className="border-b border-gray-100 w-full h-0"></div>
                                                <div className="border-b border-gray-100 w-full h-0"></div>
                                                <div className="border-b border-gray-100 w-full h-0"></div>
                                                <div className="border-b border-gray-100 w-full h-0"></div>
                                                <div className="border-b border-gray-100 w-full h-0"></div>
                                                <div className="border-b border-gray-100 w-full h-0"></div>
                                                <div className="border-b border-gray-100 w-full h-0"></div>
                                            </div>

                                            {/* Y-axis labels */}
                                            <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                                                <div>2000</div>
                                                <div>1500</div>
                                                <div>1250</div>
                                                <div>1000</div>
                                                <div>750</div>
                                                <div>500</div>
                                                <div>250</div>
                                                <div>0</div>
                                            </div>

                                            {/* Chart bars */}
                                            <div className="absolute bottom-0 left-10 right-0 flex justify-between h-full items-end">
                                                {chartData.map((item, index) => (
                                                    <ChartBar key={index} height={item.height} date={item.date} />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Slider pagination */}
                                        <div className="flex items-center justify-center mt-4">
                                            <button className="px-2 text-sm">&lt;</button>
                                            <div className="w-64 h-2 bg-gray-200 rounded-full relative mx-2">
                                                <div className="absolute left-0 w-1/3 h-full bg-gray-700 rounded-full"></div>
                                            </div>
                                            <button className="px-2 text-sm">&gt;</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Collection Log */}
                    <div className="w-full md:w-[300px] h-full flex flex-col shadow-lg pl-7 pt-9">
                        <div className="flex justify-between items-center mr-6 pb-7">
                            <h2 className="font-bold text-xl text-[#21262B]">알림 내역</h2>
                            <h2 className="font-medium text-gray-500 text-sm">
                                자세히보기
                                <img
                                    src={VectorIcon || "/placeholder.svg"}
                                    alt="Vector Icon"
                                    className="ml-1 inline-block w-2 h-3 mb-1"
                                />
                            </h2>
                        </div>

                        {/* 수거 내역 영역에만 스크롤바 적용 */}
                        <div className="overflow-auto flex-1 custom-scrollbar">
                            {loading.boxData ? (
                                <div className="text-center p-4">알림 내역을 불러오는 중...</div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center p-4">알림 내역이 없습니다.</div>
                            ) : (
                                notifications.map((notification, index) => (
                                    <CollectionItem
                                        key={index}
                                        status={notification.status}
                                        date={notification.date}
                                        time={notification.time}
                                        location={notification.location}
                                        amount={notification.coordinates}
                                    />
                                ))
                            )}
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
    );
}

// 차트 바 컴포넌트
function ChartBar({ height, date }) {
    const barHeight = `${height}%`

    return (
        <div className="flex flex-col items-center w-8">
            <div className="w-full flex justify-center h-[80%]">
                <div className="w-5 bg-rose-500 rounded-sm" style={{ height: barHeight }}></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{date}</div>
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

// 알림 내역 아이템 컴포넌트
function CollectionItem({ status, date, time, location, amount }) {
    return (
        <div>
            <div>
        <span
            className={`inline-block px-2 py-0.5 text-white text-sm rounded-md font-nomal ${
                status === "수거함 설치 진행 중" || status === "수거함 제거 진행 중" ? "bg-[#00A060]" : "bg-[#21262B]"
            }`}
        >
          {status}
        </span>
            </div>
            <table className="w-full text-sm border-collapse mt-4 mb-8">
                <tbody>
                <tr>
                    <td className="w-16 text-[#60697E]">알림일자</td>
                    <td className="text-[#21262B]">
                        {date} {time}
                    </td>
                </tr>
                <tr>
                    <td className="w-16 text-[#60697E]">알림지역</td>
                    <td className="text-[#21262B]">{location}</td>
                </tr>
                <tr>
                    <td className="w-16 text-[#60697E]">알림 좌표</td>
                    <td className="text-[#21262B]">{amount}</td>
                </tr>
                </tbody>
            </table>
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

    const collectorLogs = boxLogs.filter((log) => log.collectorId === collectorId)
    const totalAmount = collectorLogs.reduce((total, log) => total + (log.amount || 0), 0)

    return totalAmount.toLocaleString()
}

function getLastActiveDate(collectorId, boxLogs) {
    if (!collectorId || !boxLogs || boxLogs.length === 0) return "기록 없음"

    const collectorLogs = boxLogs.filter((log) => log.collectorId === collectorId)

    if (collectorLogs.length === 0) return "기록 없음"

    // 가장 최근 로그 찾기
    const latestLog = collectorLogs.reduce((latest, log) => {
        if (!latest.date) return log
        if (!log.date) return latest

        return new Date(log.date) > new Date(latest.date) ? log : latest
    }, {})

    if (!latestLog.date) return "기록 없음"

    return formatDate(latestLog.date)
}