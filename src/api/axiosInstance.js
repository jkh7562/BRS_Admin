import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/", // API 기본 URL
    withCredentials: true,             // 쿠키를 자동으로 포함
    timeout: 5000,                     // 5초 후 타임아웃
    headers: {
        "Content-Type": "application/json", // 모든 요청에 Content-Type 설정
        "Accept": "application/json"
    }
});

// 요청 인터셉터
axiosInstance.interceptors.request.use((config) => {
    // 회원가입 경로에서는 쿠키를 제외
    if (config.url === "/signup") {
        config.withCredentials = false;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
