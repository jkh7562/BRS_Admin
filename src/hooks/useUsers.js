import { useEffect, useState } from "react";
import { findUserAll } from "../api/apiServices"; // ✅ API 호출

const useUsers = () => {
    const [collectors, setCollectors] = useState([]); // ✅ 수거자 목록
    const [users, setUsers] = useState([]); // ✅ 일반 사용자 목록
    const [searchCollector, setSearchCollector] = useState(""); // ✅ 수거자 검색어
    const [searchUser, setSearchUser] = useState(""); // ✅ 사용자 검색어

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await findUserAll();
                console.log("📌 사용자 데이터:", data);

                // ✅ 수거자(ROLE_EMPLOYEE) & 사용자(ROLE_USER) 필터링
                setCollectors(data.filter(user => user.role === "ROLE_EMPLOYEE"));
                setUsers(data.filter(user => user.role === "ROLE_USER"));
            } catch (error) {
                console.error("🚨 사용자 조회 실패", error);
            }
        };

        fetchUsers();
    }, []);

    return {
        collectors, users, searchCollector, setSearchCollector, searchUser, setSearchUser
    };
};

export default useUsers;