import React from "react";
import NavigationBar from "../component/NavigationBar";
import useEmployeeRequests from "../hooks/useEmployeeRequests";

const UserApprovalPage = () => {
    const {
        employeeRequests,
        selectedUser,
        setSelectedUser,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        getTimeDifference,
        handleApprove,
    } = useEmployeeRequests();

    return (
        <div className="min-h-screen w-screen flex flex-col bg-gray-100">
            {/* ✅ 네비게이션 바 */}
            <NavigationBar />

            <div className="mt-16 p-4 flex justify-center">
                <div className="w-4/5 flex space-x-4">
                    {/* ✅ 좌측 - 가입 요청 목록 */}
                    <div className="w-2/5 bg-white shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4">가입 신청 목록</h2>

                        {/* ✅ 검색 입력 필드 */}
                        <input
                            type="text"
                            placeholder="이름 검색"
                            className="w-full px-4 py-2 border rounded mb-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* ✅ 로딩 및 에러 처리 */}
                        {loading && <p>⏳ 데이터를 불러오는 중...</p>}
                        {error && <p className="text-red-500">🚨 오류 발생: {error}</p>}

                        {/* ✅ 직원 요청 목록 출력 */}
                        {!loading && !error && (
                            <div className="bg-gray-50 shadow-md rounded p-2">
                                {employeeRequests.length > 0 ? (
                                    employeeRequests.map((user) => (
                                        <div
                                            key={user.id}
                                            className={`flex justify-between items-center border-b p-2 cursor-pointer ${selectedUser?.id === user.id ? "bg-blue-100" : ""}`}
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <span>
                                                {user.name} - {getTimeDifference(user.date)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p>📋 일치하는 가입 요청이 없습니다.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ✅ 우측 - 가입 신청 상세 정보 */}
                    <div className="w-3/5 bg-white shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4">상세 정보</h2>

                        {selectedUser ? (
                            <div className="bg-gray-50 shadow-md rounded p-4">
                                <p className="mb-2"><strong>이름:</strong> {selectedUser.name}</p>
                                <p className="mb-2"><strong>가입 신청 일자:</strong> {selectedUser.date}</p>
                                <p className="mb-2"><strong>전화번호:</strong> {selectedUser.phoneNumber}</p>
                                <p className="mb-2"><strong>신청 ID:</strong> {selectedUser.id}</p>
                                <p className="mb-2"><strong>신청 PW:</strong> {selectedUser.pw}</p>

                                <div className="mt-4 flex space-x-2">
                                    <button
                                        className="bg-green-500 text-white px-4 py-2 rounded"
                                        onClick={() => handleApprove(selectedUser.id)}
                                    >
                                        승인
                                    </button>
                                    <button className="bg-red-500 text-white px-4 py-2 rounded">
                                        거절
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p>📌 가입 신청자를 선택하세요.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserApprovalPage;
