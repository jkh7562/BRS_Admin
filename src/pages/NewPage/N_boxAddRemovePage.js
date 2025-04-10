import { useState, useEffect } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import MapWithSidebar from "../../component/MapWithSidebar"
import DownIcon from "../../assets/Down.png"
import InstallationStatus from "../../component/InstallationStatus"
import RemoveStatus from "../../component/RemoveStatus"

const N_boxAddRemovePage = () => {
    const [activeTab, setActiveTab] = useState("전체")
    const tabs = ["전체", "설치", "제거", "설치 추천 위치"]

    // 예시 데이터 - 실제 데이터는 API에서 가져오거나 props로 전달받아야 합니다
    const boxesData = [
        {
            id: 1,
            name: "수거함 A",
            address: "서울시 강남구 테헤란로 123",
            lat: 37.5665,
            lng: 126.978,
            status: "설치",
        },
        {
            id: 2,
            name: "수거함 B",
            address: "서울시 서초구 서초대로 456",
            lat: 37.4969,
            lng: 127.0278,
            status: "설치",
        },
        {
            id: 3,
            name: "수거함 C",
            address: "서울시 송파구 올림픽로 789",
            lat: 37.514,
            lng: 127.0565,
            status: "제거",
        },
    ]

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

    // 모든 지역 목록
    const allRegions = Object.keys(regionData)

    // 선택된 탭에 따라 데이터 필터링
    const filteredBoxes = activeTab === "전체" ? boxesData : boxesData.filter((box) => box.status === activeTab)

    // 필터 상태
    const [filters, setFilters] = useState({
        type: "설치",
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

    // 드롭다운 토글 핸들러
    const toggleDropdown = (dropdownName) => {
        // 시/군/구 드롭다운은 지역이 선택되지 않았으면 열지 않음
        if (dropdownName === "city" && filters.region === "광역시/도") {
            return
        }

        setOpenDropdown((prev) => ({
            ...prev,
            [dropdownName]: !prev[dropdownName],
        }))
    }

    // 도시 드롭다운 비활성화 여부
    const isCityDisabled = filters.region === "광역시/도"

    return (
        <div className="flex min-h-screen w-screen bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl">설치/제거 수거함 현황</p>
                    <div>
                        <div className="relative mb-6">
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0" />
                            <div className="flex gap-6 relative z-10">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-1 bg-transparent ${
                                            activeTab === tab ? "border-b-[3px] border-black text-black font-bold" : "text-gray-500"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* filteredBoxes 데이터를 전달 */}
                    <MapWithSidebar filteredBoxes={filteredBoxes} />

                    <div className="pt-10 pb-6">
                        <p className="font-bold text-xl">설치/제거 수거함 목록</p>

                        {/* 필터 UI 추가 */}
                        <div className="relative pt-2">
                            <div className="flex flex-wrap gap-7 mt-2 font-bold relative z-10">
                                <div className="relative">
                                    <button className="flex items-center gap-2 text-base" onClick={() => toggleDropdown("type")}>
                                        {filters.type}
                                        <img src={DownIcon || "/placeholder.svg"} alt="Down" className="w-3 h-2" />
                                    </button>
                                    {/* 타입 드롭다운 메뉴 */}
                                    {openDropdown.type && (
                                        <div className="absolute top-full left-0 mt-1 bg-white shadow-md rounded-md py-1 z-20 min-w-[100px]">
                                            <button
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                onClick={() => handleFilterChange("type", "설치")}
                                            >
                                                설치
                                            </button>
                                            <button
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                onClick={() => handleFilterChange("type", "제거")}
                                            >
                                                제거
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <button className="flex items-center gap-2" onClick={() => toggleDropdown("region")}>
                                        {filters.region}
                                        <img src={DownIcon || "/placeholder.svg"} alt="Down" className="w-3 h-2" />
                                    </button>
                                    {/* 지역 드롭다운 메뉴 */}
                                    {openDropdown.region && (
                                        <div className="absolute top-full left-0 mt-1 bg-white shadow-md rounded-md py-1 z-20 min-w-[150px] max-h-[300px] overflow-y-auto">
                                            {allRegions.map((region) => (
                                                <button
                                                    key={region}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => handleFilterChange("region", region)}
                                                >
                                                    {region}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <button
                                        className={`flex items-center gap-2 ${isCityDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => toggleDropdown("city")}
                                        disabled={isCityDisabled}
                                    >
                                        {filters.city}
                                        <img src={DownIcon || "/placeholder.svg"} alt="Down" className="w-3 h-2" />
                                    </button>
                                    {/* 도시 드롭다운 메뉴 */}
                                    {openDropdown.city && !isCityDisabled && (
                                        <div className="absolute top-full left-0 mt-1 bg-white shadow-md rounded-md py-1 z-20 min-w-[150px] max-h-[300px] overflow-y-auto">
                                            <button
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                onClick={() => handleFilterChange("city", "시/군/구")}
                                            >
                                                시/군/구
                                            </button>
                                            {cityOptions.map((city) => (
                                                <button
                                                    key={city}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => handleFilterChange("city", city)}
                                                >
                                                    {city}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0" />
                        </div>
                    </div>

                    {/* 선택된 타입에 따라 컴포넌트 조건부 렌더링 */}
                    {filters.type === "설치" ? <InstallationStatus /> : <RemoveStatus />}

                    <div className="pb-32" />
                </main>
            </div>
        </div>
    )
}

export default N_boxAddRemovePage