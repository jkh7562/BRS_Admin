import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8081/", // API 기본 URL
    withCredentials: true,             // 쿠키 자동 포함
    timeout: 5000,                     // 5초 후 타임아웃
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
