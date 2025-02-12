import React, { useState } from "react";
import NavigationBar from "../component/NavigationBar";
import useMembershipCode from "../hooks/useMembershipCode"; // ✅ 가입 코드 조회 훅
import { updateCode } from "../api/apiServices"; // ✅ 가입 코드 업데이트 API

const MembershipCodePage = () => {
    const { code, loading, error } = useMembershipCode(); // ✅ 훅 사용
    const [isEditing, setIsEditing] = useState(false); // ✅ 수정 상태 관리
    const [newCode, setNewCode] = useState(""); // ✅ 새로운 코드 입력 값

    // ✅ 수정 버튼 클릭 시 편집 모드로 변경
    const handleEditClick = () => {
        setIsEditing(true);
        setNewCode(code || ""); // 기존 코드 값 설정
    };

    // ✅ 저장 버튼 클릭 시 API 요청
    const handleSaveClick = async () => {
        if (!newCode.trim()) {
            alert("가입 코드를 입력하세요.");
            return;
        }

        try {
            await updateCode(newCode); // API 호출
            alert("가입 코드가 업데이트되었습니다.");
            setIsEditing(false); // 편집 모드 해제
            window.location.reload();
        } catch (error) {
            alert("가입 코드 업데이트 실패");
        }
    };

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
                        ) : isEditing ? (
                            <input
                                type="text"
                                className="border px-3 py-2 rounded flex-1 text-lg"
                                value={newCode}
                                onChange={(e) => setNewCode(e.target.value)}
                            />
                        ) : (
                            <input
                                type="text"
                                className="border px-3 py-2 rounded flex-1 text-lg"
                                value={code || "코드 없음"}
                                readOnly
                            />
                        )}

                        {/* 수정 or 저장 버튼 */}
                        {isEditing ? (
                            <button
                                className="ml-4 px-6 py-2 bg-green-500 text-white rounded text-lg"
                                onClick={handleSaveClick}
                            >
                                저장
                            </button>
                        ) : (
                            <button
                                className="ml-4 px-6 py-2 bg-blue-500 text-white rounded text-lg"
                                onClick={handleEditClick}
                            >
                                수정
                            </button>
                        )}
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
