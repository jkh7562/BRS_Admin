import React from "react";
import NavigationBar from "../component/NavigationBar";
import useMembershipCode from "../hooks/useMembershipCode"; // ✅ 훅 임포트

const MembershipCodePage = () => {
    const { code, loading, error } = useMembershipCode(); // ✅ 훅 사용

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-100">
            {/* 네비게이션 바 */}
            <NavigationBar />

            {/* 페이지 내용 */}
            <div className="flex-1 flex justify-center items-center">
                <div className="bg-white shadow-lg p-8 rounded-lg w-2/5">
                    {/* 가입 코드 영역 */}
                    <div className="flex items-center mb-6">
                        <p className="font-bold mr-4 text-lg">가입코드 :</p>

                        {loading ? (
                            <p className="text-gray-500">⏳ 로딩 중...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            <input
                                type="text"
                                className="border px-3 py-2 rounded flex-1 text-lg"
                                value={code || "코드 없음"}
                                readOnly
                            />
                        )}

                        <button className="ml-4 px-6 py-2 bg-blue-500 text-white rounded text-lg">
                            수정
                        </button>
                    </div>

                    {/* 경고 메시지 */}
                    <p className="text-red-500 text-sm text-center mt-4">
                        이 코드는 개인 식별용으로만 사용됩니다. 다른 사람과 공유하지 않도록 주의하세요.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MembershipCodePage;
