"use client"

import { useState, useEffect, useRef } from "react"
import { Map, MapMarker } from "react-kakao-maps-sdk"
import ArrowLeftIcon from "../assets/arrow_left.png"
import ArrowRightIcon from "../assets/arrow_right.png"
import SearchIcon from "../assets/검색.png"
import CopyIcon from "../assets/copy.png"
import GreenIcon from "../assets/아이콘 GREEN.png"
import YellowIcon from "../assets/아이콘 YELLOW.png"
import RedIcon from "../assets/아이콘 RED.png"
import GreenSelectIcon from "../assets/아이콘 GREEN 선택효과.png"
import YellowSelectIcon from "../assets/아이콘 YELLOW 선택효과.png"
import RedSelectIcon from "../assets/아이콘 RED 선택효과.png"
import FireIcon from "../assets/아이콘 화재감지.svg"

const MapWithSidebar = ({ filteredBoxes, isMainPage= false, isAddRemovePage = false }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [selectedBoxId, setSelectedBoxId] = useState(3)
    const [searchTerm, setSearchTerm] = useState("")
    const [addressMap, setAddressMap] = useState({})
    const [copiedId, setCopiedId] = useState(null);

    // Add refs for list items and map
    const listItemRefs = useRef({})
    const [map, setMap] = useState(null)

    const displayedBoxes = searchTerm
        ? filteredBoxes.filter((box) => {
            const nameMatch = box.name.toLowerCase().includes(searchTerm.toLowerCase());
            const address = addressMap[box.id] || "";
            const addressMatch = address.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || addressMatch;
        })
        : filteredBoxes;

    const addressFetchedRef = useRef(false);

    useEffect(() => {
        // 이미 주소를 가져왔거나 filteredBoxes가 비어있으면 실행하지 않음
        if (addressFetchedRef.current || filteredBoxes.length === 0) {
            return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();
        const fetchAddresses = async () => {
            const newAddressMap = {};

            // 이미 주소가 있는 경우 유지
            const existingAddresses = { ...addressMap };

            for (const box of filteredBoxes) {
                // 이미 주소가 있으면 건너뛰기
                if (existingAddresses[box.id]) {
                    newAddressMap[box.id] = existingAddresses[box.id];
                    continue;
                }

                if (!box.lat || !box.lng) continue;

                try {
                    await new Promise((resolve) => {
                        geocoder.coord2Address(box.lng, box.lat, (result, status) => {
                            if (status === window.kakao.maps.services.Status.OK) {
                                newAddressMap[box.id] = result[0].road_address
                                    ? result[0].road_address.address_name
                                    : result[0].address.address_name;
                            } else {
                                newAddressMap[box.id] = "주소 변환 실패";
                            }
                            resolve();
                        });
                    });
                } catch (error) {
                    console.error("주소 변환 중 오류 발생:", error);
                    newAddressMap[box.id] = "주소 변환 실패";
                }
            }

            setAddressMap(prev => ({ ...prev, ...newAddressMap }));
            addressFetchedRef.current = true;
        };

        fetchAddresses();
    }, [filteredBoxes]);

    const formatInstallStatus = (status) => {
        if (!status) return "상태 정보 없음";

        const statusMap = {
            "INSTALL_REQUEST": "설치 요청 중",
            "INSTALL_IN_PROGRESS": "설치 진행 중",
            "INSTALL_COMPLETED": "설치 완료",
            "INSTALL_CONFIRME": "설치 확정",
            "REMOVE_REQUEST": "제거 요청 중",
            "REMOVE_IN_PROGRESS": "제거 진행 중",
            "REMOVE_COMPLETED": "제거 완료",
            "REMOVE_CONFIRMED": "제거 확정"
        };

        return statusMap[status] || status;
    };

    const handleCopy = (e, boxId, text) => {
        e.stopPropagation(); // 이벤트 버블링 방지

        navigator.clipboard.writeText(text)
            .then(() => {
                // 복사된 항목 ID 저장
                setCopiedId(boxId);

                // 1.5초 후 상태 초기화
                setTimeout(() => {
                    setCopiedId(null);
                }, 1500);
            })
            .catch(err => {
                console.error('복사 실패:', err);
            });
    };

    // ✅ 아이콘 결정 (화재 우선)
    const getMarkerIcon = (box) => {
        if (isAddRemovePage) {
            // 설치 상태인 경우 (INSTALL_로 시작하는 상태)
            if (box.installStatus && box.installStatus.startsWith("INSTALL_")) {
                return selectedBoxId === box.id ? GreenSelectIcon : GreenIcon
            }
            // 제거 상태인 경우 (REMOVE_로 시작하는 상태)
            else if (box.installStatus && box.installStatus.startsWith("REMOVE_")) {
                return selectedBoxId === box.id ? RedSelectIcon : RedIcon
            }
            // 상태가 없는 경우 기본 아이콘
            return selectedBoxId === box.id ? YellowSelectIcon : YellowIcon
        } else {
            if (box.status === "fire") return FireIcon
            const maxVolume = Math.max(box.volume1 || 0, box.volume2 || 0, box.volume3 || 0)
            if (maxVolume <= 50) return selectedBoxId === box.id ? GreenSelectIcon : GreenIcon
            if (maxVolume <= 80) return selectedBoxId === box.id ? YellowSelectIcon : YellowIcon
            return selectedBoxId === box.id ? RedSelectIcon : RedIcon
        }
    }

    // ✅ 크기 결정
    const getMarkerSize = (box) => {
        if (box.status === "fire") {
            return selectedBoxId === box.id ? { width: 45, height: 50 } : { width: 34, height: 40 }
        }
        return selectedBoxId === box.id ? { width: 45, height: 50 } : { width: 34, height: 40 }
    }

    // Handle marker click - select box and scroll to list item
    const handleMarkerClick = (boxId) => {
        setSelectedBoxId(boxId)

        // Scroll the list item into view
        if (listItemRefs.current[boxId] && isSidebarOpen) {
            listItemRefs.current[boxId].scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            })
        }
    }

    // Handle list item click - select box and center map on marker
    const handleListItemClick = (box) => {
        setSelectedBoxId(box.id)

        // Center the map on the selected marker
        if (map) {
            map.setCenter(new window.kakao.maps.LatLng(box.lat, box.lng))
        }
    }

    return (
        <div className="flex bg-white rounded-2xl shadow-md overflow-hidden h-[570px] relative">
            {/* 토글 화살표 */}
            <img
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                src={isSidebarOpen ? ArrowLeftIcon : ArrowRightIcon}
                alt="toggle arrow"
                className={`absolute top-1/2 -translate-y-1/2 cursor-pointer rounded-r transition-all duration-300 w-5 h-10 z-20 ${
                    isSidebarOpen ? "left-[350px]" : "left-0"
                }`}
                style={{ boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)" }}
            />

            {/* 사이드바 */}
            <div
                className={`transition-all duration-300 ${isSidebarOpen ? "w-[350px]" : "w-0"} overflow-hidden shadow-md h-full relative z-10 bg-white`}
            >
                <div className="h-full">
                    {/* 검색창 */}
                    <div className="relative mx-2 mt-4 p-3">
                        <input
                            type="text"
                            placeholder="장소, 주소, 수거함 코드 검색"
                            className="w-full py-2 pl-4 rounded-2xl border border-black/20 text-sm focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <img
                            src={SearchIcon || "/placeholder.svg"}
                            alt="검색 아이콘"
                            className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        />
                    </div>

                    {/* 리스트 */}
                    <div className="overflow-y-auto h-[calc(100%-60px)] mx-4">
                        {displayedBoxes.map((box) => (
                            <div
                                key={box.id}
                                ref={(el) => (listItemRefs.current[box.id] = el)}
                                className={`border-b border-gray-100 p-3 cursor-pointer ${selectedBoxId === box.id ? "bg-blue-50" : "hover:bg-gray-50"}`}
                                onClick={() => handleListItemClick(box)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-[#21262B]">{box.name}</h3>
                                        <p className="font-normal text-sm text-[#60697E] mt-2">{addressMap[box.id] || "주소 변환중..."}</p>
                                        <p className="font-normal text-sm text-[#60697E] mt-1">
                                            {isAddRemovePage ? (
                                                formatInstallStatus(box.installStatus)
                                            ) : (
                                                <>
                                                    {typeof box.lat === "number" ? box.lat.toFixed(8) : box.lat} /{" "}
                                                    {typeof box.lng === "number" ? box.lng.toFixed(8) : box.lng}
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <button
                                            className="text-gray-400 p-1"
                                            onClick={(e) => handleCopy(e, box.id, box.name)}
                                        >
                                            <img src={CopyIcon || "/placeholder.svg"} alt="복사" className="w-4 h-5"/>
                                        </button>

                                        {copiedId === box.id && (
                                            <div
                                                className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 지도 */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <Map
                    center={{lat: 36.8082, lng: 127.009}}
                    style={{width: "100%", height: "100%"}}
                    level={3}
                    onCreate={setMap}
                >
                {filteredBoxes.map((box) => (
                        <MapMarker
                            key={box.id}
                            position={{ lat: box.lat, lng: box.lng }}
                            image={{
                                src: getMarkerIcon(box),
                                size: getMarkerSize(box),
                                options: { offset: { x: 20, y: 40 } },
                            }}
                            onClick={() => handleMarkerClick(box.id)}
                        />
                    ))}
                </Map>
            </div>
        </div>
    )
}

export default MapWithSidebar
