import { useState, useEffect } from "react"
import { Map } from "react-kakao-maps-sdk"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import Sample from "../../assets/Sample.png"
import DownIcon from "../../assets/Down.png"
import Expansion from "../../assets/Expansion.png"

export default function FireMonitoring() {
    // 검색어 상태 추가
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedOption, setSelectedOption] = useState("전체")
    const [isOpen, setIsOpen] = useState(false)
    const [showModal, setShowModal] = useState(false)
    // 복사된 사용자 ID 상태 추가
    const [copiedId, setCopiedId] = useState(null)
    // 선택된 사용자 상태 추가
    const [selectedUser, setSelectedUser] = useState(null)

    const options = ["전체", "화재처리 진행", "화재처리 완료", "화재처리 확정"]

    // 사용자 데이터 추가
    const [users, setUsers] = useState([
        {
            id: "user1",
            name: "홍길동",
            status: "화재처리 완료",
            date: "2025.03.17",
            location: { province: "충청남도", city: "아산시" },
            coordinates: "36.8082 / 127.009",
            boxName: "선문대학교 도서관 앞 수거함",
        },
        {
            id: "user2",
            name: "김유신",
            status: "화재처리 진행",
            date: "2025.03.16",
            location: { province: "충청남도", city: "아산시" },
            coordinates: "36.8082 / 127.009",
            boxName: "선문대학교 인문관 1층 수거함",
        },
        {
            id: "user3",
            name: "이순신",
            status: "화재처리 완료",
            date: "2025.03.13",
            location: { province: "충청남도", city: "아산시" },
            coordinates: "36.8082 / 127.009",
            boxName: "선문대학교 상봉마을 수거함",
        },
        {
            id: "user4",
            name: "공자철",
            status: "화재처리 확정",
            date: "2025.03.09",
            location: { province: "충청남도", city: "아산시" },
            coordinates: "36.8082 / 127.009",
            boxName: "선문대학교 서문 앞 수거함",
        },
        {
            id: "user5",
            name: "강감찬",
            status: "화재처리 진행",
            date: "2025.03.08",
            location: { province: "충청남도", city: "아산시" },
            coordinates: "36.8082 / 127.009",
            boxName: "선문대학교 동문 앞 수거함",
        },
        {
            id: "user6",
            name: "장영실",
            status: "화재처리 진행",
            date: "2025.03.07",
            location: { province: "충청남도", city: "아산시" },
            coordinates: "36.8082 / 127.009",
            boxName: "선문대학교 기숙사 앞 수거함",
        },
        {
            id: "user7",
            name: "세종대왕",
            status: "화재처리 확정",
            date: "2025.03.05",
            location: { province: "충청남도", city: "아산시" },
            coordinates: "36.8082 / 127.009",
            boxName: "선문대학교 학생회관 앞 수거함",
        },
    ])

    // 컴포넌트 마운트 시 기본 선택 사용자 설정
    useEffect(() => {
        // 기본적으로 첫 번째 사용자 선택
        setSelectedUser(users[1]) // 김유신을 기본 선택
    }, [users])

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

    // 사용자 선택 핸들러
    const handleUserSelect = (user) => {
        setSelectedUser(user)
    }

    const toggleDropdown = () => setIsOpen(!isOpen)

    const selectOption = (option) => {
        setSelectedOption(option)
        setIsOpen(false)
    }

    const openModal = () => setShowModal(true)

    const closeModal = () => setShowModal(false)

    // 검색어와 선택된 옵션에 따라 필터링된 사용자 목록 계산
    const filteredUsers = users.filter((user) => {
        // 이름으로 검색 필터링
        const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase())

        // 상태로 필터링 (전체 옵션이면 모든 상태 포함)
        const statusMatch = selectedOption === "전체" || user.status === selectedOption

        return nameMatch && statusMatch
    })

    return (
        <div className="flex h-[555px] bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-[386px] h-full flex flex-col border-r">
                <div className="flex items-center gap-2 mx-2 my-4 pl-3">
                    {/* 검색 입력 필드 */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="수거자 이름 검색"
                            className="w-full py-2 px-5 rounded-2xl border border-gray-300 text-sm focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg"} alt="검색" />
                        </div>
                    </div>

                    {/* 드롭다운 */}
                    <div className="relative min-w-[140px] pr-3">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center justify-between w-full py-2 px-5 rounded-2xl border border-[#7A7F8A] text-sm"
                        >
                            <span>{selectedOption}</span>
                            <img src={DownIcon || "/placeholder.svg"} alt="Down" className="w-3 h-2 ml-2" />
                        </button>

                        {isOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                                {options.map((option) => (
                                    <div
                                        key={option}
                                        className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
                                        onClick={() => selectOption(option)}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* User list with scrollbar */}
                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    {filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">검색 결과가 없습니다</div>
                    ) : (
                        filteredUsers.map((user) => (
                            <UserListItem
                                key={user.id}
                                userId={user.id}
                                name={user.name}
                                status={user.status}
                                date={user.date}
                                isActive={selectedUser && selectedUser.id === user.id}
                                onClick={() => handleUserSelect(user)}
                                handleCopy={handleCopy}
                                copiedId={copiedId}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Center Section - Map View */}
            <div className="flex-1 relative flex flex-col">
                {/* Map title overlay */}
                {selectedUser && (
                    <div className="p-10 pb-9 bg-white">
                        <h2 className="text-2xl text-[#21262B] font-bold mb-1">
                            [{selectedUser.status}] {selectedUser.boxName}
                        </h2>
                        <p className="text-[#60697E]">
                            <span className="font-bold">화재처리 좌표</span>{" "}
                            <span className="font-normal">{selectedUser.coordinates}</span>
                            <span className="float-right text-sm">알림 일자 {selectedUser.date}</span>
                        </p>
                    </div>
                )}

                {/* Map */}
                <div className="flex-1 w-full px-10 pb-14">
                    <Map
                        center={{ lat: 36.8082, lng: 127.009 }}
                        style={{ width: "100%", height: "100%" }}
                        level={3}
                        className={"border rounded-2xl"}
                    />
                </div>
            </div>

            {/* Right Sidebar - User Info */}
            {selectedUser && (
                <div className="w-[290px] h-full flex flex-col border-l p-8">
                    <div className="mb-10">
                        <h2 className="text-2xl text-[#21262B] font-bold pb-1">{selectedUser.name}</h2>
                        <p className="text-[#60697E]">
                            <span className="font-bold">가입일자</span>
                            <span className="ml-3 font-normal">2025.02.03</span>
                        </p>
                    </div>

                    <div className="space-y-2 text-sm text-[#60697E]">
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">광역시/도</span>
                            <span className="font-nomal">{selectedUser.location.province}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">담당지역</span>
                            <span className="font-nomal">{selectedUser.location.city}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">상태</span>
                            <span className="font-nomal">{selectedUser.status}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">알림일자</span>
                            <span className="font-nomal">{selectedUser.date}</span>
                        </div>
                    </div>
                    <div className="relative inline-block">
                        <img
                            src={Sample || "/placeholder.svg"}
                            alt="사진"
                            width="234px"
                            height="189px"
                            className="rounded-2xl mt-7 cursor-pointer"
                            onClick={openModal}
                        />
                        <img
                            src={Expansion || "/placeholder.svg"}
                            alt="확대"
                            width="20px"
                            height="20px"
                            className="absolute bottom-4 right-4 cursor-pointer"
                            onClick={openModal}
                        />
                    </div>
                    <span className="mt-2 flex gap-2">
            <button className="bg-[#21262B] text-white rounded-2xl py-2 px-14">수락</button>
            <button className="bg-[#FF7571] text-white rounded-2xl py-2 px-6">거절</button>
          </span>
                </div>
            )}

            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={Sample || "/placeholder.svg"}
                            alt="사진 확대"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                    </div>
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

function UserListItem({ userId, name, status, date, isActive, onClick, handleCopy, copiedId }) {
    return (
        <div
            className={`p-4 border-b flex justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div className="flex items-start">
                <div>
                    <h3 className="text-base text-[#21262B] font-bold">{name}</h3>
                    <p className="text-sm font-normal text-[#60697E] mt-1">{status}</p>
                    <p className="text-sm font-normal text-[#60697E]">{date}</p>
                </div>
            </div>
            <div className="text-gray-400 self-start relative">
                <button onClick={(e) => handleCopy(e, userId, name)}>
                    <img src={CopyIcon || "/placeholder.svg"} alt="복사" width={16} height={16} />
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

function InfoItem({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-[#21262B] font-bold">{label}</span>
            <span className="font-nomal">{value}</span>
        </div>
    )
}