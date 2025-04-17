import { useState, useEffect } from "react"
import { Map } from "react-kakao-maps-sdk"
import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import DownIcon from "../../assets/Down.png"
import RightIcon from "../../assets/Vector-right.png"

const N_boxControlLogPage = () => {
    // Replace the year, month, day state definitions with these:
    const [year, setYear] = useState("")
    const [month, setMonth] = useState("")
    const [day, setDay] = useState("")

    // Generate years (current year and 2 previous years)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 3 }, (_, i) => (currentYear - 2 + i).toString())

    // Generate months 1-12 (padded with 0)
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"))

    // With this function to get days based on month and year:
    const getDaysInMonth = (year, month) => {
        // If year or month is not selected, return empty array
        if (!year || !month) return []

        // Convert string inputs to numbers
        const numYear = Number.parseInt(year)
        const numMonth = Number.parseInt(month)

        // Get the number of days in the selected month
        // Month is 1-based in our UI but 0-based in Date constructor
        const daysInMonth = new Date(numYear, numMonth, 0).getDate()

        return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, "0"))
    }

    // Then update the days state to be dynamic:
    const [days, setDays] = useState(() => getDaysInMonth(year, month))

    // Update the useEffect for days:
    useEffect(() => {
        setDays(getDaysInMonth(year, month))

        // If month changes and day is no longer valid, reset day
        if (year && month) {
            const daysInSelectedMonth = getDaysInMonth(year, month)
            if (day && Number.parseInt(day) > daysInSelectedMonth.length) {
                setDay("")
            }
        }
    }, [year, month, day])

    // Handle year changes
    useEffect(() => {
        // If year is cleared, clear month and day
        if (!year) {
            setMonth("")
            setDay("")
        }
    }, [year])

    // Handle month changes
    useEffect(() => {
        // If month is cleared, clear day
        if (!month) {
            setDay("")
        }
    }, [month])

    const [logType, setLogType] = useState("discharge")
    const [selectedBox, setSelectedBox] = useState({
        name: "선문대학교 동문 앞 수거함",
        location: "36.8082 / 127.009",
        date: "2025/03/16",
    })

    // Sample data for collection boxes
    const boxList = [
        {
            id: 1,
            name: "선문대학교 동문 앞 수거함",
            location: "36.8082 / 127.009",
            date: "2025/03/16",
            isActive: true,
        },
        {
            id: 2,
            name: "선문대학교 서문 앞 수거함",
            location: "36.8082 / 127.009",
            date: "2025/03/17",
            isActive: false,
        },
        {
            id: 3,
            name: "선문대학교 상봉마을 수거함",
            location: "36.8082 / 127.009",
            date: "2025/03/13",
            isActive: false,
        },
        {
            id: 4,
            name: "선문대학교 인문관 1층 수거함",
            location: "36.8082 / 127.009",
            date: "2025/03/09",
            isActive: false,
        },
        {
            id: 5,
            name: "선문대학교 도서관 앞 수거함",
            location: "36.8082 / 127.009",
            date: "2025/03/05",
            isActive: false,
        },
    ]

    // Add this dummy data array after the boxList array (around line 75)
    const logData = [
        {
            id: 1,
            userName: "홍길동",
            date: "2025/03/06",
            boxName: "선문대학교 동문 앞 수거함",
            dischargeInfo: "건전지 1개, 방전 배터리 3개",
        },
        {
            id: 2,
            userName: "정몽식",
            date: "2025/03/06",
            boxName: "선문대학교 동문 앞 수거함",
            dischargeInfo: "건전지 11개, 방전 배터리 5개, 잔여 용량 배터리 7개",
        },
        {
            id: 3,
            userName: "공지철",
            date: "2025/03/06",
            boxName: "선문대학교 동문 앞 수거함",
            dischargeInfo: "방전 배터리 8개",
        },
        {
            id: 4,
            userName: "김유신",
            date: "2025/03/06",
            boxName: "선문대학교 동문 앞 수거함",
            dischargeInfo: "건전지 2개, 잔여 용량 배터리 1개",
        },
        {
            id: 5,
            userName: "이순신",
            date: "2025/03/05",
            boxName: "선문대학교 서문 앞 수거함",
            dischargeInfo: "건전지 5개, 방전 배터리 2개",
        },
        {
            id: 6,
            userName: "강감찬",
            date: "2025/03/05",
            boxName: "선문대학교 서문 앞 수거함",
            dischargeInfo: "잔여 용량 배터리 4개",
        },
        {
            id: 7,
            userName: "장영실",
            date: "2025/03/04",
            boxName: "선문대학교 상봉마을 수거함",
            dischargeInfo: "건전지 3개, 방전 배터리 1개",
        },
        {
            id: 8,
            userName: "세종대왕",
            date: "2025/03/04",
            boxName: "선문대학교 상봉마을 수거함",
            dischargeInfo: "건전지 7개, 방전 배터리 6개, 잔여 용량 배터리 2개",
        },
    ]

    // Stats data
    const statsData = {
        totalBoxes: 63,
        batteryCount: 263,
        activeBatteries: 32,
    }

    const [controlStates, setControlStates] = useState({
        battery: {
            isOpen: false,
        },
        dischargedBattery: {
            isOpen: false,
        },
        remainingCapacityBattery: {
            isOpen: false,
        },
        collectorEntrance: {
            isOpen: false,
        },
    })

    const [isBoxBlocked, setIsBoxBlocked] = useState(false)

    // Handle dropdown changes with reset capability
    const handleYearChange = (e) => {
        setYear(e.target.value)
    }

    const handleMonthChange = (e) => {
        setMonth(e.target.value)
    }

    const handleDayChange = (e) => {
        setDay(e.target.value)
    }

    return (
        <div className="flex min-h-screen w-screen bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <div className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl">수거함 제어</p>
                    <div className="flex">
                        {/* Collection Box Control Interface - Left and Center sections */}
                        <div className="flex w-[1100px] h-[520px] bg-white rounded-2xl shadow-md overflow-hidden">
                            {/* Left Sidebar - Box List */}
                            <div className="w-[350px] h-full flex flex-col border-r">
                                <div>
                                    <div className="relative mx-2 my-4 p-3">
                                        <input
                                            type="text"
                                            placeholder="장소, 주소, 수거함 코드 검색"
                                            className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                                        />
                                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                            <img src={SearchIcon || "/placeholder.svg?height=20&width=20"} alt="검색" />
                                        </div>
                                    </div>
                                </div>

                                {/* Box list with scrollbar */}
                                <div className="overflow-auto flex-1 custom-scrollbar mx-4">
                                    {boxList.map((box) => (
                                        <BoxListItem
                                            key={box.id}
                                            name={box.name}
                                            location={box.location}
                                            date={box.date}
                                            isActive={box.id === 1}
                                            onClick={() => setSelectedBox(box)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Center Section - Map View */}
                            <div className="flex-1 relative flex flex-col">
                                {/* Map title overlay */}
                                <div className="p-10 pb-9 bg-white">
                                    <h2 className="text-2xl font-bold mb-1">{selectedBox.name}</h2>
                                    <p className="text-[#60697E]">
                                        <span className="font-bold">좌표정보</span>{" "}
                                        <span className="font-normal">{selectedBox.location}</span>
                                        <span className="float-right text-sm">설치일자 {selectedBox.date}</span>
                                    </p>
                                </div>

                                {/* Map */}
                                <div className="flex-1 w-full px-10 pb-10">
                                    <Map
                                        center={{ lat: 36.8082, lng: 127.009 }}
                                        style={{ width: "100%", height: "100%" }}
                                        level={3}
                                        className={"border rounded-2xl"}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Box Info - Now as a separate element */}
                        <div className="w-[280px] space-y-4 pl-6">
                            {/* 건전지 (Battery Boxes) */}
                            <div className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">건전지</div>
                                        <div className="text-xl font-bold">{statsData.totalBoxes}개</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방</div>
                                            <RadioButton
                                                selected={controlStates.battery.isOpen}
                                                color="green"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        battery: { isOpen: true },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄</div>
                                            <RadioButton
                                                selected={!controlStates.battery.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        battery: { isOpen: false },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 방전 배터리 (Discharged Batteries) */}
                            <div className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">방전 배터리</div>
                                        <div className="text-xl font-bold">{statsData.batteryCount}개</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방</div>
                                            <RadioButton
                                                selected={controlStates.dischargedBattery.isOpen}
                                                color="green"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        dischargedBattery: { isOpen: true },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄</div>
                                            <RadioButton
                                                selected={!controlStates.dischargedBattery.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        dischargedBattery: { isOpen: false },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 잔여 용량 배터리 (Remaining Capacity Batteries) */}
                            <div className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">잔여 용량 배터리</div>
                                        <div className="text-xl font-bold">{statsData.activeBatteries}개</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방</div>
                                            <RadioButton
                                                selected={controlStates.remainingCapacityBattery.isOpen}
                                                color="green"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        remainingCapacityBattery: { isOpen: true },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄</div>
                                            <RadioButton
                                                selected={!controlStates.remainingCapacityBattery.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        remainingCapacityBattery: { isOpen: false },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 수거자 입구 (Collector Entrance) */}
                            <div className={`bg-white rounded-2xl px-6 py-5 shadow-sm ${isBoxBlocked ? "opacity-70" : ""}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[#60697E]">수거자 입구</div>
                                        <div className="text-[#60697E]">개폐 제어</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>개방</div>
                                            <RadioButton
                                                selected={controlStates.collectorEntrance.isOpen}
                                                color="green"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        collectorEntrance: { isOpen: true },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`font-nomal text-[#7A7F8A] ${isBoxBlocked ? "opacity-50" : ""}`}>폐쇄</div>
                                            <RadioButton
                                                selected={!controlStates.collectorEntrance.isOpen}
                                                color="red"
                                                onClick={() =>
                                                    setControlStates({
                                                        ...controlStates,
                                                        collectorEntrance: { isOpen: false },
                                                    })
                                                }
                                                disabled={isBoxBlocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 수거함 차단 Button (Collection Box Block) */}
                            <button
                                onClick={() => setIsBoxBlocked(!isBoxBlocked)}
                                className={`w-full py-6 ${isBoxBlocked ? "bg-red-600" : "bg-[#21262B]"} text-white rounded-2xl font-medium flex items-center justify-start pl-6 hover:${isBoxBlocked ? "bg-red-700" : "bg-[#1a1f23]"} transition-colors`}
                            >
                                수거함 차단
                                <div className="pl-[80px]">{isBoxBlocked ? "차단됨" : "차단"}</div>
                                <div
                                    className={`w-4 h-4 rounded-full ml-2 ${isBoxBlocked ? "bg-white" : "border-2 border-white"}`}
                                ></div>
                            </button>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-xl pt-10 pb-1">수거함 로그</p>
                        {/* Log Type Dropdown */}
                        <div className="flex">
                            <div className="relative">
                                <select
                                    className={`appearance-none py-3 pr-8 text-base text-black focus:outline-none bg-transparent ${logType === "discharge" ? "font-bold" : "font-medium"}`}
                                    value={logType}
                                    onChange={(e) => setLogType(e.target.value)}
                                >
                                    <option value="discharge" className="font-medium">
                                        배출로그
                                    </option>
                                    <option value="collection" className="font-medium">
                                        수거로그
                                    </option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                                    <img src={DownIcon || "/placeholder.svg"} alt="아래화살표" className="w-3 h-2" />
                                </div>
                            </div>
                            {/* Date Selectors - Year, Month, Day */}
                            <div className="flex items-center ml-4">
                                {/* Year Dropdown */}
                                <div className="relative">
                                    <select
                                        className="appearance-none py-3 pr-6 text-base text-black focus:outline-none bg-transparent font-bold"
                                        value={year}
                                        onChange={handleYearChange}
                                    >
                                        <option value="">연도</option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                        <img src={DownIcon || "/placeholder.svg"} alt="아래화살표" className="w-3 h-2" />
                                    </div>
                                </div>

                                {/* Month Dropdown */}
                                <div className="relative pl-4">
                                    <select
                                        className={`appearance-none py-3 pr-6 text-base text-black focus:outline-none bg-transparent font-bold ${!year ? "opacity-50" : ""}`}
                                        value={month}
                                        onChange={handleMonthChange}
                                        disabled={!year}
                                    >
                                        <option value="">월</option>
                                        {months.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                        <img src={DownIcon || "/placeholder.svg"} alt="아래화살표" className="w-3 h-2" />
                                    </div>
                                </div>

                                {/* Day Dropdown */}
                                <div className="relative pl-4">
                                    <select
                                        className={`appearance-none py-3 pr-6 text-base text-black focus:outline-none bg-transparent font-bold ${!month || !year ? "opacity-50" : ""}`}
                                        value={day}
                                        onChange={handleDayChange}
                                        disabled={!month || !year}
                                    >
                                        <option value="">일</option>
                                        {days.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                        <img src={DownIcon || "/placeholder.svg"} alt="아래화살표" className="w-3 h-2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 밑줄 추가 - 간격 좁힘 */}
                        <div className="relative -mt-2 mb-8">
                            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200 z-0" />
                        </div>
                    </div>

                    {/* 로그 테이블 */}
                    <div className="mt-4 px-6 py-4 bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="w-full">
                            {/* 고정된 헤더 테이블 */}
                            <table className="w-full table-fixed border-b border-gray-200">
                                <colgroup>
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: "15%" }} />
                                    <col style={{ width: "30%" }} />
                                    <col style={{ width: "15%" }} />
                                </colgroup>
                                <thead className="text-left bg-white">
                                <tr className="w-full">
                                    <th className="py-4 px-6 text-sm font-bold text-gray-500">사용자 이름</th>
                                    <th className="py-4 px-6 text-sm font-bold text-gray-500">배출일자</th>
                                    <th className="py-4 px-6 text-sm font-bold text-gray-500">수거함 이름</th>
                                    <th className="py-4 px-6 text-sm font-bold text-gray-500">배출정보</th>
                                    <th className="py-4 px-6 text-sm font-bold text-gray-500"></th>
                                </tr>
                                </thead>
                            </table>
                        </div>

                        {/* 스크롤 가능한 본문 테이블 */}
                        <div className="h-[300px] max-h-[300px] overflow-auto scrollbar-container">
                            <table className="w-full table-fixed border-collapse">
                                <colgroup>
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: "15%" }} />
                                    <col style={{ width: "30%" }} />
                                    <col style={{ width: "15%" }} />
                                </colgroup>
                                <tbody>
                                {logData.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#D1E3EE]/50">
                                        <td className="py-4 px-6 text-sm text-gray-500">{log.userName}</td>
                                        <td className="py-4 px-6 text-sm text-gray-500">{log.date}</td>
                                        <td className="py-4 px-6 text-sm text-gray-500">{log.boxName}</td>
                                        <td className="py-4 px-6 text-sm text-gray-500">{log.dischargeInfo}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="pl-14 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-end gap-1">
                                                사용자 상세정보 보기{" "}
                                                <img src={RightIcon || "/placeholder.svg"} alt="오른쪽 화살표" className="w-2 h-3 ml-1" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <style jsx>{`
                            .scrollbar-container::-webkit-scrollbar {
                                width: 6px;
                            }

                            .scrollbar-container::-webkit-scrollbar-track {
                                background: #f1f1f1;
                                border-radius: 10px;
                            }

                            .scrollbar-container::-webkit-scrollbar-thumb {
                                background: #c1c1c1;
                                border-radius: 10px;
                                height: 50px;
                            }

                            .scrollbar-container::-webkit-scrollbar-thumb:hover {
                                background: #a1a1a1;
                            }
                        `}</style>
                    </div>
                    <div className="pb-32" />
                </div>
            </div>
        </div>
    )
}

function BoxListItem({ name, location, date, isActive, onClick }) {
    return (
        <div
            className={`p-4 border-b flex justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div className="flex items-start">
                <div>
                    <h3 className="text-base font-bold pb-2">{name}</h3>
                    <p className="text-sm font-normal text-gray-500">설치좌표 {location}</p>
                    <p className="text-sm font-normal text-gray-500">설치일자 {date}</p>
                </div>
            </div>
            <button className="text-gray-400 self-start">
                <img src={CopyIcon || "/placeholder.svg?height=16&width=16"} alt="복사" width={16} height={16} />
            </button>
        </div>
    )
}

// Radio button component
function RadioButton({ selected, color = "green", onClick, disabled = false }) {
    // Map color prop to actual Tailwind classes
    const getColorClass = () => {
        switch (color) {
            case "green":
                return "bg-[#6DDFC0]"
            case "red":
                return "bg-[#FF7571]"
            default:
                return "bg-[#FF7571]"
        }
    }

    return (
        <div
            className={`relative w-5 h-5 rounded-full ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onClick={disabled ? undefined : onClick}
        >
            {selected ? (
                <div className="w-full h-full rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <div className={`w-[14px] h-[14px] rounded-full ${getColorClass()}`}></div>
                </div>
            ) : (
                <div className="w-full h-full rounded-full border-2 border-gray-300"></div>
            )}
        </div>
    )
}

export default N_boxControlLogPage