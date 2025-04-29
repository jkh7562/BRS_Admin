import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL, // API 기본 URL
    withCredentials: true,             // 쿠키 자동 포함
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

// 요청 인터셉터 (🚨 오류 수정)
axiosInstance.interceptors.request.use((config) => {
    const excludedPaths = ["/join", "/findId", "/findPw"];

    // 특정 경로에서만 쿠키 제외
    if (excludedPaths.includes(config.url)) {
        config.withCredentials = false;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
