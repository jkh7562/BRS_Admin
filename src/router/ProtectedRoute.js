import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);

    useEffect(() => {
        axios.get("/admin/findAllBox", { withCredentials: true }) // 경로는 실제 보호된 API 경로 중 아무거나
            .then(() => setIsLoggedIn(true)) // 200 OK → 로그인 상태
            .catch(() => setIsLoggedIn(false)); // 401/403 → 로그인 안 됨
    }, []);

    if (isLoggedIn === null) return <div>로딩 중...</div>;
    if (!isLoggedIn) return <Navigate to="/" replace />; // 로그인 페이지로 리다이렉트

    return children;
};

export default ProtectedRoute;
