import { useEffect, useState } from "react";
import { findCode } from "../api/apiServices"; // ✅ API 호출 함수 가져오기

const useMembershipCode = () => {
    const [code, setCode] = useState(""); // 가입코드 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMembershipCode = async () => {
            try {
                const data = await findCode();
                setCode(data);
            } catch (err) {
                setError("가입코드를 가져오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        loadMembershipCode();
    }, []);

    return { code, loading, error };
};

export default useMembershipCode;
