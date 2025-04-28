import { useState, useEffect } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import ArrowLeftIcon from "../assets/arrow_left.png";
import ArrowRightIcon from "../assets/arrow_right.png";
import SearchIcon from "../assets/검색.png";
import CopyIcon from "../assets/copy.png";
import GreenIcon from "../assets/아이콘 GREEN.png";
import YellowIcon from "../assets/아이콘 YELLOW.png";
import RedIcon from "../assets/아이콘 RED.png";
import GreenSelectIcon from "../assets/아이콘 GREEN 선택효과.png";
import YellowSelectIcon from "../assets/아이콘 YELLOW 선택효과.png";
import RedSelectIcon from "../assets/아이콘 RED 선택효과.png";
import FireIcon from "../assets/아이콘 화재감지.svg";

const MapWithSidebar = ({ filteredBoxes }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedBoxId, setSelectedBoxId] = useState(3);
    const [searchTerm, setSearchTerm] = useState("");
    const [addressMap, setAddressMap] = useState({});

    const displayedBoxes = searchTerm
        ? filteredBoxes.filter((box) => box.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : filteredBoxes;

    useEffect(() => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        const fetchAddresses = async () => {
            const newAddressMap = {};
            for (const box of filteredBoxes) {
                if (!box.lat || !box.lng) continue;
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
            }
            setAddressMap(newAddressMap);
        };

        if (filteredBoxes.length > 0) {
            fetchAddresses();
        }
    }, [filteredBoxes]);

    // ✅ 아이콘 결정 (화재 우선)
    const getMarkerIcon = (box) => {
        if (box.status === "fire") return FireIcon;
        const maxVolume = Math.max(box.volume1 || 0, box.volume2 || 0, box.volume3 || 0);
        if (maxVolume <= 50) return selectedBoxId === box.id ? GreenSelectIcon : GreenIcon;
        if (maxVolume <= 80) return selectedBoxId === box.id ? YellowSelectIcon : YellowIcon;
        return selectedBoxId === box.id ? RedSelectIcon : RedIcon;
    };

    // ✅ 크기 결정
    const getMarkerSize = (box) => {
        if (box.status === "fire") {
            return selectedBoxId === box.id
                ? { width: 45, height: 50 }
                : { width: 34, height: 40 };
        }
        return selectedBoxId === box.id
            ? { width: 45, height: 50 }
            : { width: 34, height: 40 };
    };

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
            <div className={`transition-all duration-300 ${isSidebarOpen ? "w-[350px]" : "w-0"} overflow-hidden shadow-md h-full relative z-10 bg-white`}>
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
                        <img src={SearchIcon} alt="검색 아이콘" className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>

                    {/* 리스트 */}
                    <div className="overflow-y-auto h-[calc(100%-60px)] mx-4">
                        {displayedBoxes.map((box) => (
                            <div
                                key={box.id}
                                className={`border-b border-gray-100 p-3 cursor-pointer ${selectedBoxId === box.id ? "bg-blue-50" : "hover:bg-gray-50"}`}
                                onClick={() => setSelectedBoxId(box.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-[#21262B]">{box.name}</h3>
                                        <p className="font-normal text-sm text-[#60697E] mt-2">{addressMap[box.id] || "주소 변환중..."}</p>
                                        <p className="font-normal text-sm text-[#60697E] mt-1">
                                            {typeof box.lat === "number" ? box.lat.toFixed(8) : box.lat} / {typeof box.lng === "number" ? box.lng.toFixed(8) : box.lng}
                                        </p>
                                    </div>
                                    <button className="text-gray-400 p-1">
                                        <img src={CopyIcon} alt="복사" className="w-4 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 지도 */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <Map center={{ lat: 36.8082, lng: 127.009 }} style={{ width: "100%", height: "100%" }} level={3}>
                    {filteredBoxes.map((box) => (
                        <MapMarker
                            key={box.id}
                            position={{ lat: box.lat, lng: box.lng }}
                            image={{
                                src: getMarkerIcon(box),
                                size: getMarkerSize(box),
                                options: { offset: { x: 20, y: 40 } },
                            }}
                            onClick={() => setSelectedBoxId(box.id)}
                        />
                    ))}
                </Map>
            </div>
        </div>
    );
};

export default MapWithSidebar;