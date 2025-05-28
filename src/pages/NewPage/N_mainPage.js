import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import MapWithSidebar from "../../component/MapWithSidebar"
import UserInfoSection from "../../component/InfoSection/UserInfoSection"
import CollectorInfoSection from "../../component/InfoSection/CollectorInfoSection"
import DischargeChart from "../../component/chart/DischargeChart"
import CollectionChart from "../../component/chart/CollectionChart"
import joinIcon from "../../assets/가입관리2.png"
import dayIcon from "../../assets/일간.png"
import infoIcon from "../../assets/추가정보2.png"
import lineIcon from "../../assets/구분선.png"
import FireInfoIcon from "../../assets/FireInfo.png"
import { fetchEmployeeRequests, getBoxLog, findAllBox } from "../../api/apiServices"

const N_mainPage = () => {
    const navigate = useNavigate()
    const tabs = ["전체 수거함", "건전지", "방전 배터리", "잔여 용량 배터리"]
    const [selectedEmissionTab, setSelectedEmissionTab] = useState("전체 수거함")
    const [selectedCollectionTab, setSelectedCollectionTab] = useState("전체 수거함")
    const [selectedTab, setSelectedTab] = useState("전체 수거함")
    const memberTabs = ["사용자", "수거자"]
    const [memberselectedTab, setMemberSelectedTab] = useState("사용자")
    const [boxes, setBoxes] = useState([])

    const [employeeRequestCount, setEmployeeRequestCount] = useState(0)
    const [todayDischargeTotal, setTodayDischargeTotal] = useState(0)
    const [todayCollectionTotal, setTodayCollectionTotal] = useState(0)
    const [todayUserCount, setTodayUserCount] = useState(0)

    // 툴팁 상태 관리
    const [tooltips, setTooltips] = useState({
        discharge: false,
        collection: false,
        users: false,
        userInquiry: false,
        collectorInquiry: false,
        generalInquiry: false,
        fire: false,
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

    useEffect(() => {
        const loadEmployeeRequests = async () => {
            try {
                const data = await fetchEmployeeRequests()
                setEmployeeRequestCount(data.length || 0)
            } catch (error) {
                console.error("수거자 가입 요청 목록 불러오기 실패:", error)
                setEmployeeRequestCount(0)
            }
        }

        const loadBoxLog = async () => {
            try {
                const boxLogData = await getBoxLog()
                console.log("📦 박스 로그 데이터:", boxLogData)

                if (Array.isArray(boxLogData)) {
                    // 오늘 날짜를 로컬 시간 기준으로 구하기
                    const today = new Date()
                    const todayDateStr = today
                        .toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                        })
                        .replace(/\./g, "/")
                        .replace(",", "")

                    console.log("오늘 날짜 (로컬):", todayDateStr)

                    let dischargeSum = 0
                    let collectionSum = 0
                    let usageCount = 0  // 사용자 수 대신 사용횟수 카운트

                    boxLogData.forEach((entry, index) => {
                        const logData = entry.boxLog
                        const items = entry.items || []

                        if (!logData || !logData.date) return

                        // 날짜 포맷
                        const logDate = new Date(logData.date)
                        const logDateStr = logDate
                            .toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })
                            .replace(/\./g, "/")
                            .replace(",", "")

                        console.log(`로그 ${index}: 날짜=${logData.date} -> ${logDateStr}, 타입=${logData.type}`)

                        if (logDateStr === todayDateStr) {
                            console.log(`✅ 오늘 데이터 매칭! 로그ID: ${logData.logId}`)

                            // 수거함 사용횟수 증가 (각 로그 엔트리가 하나의 사용)
                            usageCount++
                            console.log(`📊 수거함 사용횟수 증가: ${usageCount}회`)

                            // items 배열에서 전지 개수 합산
                            let itemTotal = 0
                            items.forEach(item => {
                                const count = Number(item.count) || 0
                                itemTotal += count
                                console.log(`  - ${item.name}: ${count}개`)
                            })

                            // 타입에 따라 분리량 또는 수거량에 합산
                            if (logData.type === "분리") {
                                dischargeSum += itemTotal
                                console.log(`📊 분리량 추가: +${itemTotal}, 총합=${dischargeSum}`)
                            } else if (logData.type === "수거") {
                                collectionSum += itemTotal
                                console.log(`📊 수거량 추가: +${itemTotal}, 총합=${collectionSum}`)
                            }
                        }
                    })

                    console.log("📊 최종 집계 결과:")
                    console.log(`- 배출량 총합: ${dischargeSum}`)
                    console.log(`- 수거량 총합: ${collectionSum}`)
                    console.log(`- 수거함 사용횟수: ${usageCount}회`)

                    setTodayDischargeTotal(dischargeSum)
                    setTodayCollectionTotal(collectionSum)
                    setTodayUserCount(usageCount)  // 기존 변수명 재사용
                }
            } catch (error) {
                console.error("❌ 수거 및 분리량 조회 실패:", error)
            }
        }

        const loadBoxes = async () => {
            try {
                const data = await findAllBox()

                const mappedBoxes = data.map((entry) => {
                    // entry.box가 있으면 사용하고, 없으면 entry 자체를 사용
                    const source = entry.box || entry

                    const {
                        id,
                        name,
                        location,
                        volume1,
                        volume2,
                        volume3,
                        fireStatus1,
                        fireStatus2,
                        fireStatus3,
                        installStatus,
                    } = source

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

                    // 상태 계산
                    let status = "normal"
                    const fireDetected = [fireStatus1, fireStatus2, fireStatus3].includes("FIRE")
                    const volumeThresholdExceeded = [volume1, volume2, volume3].some((v) => v >= 81)

                    if (fireDetected) {
                        status = "fire"
                    } else if (volumeThresholdExceeded) {
                        status = "need-collect"
                    }

                    return { id, name, lat, lng, status, installStatus, volume1, volume2, volume3 }
                })

                console.log(`✅ 수거함 정보 로딩 완료: ${mappedBoxes.length}개의 수거함 로드됨`)
                setBoxes(mappedBoxes)
            } catch (error) {
                console.error("수거함 정보 로딩 실패:", error)
            }
        }

        loadEmployeeRequests()
        loadBoxLog()
        loadBoxes()
    }, [])

    const filteredBoxes =
        selectedTab === "전체 수거함"
            ? boxes
            : boxes.filter((box) => (selectedTab === "수거 필요" ? box.status === "need-collect" : box.status === "fire"))

    const goToApprovalPage = () => {
        navigate("/n_UserApprovalPage") // React Router를 사용하는 경우
    }

    // 툴팁 컴포넌트
    const Tooltip = ({ isVisible, content, position = "right" }) => {
        if (!isVisible) return null

        const positionClass = position === "right" ? "right-0 mt-2" : position === "left" ? "left-0 mt-2" : "right-0 mt-2"

        // 화살표 위치 클래스 추가
        const arrowPositionClass = position === "left" ? "left-1" : "right-1"

        return (
            <div className={`absolute ${positionClass} w-64 bg-white text-gray-800 rounded-md shadow-lg p-4 z-50`}>
                <div className={`absolute -top-2 ${arrowPositionClass} w-4 h-4 bg-white transform rotate-45`}></div>
                {content}
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl text-[#272F42]">대시 보드</p>

                    <div className="flex gap-4">
                        {/* 신규 수거자 가입신청 */}
                        <div className="w-[27%] bg-[#21262B] rounded-2xl p-4 shadow cursor-pointer" onClick={goToApprovalPage}>
                            <div className="flex items-center gap-2 mt-4 ml-4 mr-4 mb-4">
                                <img src={joinIcon || "/placeholder.svg"} alt="신규 수거자" className="w-6 h-6" />
                                <h2 className="font-bold text-xl text-white whitespace-nowrap">신규 수거자 가입신청</h2>
                            </div>
                            <p className="text-sm text-[#A5ACBA] ml-4 mr-4 mb-6">
                                가입신청이 들어왔어요! 여기를 눌러 <span className="text-blue-400 underline cursor-pointer">확인</span>{" "}
                                해주세요!
                            </p>
                            <p className="font-bold text-[22px] text-white mt-3 ml-4">{employeeRequestCount}건</p>
                        </div>

                        {/* 일간 이용 현황 */}
                        <div className="flex-1 bg-white rounded-2xl p-4 shadow">
                            <div className="flex items-center justify-between mb-14">
                                <div className="flex items-center gap-2 mt-4 ml-6">
                                    <img src={dayIcon || "/placeholder.svg"} alt="일간" className="w-5 h-5" />
                                    <h2 className="pl-1 text-xl font-bold text-[#21262B]">일간 이용 현황</h2>
                                </div>
                                <p className="text-sm font-medium text-[#7A7F8A] pr-3 mt-4">마지막 업데이트 2025.03.31</p>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mx-4 text-sm">
                                {/* 일간 배출량 */}
                                <div className="flex-1 flex flex-col items-center md:items-start px-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500">일간 배출량</p>
                                        <div className="tooltip-container relative">
                                            <img
                                                src={infoIcon || "/placeholder.svg"}
                                                alt="info"
                                                className="w-4 h-4 cursor-pointer"
                                                onClick={(e) => toggleTooltip("discharge", e)}
                                            />
                                            <Tooltip
                                                isVisible={tooltips.discharge}
                                                content={
                                                    <>
                                                        <h3 className="font-bold text-sm mb-2">일간 배출량</h3>
                                                        <p className="text-xs">오늘 하루 동안 수거함에 배출된 배터리의 총량입니다.</p>
                                                    </>
                                                }
                                            />
                                        </div>
                                    </div>
                                    <p className="font-bold text-[22px] text-[#21262B] mt-2">{todayDischargeTotal}</p>
                                </div>

                                {/* 구분선 */}
                                <div className="hidden md:flex justify-center px-4">
                                    <img src={lineIcon || "/placeholder.svg"} alt="line" className="h-8" />
                                </div>

                                {/* 일간 수거량 */}
                                <div className="flex-1 flex flex-col items-center md:items-start px-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500">일간 수거량</p>
                                        <div className="tooltip-container relative">
                                            <img
                                                src={infoIcon || "/placeholder.svg"}
                                                alt="info"
                                                className="w-4 h-4 cursor-pointer"
                                                onClick={(e) => toggleTooltip("collection", e)}
                                            />
                                            <Tooltip
                                                isVisible={tooltips.collection}
                                                content={
                                                    <>
                                                        <h3 className="font-bold text-sm mb-2">일간 수거량</h3>
                                                        <p className="text-xs">오늘 하루 동안 수거함에서 수거된 배터리의 총량입니다.</p>
                                                    </>
                                                }
                                            />
                                        </div>
                                    </div>
                                    <p className="font-bold text-[22px] text-[#21262B] mt-2">{todayCollectionTotal}</p>
                                </div>

                                {/* 구분선 */}
                                <div className="hidden md:flex justify-center px-4">
                                    <img src={lineIcon || "/placeholder.svg"} alt="line" className="h-8" />
                                </div>

                                {/* 일간 수거함 사용횟수 */}
                                <div className="flex-1 flex flex-col items-center md:items-start px-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500">일간 수거함 사용횟수</p>
                                        <div className="tooltip-container relative">
                                            <img
                                                src={infoIcon || "/placeholder.svg"}
                                                alt="info"
                                                className="w-4 h-4 cursor-pointer"
                                                onClick={(e) => toggleTooltip("users", e)}
                                            />
                                            <Tooltip
                                                isVisible={tooltips.users}
                                                content={
                                                    <>
                                                        <h3 className="font-bold text-sm mb-2">일간 수거함 사용횟수</h3>
                                                        <p className="text-xs">오늘 하루 동안 수거함을 이용한 횟수입니다.</p>
                                                    </>
                                                }
                                            />
                                        </div>
                                    </div>
                                    <p className="font-bold text-[22px] text-[#21262B] mt-2">{todayUserCount}회</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 수거함 현황 */}
                    <div className="pt-12 mb-4">
                        <h3 className="text-xl font-bold text-[#272F42]">수거함 현황</h3>
                        <span className="text-sm text-gray-500">각 수거함의 위치와 수거량 현황을 확인할 수 있습니다.</span>
                        <div className="relative mt-4 mb-9">
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200" />
                            <div className="flex items-center gap-6">
                                {["전체 수거함", "수거 필요", "화재감지"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setSelectedTab(tab)}
                                        className={`pb-1 flex items-center gap-1 ${
                                            selectedTab === tab
                                                ? `border-b-[3px] ${
                                                    tab === "화재감지"
                                                        ? "border-black text-[#940000] font-bold"
                                                        : "border-black text-[#21262B] font-bold"
                                                }`
                                                : tab === "화재감지"
                                                    ? "text-[#940000]"
                                                    : "text-[#60697E]"
                                        }`}
                                    >
                                        {tab}
                                        {tab === "화재감지" && (
                                            <div className="tooltip-container relative">
                                                <img
                                                    src={FireInfoIcon || "/placeholder.svg"}
                                                    alt="화재"
                                                    className="w-4 h-4 ml-1 cursor-pointer"
                                                    onClick={(e) => toggleTooltip("fire", e)}
                                                />
                                                <Tooltip
                                                    isVisible={tooltips.fire}
                                                    content={
                                                        <>
                                                            <h3 className="font-bold text-sm mb-2 text-[#940000]">화재 감지 정보</h3>
                                                            <p className="text-xs">수거함 내부에 화재가 감지된 수거함 목록입니다.</p>
                                                            <p className="text-xs mt-2">화재 감지 시 즉시 알림이 발송됩니다.</p>
                                                            <p className="text-xs mt-2 font-semibold text-[#940000]">
                                                                화재 감지 수거함은 긴급 조치가 필요합니다!
                                                            </p>
                                                        </>
                                                    }
                                                    position="left"
                                                />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <MapWithSidebar filteredBoxes={filteredBoxes} />
                    <div className="pb-8"></div>

                    {/* 배출량, 수거량 탭 */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-[#272F42] text-xl font-bold mb-3">배출량</h3>
                            <DischargeChart />
                        </div>
                        <div>
                            <h3 className="text-[#272F42] text-xl font-bold mb-3">수거량</h3>
                            <CollectionChart />
                        </div>
                    </div>

                    {/* 회원 정보 */}
                    <div className="pt-8 pb-6">
                        <h3 className="text-xl font-bold text-[#272F42] mb-4">회원 정보 검색</h3>
                        <div className="relative">
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200" />
                            <div className="flex gap-6">
                                {memberTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setMemberSelectedTab(tab)}
                                        className={`pb-1 ${
                                            memberselectedTab === tab
                                                ? "border-b-[3px] border-black text-[#21262B] font-semibold"
                                                : "text-[#60697E]"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {memberselectedTab === "사용자" ? <UserInfoSection /> : <CollectorInfoSection />}

                    <div className="pb-32" />
                </main>
            </div>
        </div>
    )
}

export default N_mainPage