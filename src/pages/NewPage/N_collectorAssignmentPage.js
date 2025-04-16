"use client"

import { useState, useEffect } from "react"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import DownIcon from "../../assets/Down.png"
import { Map } from "react-kakao-maps-sdk"

const N_collectorAssignmentPage = () => {
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

    // 모든 지역 목록
    const allRegions = Object.keys(regionData)

    // 필터 상태
    const [filters, setFilters] = useState({
        region: "광역시/도",
        city: "시/군/구",
    })

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

    return (
        <div className="flex min-h-screen w-screen bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl">수거자 배치 현황</p>

                    {/* 필터 UI 추가 */}
                    <div className="relative">
                        <div className="flex flex-wrap gap-7 mt-2 pb-1 font-bold relative z-10">
                            <div className="relative dropdown-container">
                                <button className="flex items-center gap-2" onClick={() => toggleDropdown("region")}>
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
                                    className={`flex items-center gap-2 ${isCityDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
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

export default N_collectorAssignmentPage
