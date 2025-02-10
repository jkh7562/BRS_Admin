import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import NavigationBar from "../component/NavigationBar";

const UserPage = () => {
    const { id } = useParams(); // ✅ URL에서 id 값 가져오기
    const users = useSelector(state => state.users.users); // ✅ Redux에서 사용자 리스트 가져오기

    // ✅ 현재 페이지에서 보여줄 사용자 찾기
    const userData = users.find(user => user.id === id);

    useEffect(() => {
        console.log("📌 Redux 상태 - users:", users);
    }, [users]);

    if (!userData) return <div className="h-screen w-screen flex justify-center items-center">⏳ 로딩 중...</div>;

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
                        <p>{userData.name}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">가입일자</p>
                        <p>{userData.date ? userData.date.split("T")[0] : "정보 없음"}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">총 배출량</p>
                        <p>{userData.totalDisposal || 0}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">누적 마일리지</p>
                        <p>{userData.point || 0}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">현재 마일리지</p>
                        <p>{userData.currentMileage || 0}</p>
                    </div>
                    <div className="bg-white shadow-md p-4 text-center">
                        <p className="font-bold">사용한 마일리지</p>
                        <p>{userData.usedMileage || 0}</p>
                    </div>
                </div>

                {/* 일/월/년 버튼 */}
                <div className="flex justify-start space-x-2 mb-4">
                    <button className="px-4 py-2 border rounded">일</button>
                    <button className="px-4 py-2 border rounded">월</button>
                    <button className="px-4 py-2 border rounded">년</button>
                </div>

                {/* 그래프와 배출 정보 */}
                <div className="grid grid-cols-2 gap-4">
                    {/* 그래프 영역 */}
                    <div className="bg-white shadow-md p-4" style={{ height: "500px" }}>
                        <div className="flex justify-between items-center mb-4">
                            <p className="font-bold">배출 그래프</p>
                        </div>
                        <div className="h-full bg-gray-200 flex items-center justify-center" style={{ height: "calc(100% - 50px)", marginBottom: "20px" }}>
                            <p>[배출정보 그래프 자리]</p>
                        </div>
                    </div>

                    {/* 배출 정보 테이블 */}
                    <div className="bg-white shadow-md p-4" style={{ height: "500px", overflow: "hidden" }}>
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
                                {userData.disposalLogs && userData.disposalLogs.length > 0 ? (
                                    userData.disposalLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="border border-gray-300 px-4 py-2">{log.location}</td>
                                            <td className="border border-gray-300 px-4 py-2">{log.amount}</td>
                                            <td className="border border-gray-300 px-4 py-2">{log.date}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 text-center" colSpan="3">기록 없음</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserPage;
