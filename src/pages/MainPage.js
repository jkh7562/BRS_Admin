import React from "react";
import NavigationBar from "../component/NavigationBar";
import { Map, MapMarker } from "react-kakao-maps-sdk"; // 카카오 지도 추가

const MainPage = () => {
    return (
        <div className="min-h-screen w-screen flex flex-col bg-gray-100 pb-20"> {/* 💡 h-screen → min-h-screen, pb-20 추가 */}
            {/* 네비게이션 바 */}
            <NavigationBar />

            {/* 페이지 내용 */}
            <div className="mt-16">
                {/* 통계 정보 */}
                <div className="flex justify-center p-4">
                    <div className="flex space-x-8 w-2/5 justify-between">
                        <div className="bg-white shadow-md p-2 text-center w-1/6">
                            <p className="text-xs font-bold">하루 수거량</p>
                            <p className="text-base font-bold">0</p>
                        </div>
                        <div className="bg-white shadow-md p-2 text-center w-1/6">
                            <p className="text-xs font-bold">하루 배출량</p>
                            <p className="text-base font-bold">0</p>
                        </div>
                        <div className="bg-white shadow-md p-2 text-center w-1/6">
                            <p className="text-xs font-bold">앱 서비스 이용자 수</p>
                            <p className="text-base font-bold">0</p>
                        </div>
                    </div>
                </div>

                {/* 🗺️ 카카오 지도 */}
                <div className="px-0 mt-8 flex justify-center">
                    <div className="w-7/8 bg-white shadow-md p-4 mb-8"> {/* 💡 mb-8로 그래프와 간격 추가 */}
                        <p className="font-bold text-lg mb-4 text-left ml-4">지도</p>
                        <Map
                            center={{ lat: 36.800200, lng: 127.074958 }} // 💡 선문대학교 아산캠퍼스 좌표 적용
                            style={{ width: "80vw", height: "500px" }} // 💡 화면 전체 너비 적용
                            level={3} // 줌 레벨
                        >
                            {/* 마커 표시 */}
                            {/*<MapMarker
                                position={{ lat: 36.800200, lng: 127.074958 }}
                                title="선문대학교 아산캠퍼스"
                            />*/}
                        </Map>
                    </div>
                </div>

                {/* 그래프 영역 */}
                <div className="flex justify-center px-4 mt-8">
                    <div className="grid grid-cols-2 gap-4 w-3/4">
                        {/* 수거량 그래프 */}
                        <div className="bg-white shadow-md p-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold">수거량</p>
                                <div className="flex space-x-2">
                                    <button className="px-2 py-1 border rounded">일</button>
                                    <button className="px-2 py-1 border rounded">월</button>
                                    <button className="px-2 py-1 border rounded">년</button>
                                </div>
                            </div>
                            <div className="h-64 bg-gray-200">[수거량 그래프 자리]</div>
                        </div>

                        {/* 배출량 그래프 */}
                        <div className="bg-white shadow-md p-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold">배출량</p>
                                <div className="flex space-x-2">
                                    <button className="px-2 py-1 border rounded">일</button>
                                    <button className="px-2 py-1 border rounded">월</button>
                                    <button className="px-2 py-1 border rounded">년</button>
                                </div>
                            </div>
                            <div className="h-64 bg-gray-200">[배출량 그래프 자리]</div>
                        </div>
                    </div>
                </div>

                {/* 회원 정보 */}
                <div className="px-4 mt-8">
                    <p className="font-bold text-lg mb-4 text-left ml-4">회원정보</p>
                    <div className="grid grid-cols-2 gap-4">
                        {/* 수거자 정보 */}
                        <div className="bg-white shadow-md p-4">
                            <p className="font-bold mb-2 truncate">수거자</p>
                            <div className="flex space-x-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="수거자 검색"
                                    className="flex-1 px-4 py-2 border rounded"
                                />
                                <button className="px-4 py-2 bg-blue-500 text-white rounded">
                                    검색
                                </button>
                            </div>
                            <div className="h-80 overflow-y-auto border rounded p-2 bg-gray-50"></div>
                        </div>

                        {/* 사용자 정보 */}
                        <div className="bg-white shadow-md p-4">
                            <p className="font-bold mb-2 truncate">사용자</p>
                            <div className="flex space-x-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="사용자 검색"
                                    className="flex-1 px-4 py-2 border rounded"
                                />
                                <button className="px-4 py-2 bg-blue-500 text-white rounded">
                                    검색
                                </button>
                            </div>
                            <div className="h-80 overflow-y-auto border rounded p-2 bg-gray-50"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
