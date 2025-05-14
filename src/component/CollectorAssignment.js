import { useState, useRef, useEffect } from "react"
import SearchIcon from "../assets/검색.png"
import CopyIcon from "../assets/copy.png"
import InfoIcon from "../assets/추가정보2.png"
import VectorIcon from "../assets/Vector.png"
import DownIcon from "../assets/Down.png"
import UserIcon from "../assets/user.png"

function CustomDropdown({ options, value, onChange, width = "200px" }) {
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
                className="w-full px-3 py-2 border border-black/20 rounded-lg text-base text-left flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedValue}</span>
                <img src={DownIcon || "/placeholder.svg"} alt="Down" className="ml-2 w-3 h-2" />
            </button>

            {isOpen && (
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

export default function CollectorAssignment() {
    // 검색어 상태 변수 추가 (CollectorAssignment 컴포넌트 내부, 다른 상태 변수 근처에 추가)
    const [searchTerm, setSearchTerm] = useState("")

    // 수거자 목록 데이터 추가 (CollectorAssignment 컴포넌트 내부, regionData 위에 추가)
    const [collectors, setCollectors] = useState([
        { id: "user1", name: "이창진", points: 1600, date: "2025.02.03", isActive: false },
        { id: "user2", name: "정윤식", points: 3200, date: "2025.02.03", isActive: true },
        { id: "user3", name: "정규혁", points: 1100, date: "2025.02.03", isActive: false },
        { id: "user4", name: "홍길동", points: 2000, date: "2025.02.03", isActive: false },
        { id: "user5", name: "김철수", points: 2000, date: "2025.02.03", isActive: false },
        { id: "user6", name: "이영희", points: 2000, date: "2025.02.03", isActive: false },
        { id: "user7", name: "박지성", points: 2000, date: "2025.02.03", isActive: false },
    ])

    // 선택된 수거자 상태 추가
    const [selectedCollector, setSelectedCollector] = useState(null)

    // 컴포넌트 마운트 시 기본 선택 수거자 설정
    useEffect(() => {
        // 기본적으로 첫 번째 수거자 선택 또는 isActive가 true인 수거자 선택
        const defaultCollector = collectors.find((c) => c.isActive) || collectors[0]
        setSelectedCollector(defaultCollector)
    }, [collectors])

    // 수거자 선택 핸들러 함수 추가
    const handleCollectorSelect = (collector) => {
        setSelectedCollector(collector)
    }

    // 검색어에 따라 필터링된 수거자 목록 계산
    const filteredCollectors = collectors.filter((collector) =>
        collector.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const [selectedPeriod, setSelectedPeriod] = useState("일")
    const [selectedRegion, setSelectedRegion] = useState("충청남도")

    // 툴팁 상태 관리 추가
    const [tooltips, setTooltips] = useState({
        province: false,
        city: false,
    })

    // 복사된 사용자 ID 상태 추가
    const [copiedId, setCopiedId] = useState(null)

    // 복사 핸들러 함수 추가
    const handleCopy = (e, userId, text) => {
        e.stopPropagation() // 이벤트 버블링 방지

        navigator.clipboard
            .writeText(text)
            .then(() => {
                // 복사된 항목 ID 저장
                setCopiedId(userId)

                // 1.5초 후 상태 초기화
                setTimeout(() => {
                    setCopiedId(null)
                }, 1500)
            })
            .catch((err) => {
                console.error("복사 실패:", err)
            })
    }

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
                    {filteredCollectors.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">검색 결과가 없습니다</div>
                    ) : (
                        filteredCollectors.map((collector) => (
                            <UserListItem
                                key={collector.id}
                                userId={collector.id}
                                name={collector.name}
                                points={collector.points}
                                date={collector.date}
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
                        {/* User profile section styled to match the image */}
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
                                    <p className="text-sm font-medium text-gray-500">마지막 이용일 2025.03.06</p>
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
                                        options={Object.keys(regionData)}
                                        value={selectedRegion}
                                        onChange={(value) => setSelectedRegion(value)}
                                        width="200px"
                                    />
                                </div>
                            </div>

                            {/* Added spacing between the two sections */}
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
                                        options={regionData[selectedRegion] || []}
                                        value={regionData[selectedRegion]?.[0] || ""}
                                        onChange={(value) => console.log("Selected city:", value)}
                                        width="200px"
                                    />
                                </div>
                            </div>

                            <div className="h-12 flex items-center pt-6 md:mt-0 md:ml-[85px]">
                                <button
                                    className="bg-[#E8F1F7] text-[#21262B] px-6 py-2 rounded-2xl hover:bg-gray-200 transition-colors"
                                    onClick={() => console.log("담당지역 변경 clicked")}
                                >
                                    변경사항 저장
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
                                            <ChartBar height={10} date="02.03" />
                                            <ChartBar height={8} date="02.04" />
                                            <ChartBar height={8} date="02.05" />
                                            <ChartBar height={0} date="02.06" />
                                            <ChartBar height={0} date="02.07" />
                                            <ChartBar height={20} date="02.08" />
                                            <ChartBar height={25} date="02.09" />
                                            <ChartBar height={0} date="02.10" />
                                            <ChartBar height={0} date="02.11" />
                                            <ChartBar height={30} date="02.12" />
                                            <ChartBar height={0} date="02.13" />
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

                {/* Right Sidebar - User Information Card */}
                <div className="w-full md:w-[300px] h-full flex flex-col shadow-lg p-7">
                    {selectedCollector && (
                        <div className="px-2 pt-2">
                            <h2 className="text-xl text-[#21262B] font-bold mb-2">{selectedCollector.name}</h2>
                            <div className="flex">
                                <span className="font-bold text-[#60697E] w-20 mb-6">전화번호</span>
                                <span className="text-[#60697E]">010-2222-2222</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex">
                                    <span className="text-[#21262B] text-sm font-bold w-20">광역시/도</span>
                                    <span className="text-[#21262B] text-sm">충청남도</span>
                                </div>

                                <div className="flex">
                                    <span className="text-[#21262B] text-sm font-bold w-20">시/군/구</span>
                                    <span className="text-[#21262B] text-sm">아산시</span>
                                </div>

                                <div className="flex">
                                    <span className="text-[#21262B] text-sm font-bold w-20">상태</span>
                                    <span className="text-[#21262B] text-sm">설치 진행중</span>
                                </div>

                                <div className="flex">
                                    <span className="text-[#21262B] text-sm font-bold w-20">알림일자</span>
                                    <span className="text-[#21262B] text-sm">2025/03/16</span>
                                </div>
                            </div>
                        </div>
                    )}
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
                .dropdown-container select {
                    max-height: 38px; /* Height of a single option */
                }

                /* This targets the dropdown options when open */
                .dropdown-container select option {
                    padding: 8px 12px;
                }

                /* These styles will be applied by the browser for the dropdown menu */
                @media screen and (-webkit-min-device-pixel-ratio:0) {
                    select {
                        height: 38px;
                    }
                    
                    select:focus {
                        overflow: -moz-scrollbars-vertical;
                        overflow-y: auto;
                    }
                }

                /* For Firefox */
                @-moz-document url-prefix() {
                    select {
                        scrollbar-width: thin;
                        scrollbar-color: #d1d1d1 transparent;
                    }
                    
                    select:focus {
                        overflow: auto;
                    }
                }

                /* For Webkit browsers */
                select::-webkit-scrollbar {
                    width: 6px;
                }

                select::-webkit-scrollbar-track {
                    background: transparent;
                }

                select::-webkit-scrollbar-thumb {
                    background: #d1d1d1;
                    border-radius: 10px;
                }

                select::-webkit-scrollbar-thumb:hover {
                    background: #b1b1b1;
                }

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

// Update the UserListItem component to apply text-base and font-bold to the name, and text-sm and font-normal to the other text
function UserListItem({ name, userId, points, date, isActive, onClick, handleCopy, copiedId }) {
    return (
        <div
            className={`p-4 border-b flex items-center justify-between hover:bg-[#D1E3EE] hover:bg-opacity-50 cursor-pointer ${isActive ? "bg-[#D1E3EE] bg-opacity-50" : ""}`}
            onClick={onClick}
        >
            <div>
                <h3 className="text-base text-[#21262B] font-bold">{name}</h3>
                <p className="text-sm font-normal text-[#60697E] mt-1">총 수거량 {points}</p>
                <p className="text-sm font-normal text-[#60697E]">{date}</p>
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

// Component for chart bars
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

// Component for stat cards
function StatCard({ title, value, number }) {
    return (
        <div className="py-4">
            <div className="flex items-center justify-start gap-2 mb-2">
                <span className="text-sm font-normal text-gray-500">{title}</span>
                <span>
          <img src={InfoIcon || "/placeholder.svg"} alt="정보" className="w-4 h-4 object-contain" />
        </span>
            </div>
            <div className="text-[22px] font-bold">{value}</div>
        </div>
    )
}