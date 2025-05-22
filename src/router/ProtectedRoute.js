import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { findAllBox } from "../api/apiServices"; // ✅ 선언된 API 사용

const ProtectedRoute = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);

    useEffect(() => {
        findAllBox()
            .then(() => setIsLoggedIn(true)) // ✅ 인증 성공
            .catch(() => setIsLoggedIn(false)); // ❌ 인증 실패
    }, []);

    if (isLoggedIn === null) return <div>로딩 중...</div>;
    if (!isLoggedIn) return <Navigate to="/" replace />;

    return children;
};

export default ProtectedRoute;