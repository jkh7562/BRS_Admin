import { useEffect, useState } from "react";
import { fetchEmployeeRequests, approveUserRequest } from "../api/apiServices";

const useEmployeeRequests = () => {
    const [employeeRequests, setEmployeeRequests] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // ✅ 검색 상태 추가

    useEffect(() => {
        const loadEmployeeRequests = async () => {
            setLoading(true);
            try {
                const data = await fetchEmployeeRequests();
                setEmployeeRequests(data);
            } catch (err) {
                setError(err.message || "데이터를 불러오는 중 오류 발생");
            }
            setLoading(false);
        };

        loadEmployeeRequests();
    }, []);

    // ✅ 날짜 차이를 계산하는 함수
    const getTimeDifference = (dateString) => {
        const requestDate = new Date(dateString);
        const now = new Date();
        const diffInMs = now - requestDate;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) {
            return "방금 전";
        } else if (diffInHours < 24) {
            return `${diffInHours}시간 전`;
        } else {
            return `${Math.floor(diffInHours / 24)}일 전`;
        }
    };

    // ✅ 검색어에 따라 필터링된 직원 목록 반환
    const filteredRequests = employeeRequests.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.includes(searchTerm) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ 가입 신청 수락 함수
    const handleApprove = async (userId) => {
        try {
            const result = await approveUserRequest(userId);
            if (result === "Success") {
                alert("✅ 가입 신청이 승인되었습니다.");
                setEmployeeRequests(employeeRequests.filter((user) => user.id !== userId)); // 목록에서 제거
                setSelectedUser(null);
            }
        } catch (error) {
            alert("❌ 가입 신청 승인 실패: " + error.message);
        }
    };

    return {
        employeeRequests: filteredRequests,
        selectedUser,
        setSelectedUser,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        getTimeDifference,
        handleApprove,
    };
};

export default useEmployeeRequests;
