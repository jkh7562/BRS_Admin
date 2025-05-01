import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
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
import customerIcon from "../../assets/고객관리.png"
import lineIcon from "../../assets/구분선.png"
import FireInfoIcon from "../../assets/FireInfo.png"
import { fetchEmployeeRequests, getBoxLog, findAllBox } from "../../api/apiServices"

const N_mainPage = () => {
    const navigate = useNavigate();
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
                console.log("📦 수거 및 분리량 조회 결과:", boxLogData)

                if (Array.isArray(boxLogData)) {
                    const today = new Date()
                    const todayDateStr = today.toISOString().split('T')[0]

                    let dischargeSum = 0
                    let collectionSum = 0
                    const userSet = new Set()

                    boxLogData.forEach((entry) => {
                        const { boxLog } = entry
                        if (!boxLog) return

                        const logDate = new Date(boxLog.date)
                        const logDateStr = logDate.toISOString().split('T')[0]

                        if (logDateStr === todayDateStr) {
                            if (boxLog.type === "분리") {
                                dischargeSum += boxLog.value || 0
                            } else if (boxLog.type === "수거") {
                                collectionSum += boxLog.value || 0
                            }
                            if (boxLog.userId) {
                                userSet.add(boxLog.userId)
                            }
                        }
                    })

                    setTodayDischargeTotal(dischargeSum)
                    setTodayCollectionTotal(collectionSum)
                    setTodayUserCount(userSet.size)
                }
            } catch (error) {
                console.error("❌ 수거 및 분리량 조회 실패:", error)
            }
        }

        const loadBoxes = async () => {
            try {
                const data = await findAllBox();
                const mappedBoxes = data.map((entry) => {
                    const { id, name, location, volume1, volume2, volume3, fireStatus1, fireStatus2, fireStatus3, installStatus } = entry.box;

                    // 위치 파싱 (띄어쓰기 유무 상관없이 처리)
                    let lng = 0;
                    let lat = 0;
                    if (location) {
                        const coordsMatch = location.match(/POINT\s*\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)/);
                        if (coordsMatch) {
                            lng = parseFloat(coordsMatch[1]);
                            lat = parseFloat(coordsMatch[2]);
                        }
                    }

                    // 상태 계산
                    let status = "normal";
                    const fireDetected = [fireStatus1, fireStatus2, fireStatus3].includes("FIRE");
                    const volumeThresholdExceeded = [volume1, volume2, volume3].some((v) => v >= 81);

                    if (fireDetected) {
                        status = "fire";
                    } else if (volumeThresholdExceeded) {
                        status = "need-collect";
                    }

                    return { id, name, lat, lng, status, installStatus, volume1, volume2, volume3 };
                });

                setBoxes(mappedBoxes);
            } catch (error) {
                console.error("수거함 정보 로딩 실패:", error);
            }
        };

        loadEmployeeRequests()
        loadBoxLog()
        loadBoxes()
    }, [])

    const filteredBoxes =
        selectedTab === "전체 수거함"
            ? boxes
            : boxes.filter((box) =>
                selectedTab === "수거 필요" ? box.status === "need-collect" : box.status === "fire",
            )

    const goToApprovalPage = () => {
        navigate('/n_UserApprovalPage'); // React Router를 사용하는 경우
    };

    return (
        <div className="flex min-h-screen w-full bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl text-[#272F42]">대시 보드</p>

                    <div className="flex gap-4">
                        {/* 신규 수거자 가입신청 */}
                        <div className="w-[19%] bg-[#21262B] rounded-2xl p-4 shadow cursor-pointer"
                             onClick={goToApprovalPage}>
                            <div className="flex items-center gap-2 mt-4 ml-4 mr-4 mb-4">
                                <img src={joinIcon} alt="신규 수거자" className="w-6 h-6"/>
                                <h2 className="font-bold text-xl text-white whitespace-nowrap">신규 수거자 가입신청</h2>
                            </div>
                            <p className="text-sm text-[#A5ACBA] ml-4 mr-4 mb-6">
                                가입신청이 들어왔어요! 여기를 눌러 <span
                                className="text-blue-400 underline cursor-pointer">확인</span> 해주세요!
                            </p>
                            <p className="font-bold text-[22px] text-white mt-3 ml-4">{employeeRequestCount}건</p>
                        </div>

                        {/* 일간 이용 현황 */}
                        <div className="flex-1 bg-white rounded-2xl p-4 shadow">
                            <div className="flex items-center justify-between mb-14">
                                <div className="flex items-center gap-2 mt-4 ml-6">
                                    <img src={dayIcon} alt="일간" className="w-5 h-5"/>
                                    <h2 className="pl-1 text-xl font-bold text-[#21262B]">일간 이용 현황</h2>
                                </div>
                                <p className="text-sm font-medium text-[#7A7F8A] pr-3 mt-4">마지막 업데이트 2025.03.31</p>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mx-4 text-sm">
                                {/* 일간 배출량 */}
                                <div className="flex-1 flex flex-col items-center md:items-start px-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500">일간 배출량</p>
                                        <img src={infoIcon} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] text-[#21262B] mt-2">{todayDischargeTotal}</p>
                                </div>

                                {/* 구분선 */}
                                <div className="hidden md:flex justify-center px-4">
                                    <img src={lineIcon} alt="line" className="h-8"/>
                                </div>

                                {/* 일간 수거량 */}
                                <div className="flex-1 flex flex-col items-center md:items-start px-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500">일간 수거량</p>
                                        <img src={infoIcon} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] text-[#21262B] mt-2">{todayCollectionTotal}</p>
                                </div>

                                {/* 구분선 */}
                                <div className="hidden md:flex justify-center px-4">
                                    <img src={lineIcon} alt="line" className="h-8"/>
                                </div>

                                {/* 일간 이용자수 */}
                                <div className="flex-1 flex flex-col items-center md:items-start px-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500">일간 이용자</p>
                                        <img src={infoIcon} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] text-[#21262B] mt-2">{todayUserCount}명</p>
                                </div>
                            </div>
                        </div>

                        {/* 고객 관리 */}
                        <div className="flex-1 bg-white rounded-2xl p-4 shadow">
                            <div className="flex items-center justify-between mb-14">
                                <div className="flex items-center gap-2 mt-4 ml-6">
                                    <img src={customerIcon} alt="고객 관리" className="w-5 h-5"/>
                                    <h2 className="text-xl font-bold text-[#21262B]">고객 관리</h2>
                                </div>
                                <p className="text-sm font-medium text-[#7A7F8A] pr-3 mt-4">마지막 업데이트 2025.03.31</p>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mx-4 text-sm">
                                <div className="flex-1 flex flex-col items-center md:items-start px-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500">사용자 문의</p>
                                        <img src={infoIcon} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] text-[#21262B] mt-2">13건</p>
                                </div>

                                <div className="hidden md:flex justify-center px-4">
                                    <img src={lineIcon} alt="line" className="h-8"/>
                                </div>

                                <div className="flex-1 flex flex-col items-center md:items-start px-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500">수거자 문의</p>
                                        <img src={infoIcon} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] text-[#21262B] mt-2">5건</p>
                                </div>

                                <div className="hidden md:flex justify-center px-4">
                                    <img src={lineIcon} alt="line" className="h-8"/>
                                </div>

                                <div className="flex-1 flex flex-col items-center md:items-start px-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500">일반 민원</p>
                                        <img src={infoIcon} alt="info" className="w-4 h-4"/>
                                    </div>
                                    <p className="font-bold text-[22px] text-[#21262B] mt-2">0건</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 수거함 현황 */}
                    <div className="pt-12 mb-4">
                        <h3 className="text-xl font-bold mb-4 text-[#272F42]">수거함 현황</h3>
                        <div className="relative mb-9">
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200"/>
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
                                            <img src={FireInfoIcon} alt="화재" className="w-4 h-4 ml-1"/>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <MapWithSidebar filteredBoxes={filteredBoxes} isMainPage={true}/>
                    <div className="pb-8"></div>

                    {/* 배출량, 수거량 탭 */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-[#272F42] text-xl font-bold mb-3">배출량</h3>
                            <DischargeChart/>
                        </div>
                        <div>
                            <h3 className="text-[#272F42] text-xl font-bold mb-3">수거량</h3>
                            <CollectionChart/>
                        </div>
                    </div>

                    {/* 회원 정보 */}
                    <div className="pt-8 pb-6">
                        <h3 className="text-xl font-bold text-[#272F42] mb-4">회원 정보 검색</h3>
                        <div className="relative">
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200"/>
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

                    {memberselectedTab === "사용자" ? <UserInfoSection/> : <CollectorInfoSection/>}

                    <div className="pb-32"/>
                </main>
            </div>
        </div>
    )
}

export default N_mainPage

