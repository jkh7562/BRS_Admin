import React from "react";
import NavigationBar from "../component/NavigationBar"; // NavigationBar 컴포넌트 임포트

const CollectorPage = () => {
    return (
        <div className="h-screen w-screen flex flex-col bg-gray-100">
            {/* 네비게이션 바 */}
            <NavigationBar />

            {/* 페이지 내용 */}
            <div className="mt-16 p-4">
                {/* 수정 및 삭제 버튼 */}
                <div className="flex justify-end space-x-4 mb-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded">수정</button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded">삭제</button>
                </div>

                {/* 회원 정보 */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">이름</p>
                        <p>홍길동</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">가입일자</p>
                        <p>2024/12/30</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">총 배출량</p>
                        <p>202</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">누적 마일리지</p>
                        <p>1400</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">현재 마일리지</p>
                        <p>430</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">사용한 마일리지</p>
                        <p>970</p>
                    </div>
                </div>

                {/* 일/월/년 버튼 */}
                <div className="flex justify-start space-x-2 mb-4">
                    <button className="px-4 py-2 border rounded">일</button>
                    <button className="px-4 py-2 border rounded">월</button>
                    <button className="px-4 py-2 border rounded">년</button>
                </div>

                {/* 그래프와 수거 정보 */}
                <div className="grid grid-cols-2 gap-4">
                    {/* 그래프 영역 */}
                    <div
                        className="bg-white shadow-md p-4"
                        style={{
                            height: "500px", // 배출정보란 고정 높이
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <p className="font-bold">배출 그래프</p>
                        </div>
                        <div
                            className="h-full bg-gray-200 flex items-center justify-center"
                            style={{
                                height: "calc(100% - 50px)", // 상하 padding으로 여백 추가
                                marginBottom: "20px", // 하단 여백
                            }}
                        >
                            <p>[배출정보 그래프 자리]</p>
                        </div>
                    </div>

                    {/* 수거 정보 테이블 */}
                    <div
                        className="bg-white shadow-md p-4"
                        style={{
                            height: "500px",
                            overflow: "hidden",
                        }}
                    >
                        <p className="font-bold mb-4">배출 로그</p>
                        <div className="overflow-y-auto h-full">
                            <table className="w-full table-auto border-collapse border border-gray-200">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2">수거함 이름</th>
                                    <th className="border border-gray-300 px-4 py-2">배출량</th>
                                    <th className="border border-gray-300 px-4 py-2">배출 일자</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">선문대 동문 앞 수거함</td>
                                    <td className="border border-gray-300 px-4 py-2">6</td>
                                    <td className="border border-gray-300 px-4 py-2">2024/12/30</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">선문대 서문 앞 수거함</td>
                                    <td className="border border-gray-300 px-4 py-2">4</td>
                                    <td className="border border-gray-300 px-4 py-2">2024/12/29</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">선문대 상봉마을 앞 수거함</td>
                                    <td className="border border-gray-300 px-4 py-2">9</td>
                                    <td className="border border-gray-300 px-4 py-2">2024/12/28</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CollectorPage;
