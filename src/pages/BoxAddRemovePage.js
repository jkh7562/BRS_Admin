import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchBoxes } from "../slices/boxSlice";
import NavigationBar from "../component/NavigationBar";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { requestInstallBox, requestRemoveBox, requestInstallConfirmed, requestRemoveConfirmed } from "../api/apiServices";
import useBoxes from "../hooks/useBoxes";

const BoxAddRemovePage = () => {
    const dispatch = useDispatch();
    const { boxes, loading, error } = useBoxes();

    const [filter, setFilter] = useState("설치");
    const [userAddedMarker, setUserAddedMarker] = useState(null);
    const [boxName, setBoxName] = useState("");
    const [boxIp, setBoxIp] = useState("");
    const [isFromExistingBox, setIsFromExistingBox] = useState(false);
    const [selectedBoxId, setSelectedBoxId] = useState(null);

    const handleSubmitRequest = async () => {
        try {
            if (isFromExistingBox) {
                if (!selectedBoxId) {
                    alert("❗ 수거함 ID가 없습니다.");
                    return;
                }
                const result = await requestRemoveBox(selectedBoxId);
                alert(`✅ 제거 요청 완료: ${result}`);
            } else {
                if (!boxName || !boxIp) {
                    alert("❗ 이름과 IP를 입력해주세요.");
                    return;
                }

                const payload = {
                    name: boxName,
                    ipAddress: boxIp,
                    latitude: userAddedMarker.lat,
                    longitude: userAddedMarker.lng
                };

                const result = await requestInstallBox(payload);
                alert(`✅ 설치 요청 완료: ${result}`);
            }

            setUserAddedMarker(null);
            setBoxName("");
            setBoxIp("");
            setSelectedBoxId(null);
            setIsFromExistingBox(false);
            dispatch(fetchBoxes());
        } catch (err) {
            alert("❌ 요청 실패");
        }
    };

    // 필터링 함수: 설치 상태나 제거 상태에 맞는 박스를 필터링
    const filteredBoxes = boxes.filter((box) => {
        if (filter === "설치") {
            return box.installStatus === 'INSTALL_REQUEST' || box.installStatus === 'INSTALL_IN_PROGRESS' || box.installStatus === 'INSTALL_CONFIRMED' || box.installStatus === 'INSTALL_COMPLETED';
        }
        if (filter === "제거") {
            return box.installStatus === 'REMOVE_REQUEST' || box.installStatus === 'REMOVE_IN_PROGRESS' || box.installStatus === 'REMOVE_CONFIRMED' || box.installStatus === 'REMOVE_COMPLETED';
        }
        return true;
    });

    // 수락 버튼 클릭 처리 함수
    const handleAccept = async (boxId) => {
        try {
            if (boxId) {
                const result = await requestInstallConfirmed(boxId); // 설치 확정 API 호출
                alert(`수거함 ${boxId} 설치 확정 완료`);
                dispatch(fetchBoxes()); // 박스 데이터 갱신
            }
        } catch (err) {
            alert("❌ 수락 처리 실패");
        }
    };

    // 거절 버튼 클릭 처리 함수
    const handleReject = async (boxId) => {
        try {
            if (boxId) {
                const result = await requestRemoveConfirmed(boxId); // 제거 확정 API 호출
                alert(`수거함 ${boxId} 제거 확정 완료`);
                dispatch(fetchBoxes()); // 박스 데이터 갱신
            }
        } catch (err) {
            alert("❌ 거절 처리 실패");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 items-center px-4 pb-10">
            <NavigationBar />

            <div className="mt-24 w-3/4 bg-white shadow-md p-4 rounded">
                {loading ? (
                    <p>⏳ 박스 데이터를 불러오는 중...</p>
                ) : error ? (
                    <p>🚨 오류 발생: {error.message}</p>
                ) : (
                    <Map
                        center={{lat: 36.8082, lng: 127.009}}
                        style={{width: "100%", height: "450px"}}
                        level={3}
                        onClick={(_, mouseEvent) => {
                            const latlng = mouseEvent.latLng;
                            setUserAddedMarker({lat: latlng.getLat(), lng: latlng.getLng()});
                            setBoxName("");
                            setBoxIp("");
                            setIsFromExistingBox(false);
                            setSelectedBoxId(null);
                        }}
                    >
                        {filteredBoxes.map((box) => (
                            <MapMarker
                                key={box.id}
                                position={{lat: box.lat, lng: box.lng}}
                                onClick={() => {
                                    setUserAddedMarker({lat: box.lat, lng: box.lng});
                                    setBoxName(box.name);
                                    setBoxIp("");
                                    setIsFromExistingBox(true);
                                    setSelectedBoxId(box.id);
                                }}
                            />
                        ))}

                        {userAddedMarker && (
                            <MapMarker position={userAddedMarker}>
                                <div className="w-[220px] p-2 bg-white rounded-lg shadow border text-sm">
                                    <div
                                        className={`font-bold mb-1 ${isFromExistingBox ? "text-red-600" : "text-green-600"}`}>
                                        {isFromExistingBox ? "수거함 제거 요청" : "수거함 설치 요청"}
                                    </div>

                                    {isFromExistingBox ? (
                                        <p className="text-xs mb-2">
                                            <strong>이름:</strong> {boxName}
                                        </p>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                placeholder="수거함 이름"
                                                value={boxName}
                                                onChange={(e) => setBoxName(e.target.value)}
                                                className="w-full mb-1 px-2 py-1 border rounded text-xs"
                                            />
                                            <input
                                                type="text"
                                                placeholder="수거함 IP"
                                                value={boxIp}
                                                onChange={(e) => setBoxIp(e.target.value)}
                                                className="w-full mb-2 px-2 py-1 border rounded text-xs"
                                            />
                                        </>
                                    )}

                                    <button
                                        onClick={handleSubmitRequest}
                                        className={`w-full ${isFromExistingBox ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white text-xs py-1 rounded`}>
                                        {isFromExistingBox ? "제거 요청 등록" : "설치 요청 등록"}
                                    </button>
                                </div>
                            </MapMarker>
                        )}
                    </Map>
                )}
            </div>

            <div className="mt-6 w-3/4 text-left">
                <label className="mr-2 font-semibold">현황:</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border p-1 rounded"
                >
                    <option value="설치">설치</option>
                    <option value="제거">제거</option>
                </select>
            </div>

            {/* ✅ 모든 수거함 리스트 UI */}
            {!loading && !error && (
                <div className="mt-6 w-3/4 bg-white shadow-md p-4 rounded max-h-[300px] overflow-y-auto">
                    <h2 className="text-lg font-bold mb-2">📦 수거함 리스트</h2>
                    <ul className="text-sm space-y-1">
                        {filteredBoxes.map((box) => (
                            <li
                                key={box.id}
                                className="hover:text-blue-600 cursor-pointer flex justify-between items-center"
                                onClick={() => {
                                    setUserAddedMarker({lat: box.lat, lng: box.lng});
                                    setBoxName(box.name);
                                    setBoxIp("");
                                    setIsFromExistingBox(true);
                                    setSelectedBoxId(box.id);
                                }}
                            >
                                <span>
                                    • {box.name} — 위도: {box.lat}, 경도: {box.lng} — 상태: {
                                    box.installStatus === 'INSTALL_REQUEST' ? '설치 요청 중' :
                                        box.installStatus === 'INSTALL_IN_PROGRESS' ? '설치 진행 중' :
                                            box.installStatus === 'INSTALL_CONFIRMED' ? '설치 확정' :
                                                box.installStatus === 'INSTALL_COMPLETED' ? '설치 완료' :
                                                    box.installStatus === 'REMOVE_REQUEST' ? '제거 요청 중' :
                                                        box.installStatus === 'REMOVE_IN_PROGRESS' ? '제거 진행 중' :
                                                            box.installStatus === 'REMOVE_COMPLETED' ? '제거 완료' :
                                                                box.installStatus === 'REMOVE_CONFIRMED' ? '제거 확정' : '알 수 없음'
                                }
                                </span>
                                {/* 수락/거절 버튼 추가 */}
                                {(box.installStatus === 'INSTALL_COMPLETED' || box.installStatus === 'REMOVE_COMPLETED') && (
                                    <div className="mt-2 flex space-x-2">
                                        <button
                                            onClick={() => handleAccept(box.id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                        >
                                            수락
                                        </button>
                                        <button
                                            onClick={() => handleReject(box.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                        >
                                            거절
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default BoxAddRemovePage;
