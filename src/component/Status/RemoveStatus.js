import { useState, useEffect } from "react"
import { Map, MapMarker } from "react-kakao-maps-sdk"
import SearchIcon from "../../assets/검색.png"
import CopyIcon from "../../assets/copy.png"
import RedIcon from "../../assets/아이콘 RED.png"

// 컴포넌트를 수정하여 부모 컴포넌트에서 처리된 데이터를 받도록 함
export default function RemoveStatus({ statuses, addressData = {}, processedBoxes = [] }) {
    const [selectedBox, setSelectedBox] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [displayedBoxes, setDisplayedBoxes] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [addressText, setAddressText] = useState("주소 로딩 중...")

    // 초기 데이터 설정 - 디버깅 로그 추가
    useEffect(() => {
        setIsLoading(true)
        console.log("RemoveStatus - 원본 데이터:", processedBoxes)

        if (processedBoxes && processedBoxes.length > 0) {
            // 필터링 없이 모든 데이터 사용
            setDisplayedBoxes([...processedBoxes]) // 배열 복사본 사용
            console.log("RemoveStatus - 표시할 데이터:", [...processedBoxes])

            if (!selectedBox && processedBoxes.length > 0) {
                setSelectedBox(processedBoxes[0])
                console.log("RemoveStatus - 선택된 박스:", processedBoxes[0])
            }
        } else {
            console.log("RemoveStatus - 데이터 없음")
        }

        setIsLoading(false)
    }, [processedBoxes])

    // 검색어에 따른 필터링
    useEffect(() => {
        if (!processedBoxes || processedBoxes.length === 0) {
            console.log("RemoveStatus - 검색 필터링: 원본 데이터 없음")
            setDisplayedBoxes([])
            return
        }

        if (searchTerm.trim() === "") {
            setDisplayedBoxes([...processedBoxes])
            console.log("RemoveStatus - 검색 필터링: 모든 데이터 표시", [...processedBoxes])
        } else {
            const filtered = processedBoxes.filter(
                (box) =>
                    (box.user && box.user.name && box.user.name.includes(searchTerm)) ||
                    (box.name && box.name.includes(searchTerm)),
            )
            setDisplayedBoxes(filtered)
            console.log("RemoveStatus - 검색 필터링 결과:", filtered)
        }
    }, [searchTerm, processedBoxes])

    // 좌표를 주소로 변환하는 함수
    const convertCoordsToFullAddress = (lng, lat) => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
            setAddressText("주소 변환 불가")
            return
        }

        const geocoder = new window.kakao.maps.services.Geocoder()

        geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
                const addressInfo = result[0]

                // 도로명 주소 또는 지번 주소 사용
                const roadAddress = addressInfo.road_address ? addressInfo.road_address.address_name : ""
                const jibunAddress = addressInfo.address ? addressInfo.address.address_name : ""

                // 도로명 주소가 있으면 도로명 주소 사용, 없으면 지번 주소 사용
                const fullAddress = roadAddress || jibunAddress || "주소 정보 없음"
                setAddressText(fullAddress)
            } else {
                setAddressText("주소 변환 실패")
            }
        })
    }

    // selectedBox가 변경될 때마다 주소 변환
    useEffect(() => {
        if (selectedBox && selectedBox.lng && selectedBox.lat) {
            setAddressText("주소 로딩 중...")
            convertCoordsToFullAddress(selectedBox.lng, selectedBox.lat)
        }
    }, [selectedBox])

    // 제거 상태 한글 변환
    const getStatusText = (status) => {
        // status가 없으면 기본값 사용
        if (!status) {
            return "상태 없음"
        }

        const statusMap = {
            REMOVE_REQUEST: "제거 요청",
            REMOVE_IN_PROGRESS: "제거 진행중",
            REMOVE_COMPLETED: "제거 완료",
            REMOVE_CONFIRMED: "제거 확정",
        }
        return statusMap[status] || status
    }

    // 주소 복사 함수
    const copyAddress = () => {
        if (addressText) {
            try {
                // 임시 텍스트 영역 생성
                const textArea = document.createElement("textarea");
                textArea.value = addressText;

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
                    alert("주소가 클립보드에 복사되었습니다.");
                } else {
                    console.error("주소 복사 실패");
                }
            } catch (err) {
                console.error("주소 복사 실패:", err);
            }
        }
    };

    console.log("RemoveStatus - 렌더링 시점 데이터:", {
        displayedBoxes,
        selectedBox,
        isLoading,
        boxCount: displayedBoxes.length,
    })

    if (isLoading) {
        return (
            <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    // 데이터가 없는 경우에도 UI 구조는 유지하고 리스트만 비움
    if (!processedBoxes || processedBoxes.length === 0) {
        return (
            <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden">
                {/* Left Sidebar - User List (Empty) */}
                <div className="w-[350px] h-full flex flex-col border-r">
                    <div>
                        <div className="relative mx-2 my-4 p-3">
                            <input
                                type="text"
                                placeholder="ID 검색"
                                className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                <img src={SearchIcon || "/placeholder.svg"} alt="검색" />
                            </div>
                        </div>
                    </div>
                    {/* Empty list area */}
                    <div className="overflow-auto flex-1 custom-scrollbar ml-4"></div>
                </div>

                {/* Empty center and right sections */}
                <div className="flex-1"></div>
                <div className="w-[290px] border-l"></div>
            </div>
        )
    }

    return (
        <div className="flex h-[525px] bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Left Sidebar - User List */}
            <div className="w-[350px] h-full flex flex-col border-r">
                <div>
                    <div className="relative mx-2 my-4 p-3">
                        <input
                            type="text"
                            placeholder="ID 검색"
                            className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                            <img src={SearchIcon || "/placeholder.svg"} alt="검색" />
                        </div>
                    </div>
                </div>

                {/* User list with scrollbar */}
                <div className="overflow-auto flex-1 custom-scrollbar ml-4">
                    {displayedBoxes.length > 0
                        ? displayedBoxes.map((box) => (
                            <UserListItem
                                key={box.id}
                                boxId={box.id}
                                name={box.user?.name || box.name || "미지정"}
                                status={getStatusText(box.installStatus)}
                                date={box.removeInfo?.createdAt || box.installInfo?.createdAt || box.createdAt || "정보 없음"}
                                isActive={selectedBox && selectedBox.id === box.id}
                                onClick={() => setSelectedBox(box)}
                            />
                        ))
                        : searchTerm.trim() !== "" && <div className="p-4"></div>}
                </div>
            </div>

            {/* Center Section - Map View */}
            {selectedBox && (
                <div className="flex-1 relative flex flex-col">
                    {/* Map title overlay */}
                    <div className="p-10 pb-9 bg-white">
                        <h2 className="text-2xl text-[#21262B] font-bold mb-1">
                            [{getStatusText(selectedBox.installStatus || "상태 없음")}] {selectedBox.name}
                        </h2>
                        <p className="text-[#60697E]">
                            <span className="font-bold">제거 주소</span>{" "}
                            <span className="font-normal cursor-pointer hover:text-blue-500" onClick={copyAddress}>
                {addressText}
              </span>
                            <span className="float-right text-sm">
                알림 일자 {selectedBox.removeInfo?.alarmDate || selectedBox.removeInfo?.createdAt || "정보 없음"}
              </span>
                        </p>
                    </div>

                    {/* Map */}
                    <div className="flex-1 w-full px-10 pb-10">
                        <Map
                            center={{ lat: selectedBox.lat, lng: selectedBox.lng }}
                            style={{ width: "100%", height: "100%" }}
                            level={3}
                            className={"border rounded-2xl"}
                        >
                            <MapMarker
                                position={{ lat: selectedBox.lat, lng: selectedBox.lng }}
                                image={{
                                    src: RedIcon,
                                    size: {
                                        width: 44,
                                        height: 50,
                                    },
                                }}
                            />
                        </Map>
                    </div>
                </div>
            )}

            {/* Right Sidebar - User Info */}
            {selectedBox && (
                <div className="w-[290px] h-full flex flex-col border-l p-8">
                    <div className="mb-10">
                        <h2 className="text-2xl text-[#21262B] font-bold pb-1">
                            {selectedBox.user?.name || selectedBox.name || "미지정"}
                        </h2>
                    </div>

                    <div className="space-y-2 text-sm text-[#60697E]">
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">광역시/도</span>
                            <span className="font-nomal">{addressData[selectedBox.id]?.region || "정보 없음"}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">시/군/구</span>
                            <span className="font-nomal">{addressData[selectedBox.id]?.city || "정보 없음"}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">상태</span>
                            <span className="font-nomal">{getStatusText(selectedBox.installStatus || "상태 없음")}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold w-[70px]">알림일자</span>
                            <span className="font-nomal">
                {selectedBox.removeInfo?.alarmDate || selectedBox.removeInfo?.createdAt || "정보 없음"}
              </span>
                        </div>
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

function UserListItem({ boxId, name, status, date, isActive, onClick }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = (e) => {
        e.stopPropagation();

        try {
            // 임시 텍스트 영역 생성
            const textArea = document.createElement("textarea");
            textArea.value = name;

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
                setCopied(true);

                // 1초 후에 체크마크 숨기기
                setTimeout(() => {
                    setCopied(false);
                }, 1000);
            } else {
                console.error("복사 실패");
            }
        } catch (err) {
            console.error("복사 실패:", err);
        }
    };

    return (
        <div
            className={`p-4 border-b flex justify-between cursor-pointer ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={onClick}
        >
            <div className="flex items-start">
                <div>
                    <h3 className="text-base text-[#21262B] font-bold">{name}</h3>
                    <p className="text-sm text-[#60697E] font-normal text-gray-500 mt-1">{status}</p>
                    <p className="text-sm text-[#60697E] font-normal text-gray-500">{date}</p>
                </div>
            </div>
            <button className="text-gray-400 self-start relative" onClick={handleCopy}>
                <img src={CopyIcon || "/placeholder.svg"} alt="복사" width={16} height={16} />
                {copied && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                        ✓
                    </div>
                )}
            </button>
        </div>
    )
}