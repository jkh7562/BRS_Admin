import React from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";

// 더미 데이터 정의
const dummyBoxes = [
    { id: 1, name: "선문대학교 공학관 1층 수거함", lat: 36.8082, lng: 127.0090 },
    { id: 2, name: "선문대학교 CU 수거함", lat: 36.8084, lng: 127.0093 },
    { id: 3, name: "선문대 인문관 1층 수거함", lat: 36.8086, lng: 127.0095 },
];

const dummyUsers = [
    { id: 1, name: "정윤식", amount: 3200, date: "2025-02-03" },
    { id: 2, name: "김민수", amount: 1500, date: "2025-01-15" },
    { id: 3, name: "이영희", amount: 2300, date: "2025-03-10" },
];

const N_mainPage = () => {
    return (
        <div className="flex bg-gray-50 min-h-screen overflow-y-auto">
            {/* 사이드바 */}
            <aside className="w-60 min-h-screen bg-black text-white p-5">
                <h1 className="text-2xl font-bold mb-6 text-green-400">batter</h1>
                <ul className="space-y-4 text-sm">
                    <li className="font-semibold">🏠 메인 대시보드</li>
                    <li>📦 수거함 설치/제거</li>
                    <li>📶 수거함 제어/로그</li>
                    <li>🚛 수거자 배치</li>
                    <li>📊 모니터링</li>
                    <li>👥 가입관리</li>
                    <li>🧾 주문내역</li>
                </ul>
                <div className="mt-8 border-t border-gray-600 pt-4 text-xs space-y-2">
                    <p className="text-gray-400">서버 관리</p>
                    <p className="text-green-400">🟢 Spring Boot</p>
                    <p>⚪ App</p>
                    <p>⚪ Web</p>
                    <p className="text-blue-400">🟢 MySQL</p>
                    <p className="text-blue-400">🟢 React</p>
                </div>
            </aside>

            {/* 메인 콘텐츠 */}
            <main className="flex-1 p-6 space-y-6">
                {/* 상단 카드 */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h2 className="text-sm font-semibold mb-2">👤 신규 수거자 가입신청</h2>
                        <p className="text-xs text-gray-500">가입신청이 들어왔어요! 여기를 눌러 확인해주세요!</p>
                        <p className="text-2xl font-bold mt-3">16건</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h2 className="text-sm font-semibold mb-2">📅 일간 이용 현황</h2>
                        <p className="text-xs text-gray-500">마지막 업데이트 2025.03.31</p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                            <div>
                                <p className="text-gray-500">일간 배출량</p>
                                <p className="font-bold">1,197g</p>
                            </div>
                            <div>
                                <p className="text-gray-500">일간 수거량</p>
                                <p className="font-bold">1,062g</p>
                            </div>
                            <div>
                                <p className="text-gray-500">일간 이용자수</p>
                                <p className="font-bold">31명</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h2 className="text-sm font-semibold mb-2">📞 고객 관리</h2>
                        <p className="text-xs text-gray-500">마지막 업데이트 2025.03.31</p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                            <div>
                                <p className="text-gray-500">사용자 문의</p>
                                <p className="font-bold">13건</p>
                            </div>
                            <div>
                                <p className="text-gray-500">수거자 문의</p>
                                <p className="font-bold">5건</p>
                            </div>
                            <div>
                                <p className="text-gray-500">일반 민원</p>
                                <p className="font-bold">0건</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 수거함 현황 */}
                <div className="bg-white rounded-lg p-4 shadow">
                    <h3 className="text-lg font-semibold mb-2">수거함 현황</h3>
                    <div className="flex items-center gap-4 mb-3 text-sm">
                        <button className="font-semibold border-b-2 border-black">전체 수거함</button>
                        <button className="text-gray-500">수거 필요</button>
                        <button className="text-red-600 flex items-center gap-1">
                            화재감지 <span className="text-red-500 text-xl">●</span>
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1/3 max-h-[420px] overflow-y-auto border rounded p-2">
                            <input
                                type="text"
                                placeholder="장소, 주소, 수거함 코드 검색"
                                className="w-full border rounded px-2 py-1 mb-2 text-sm"
                            />
                            <ul className="space-y-2 text-sm">
                                {dummyBoxes.map((box) => (
                                    <li
                                        key={box.id}
                                        className="border p-2 rounded hover:bg-gray-100 cursor-pointer"
                                    >
                                        <p className="font-semibold">{box.name}</p>
                                        <p className="text-gray-500 text-xs">충남 아산시 탕정면 선문로 221번길 70</p>
                                        <p className="text-gray-500 text-xs">
                                            {box.lat} / {box.lng}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-2/3 h-[420px]">
                            <Map
                                center={{ lat: 36.8082, lng: 127.0090 }}
                                style={{ width: "100%", height: "100%" }}
                                level={3}
                            >
                                {dummyBoxes.map((box) => (
                                    <MapMarker key={box.id} position={{ lat: box.lat, lng: box.lng }} />
                                ))}
                            </Map>
                        </div>
                    </div>
                </div>

                {/* 배출량 및 수거량 섹션 */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="text-lg font-semibold mb-2">배출량</h3>
                        <div className="flex gap-4 mb-2 text-sm">
                            <button className="font-semibold border-b-2 border-black">전체 수거함</button>
                            <button className="text-gray-500">건전지</button>
                            <button className="text-gray-500">방전 배터리</button>
                            <button className="text-gray-500">잔여 용량 배터리</button>
                        </div>
                        <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                            배출량 차트 영역
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="text-lg font-semibold mb-2">수거량</h3>
                        <div className="flex gap-4 mb-2 text-sm">
                            <button className="font-semibold border-b-2 border-black">전체 수거함</button>
                            <button className="text-gray-500">건전지</button>
                            <button className="text-gray-500">방전 배터리</button>
                            <button className="text-gray-500">잔여 용량 배터리</button>
                        </div>
                        <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                            수거량 차트 영역
                        </div>
                    </div>
                </div>

                {/* 회원 정보 섹션 */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="text-lg font-semibold mb-3">사용자 (총 17,302명)</h3>
                        <input
                            type="text"
                            placeholder="사용자 이름 검색"
                            className="w-full border rounded px-2 py-1 mb-3 text-sm"
                        />
                        <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
                            {dummyUsers.map((user) => (
                                <li
                                    key={user.id}
                                    className="p-2 border rounded hover:bg-gray-100 cursor-pointer"
                                >
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-xs text-gray-500">총 배출량 {user.amount}g</p>
                                    <p className="text-xs text-gray-500">{user.date}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src="https://via.placeholder.com/64"
                                alt="profile"
                                className="rounded-full w-16 h-16"
                            />
                            <div>
                                <p className="text-lg font-bold">정윤식</p>
                                <p className="text-sm text-gray-500">가입일자: 2025-02-03</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 text-sm text-center mb-4">
                            <div>
                                <p className="font-semibold">3,200g</p>
                                <p className="text-gray-500">총 배출량</p>
                            </div>
                            <div>
                                <p className="font-semibold">300p</p>
                                <p className="text-gray-500">누적 마일리지</p>
                            </div>
                            <div>
                                <p className="font-semibold">60p</p>
                                <p className="text-gray-500">잔여 마일리지</p>
                            </div>
                        </div>
                        <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-400">
                            배출로그 차트 영역
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="text-lg font-semibold mb-2">주문 내역</h3>
                        <div className="text-sm space-y-2 max-h-[320px] overflow-y-auto">
                            <div className="border rounded p-2">
                                <p className="text-green-600 font-bold text-xs mb-1">배송준비중</p>
                                <p>주문일자: 2025.03.01</p>
                                <p>상품코드: 101 (수량 1200ml일지)</p>
                            </div>
                            <div className="border rounded p-2">
                                <p className="text-blue-600 font-bold text-xs mb-1">배송완료</p>
                                <p>주문일자: 2025.02.19</p>
                                <p>상품코드: 101 (수량 600ml일지)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default N_mainPage;