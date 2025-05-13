import axios from "axios";
import axiosInstance from "./axiosInstance"; // ✅ axiosInstance import 추가

/*const FLASK_BASE_URL = "http://localhost:5000";*/

// ✅ 전화번호로 인증번호 전송 API
export const sendSmsAuth = async (to) => {
    try {
        const response = await axiosInstance.post(`/send-one/${to}`);
        return response.data; // 서버 응답: 인증번호 발송 결과
    } catch (error) {
        console.error("❌ 인증번호 전송 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 전화번호 인증번호 검증 API
export const verifySmsCode = async (phone, code) => {
    try {
        const response = await axiosInstance.post("/verify-code", null, {
            params: {
                phone,
                code,
            },
        });
        return response.data; // 서버 응답: 인증 결과
    } catch (error) {
        console.error("❌ 인증번호 검증 실패:", error.response?.data || error.message);
        throw error;
    }
};

// 회원가입 API
export const postCreateNewUser = (id, pw, name, phoneNumber, verificationCode) => {
    return axiosInstance.post(`/join`, {
        id,
        pw,
        name,
        phoneNumber,
        verificationCode,
    });
};

// 로그인 API (FormData 방식)
export const loginUser = async (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
        const response = await axiosInstance.post("/login", formData, {
            headers: { "Content-Type": "multipart/form-data" }, // ✅ FormData 전송을 위한 헤더
        });
        return response.data; // 서버 응답 (Success 또는 Fail)
    } catch (error) {
        console.error("로그인 실패:", error);
        throw error;
    }
};

// 아이디 찾기 API
export const findUserId = async (name, phoneNumber) => {
    try {
        const response = await axiosInstance.post("/findId", {
            name,
            phoneNumber,
        });

        return response.data; // 서버 응답 (아이디 또는 "존재하지 않는 사용자입니다.")
    } catch (error) {
        console.error("아이디 찾기 실패:", error);
        throw error;
    }
};

// 비밀번호 변경 API - 비밀번호 변경 페이지
export const resetPassword = async (id, name, phoneNumber, newPassword) => {
    try {
        const response = await axiosInstance.post("/findPw", {
            id,
            name,
            phoneNumber,
            pw: newPassword, // 서버에서 pw 필드로 받음
        });

        return response.data; // 서버 응답 ("Success" 또는 "Fail")
    } catch (error) {
        console.error("비밀번호 변경 실패:", error);
        throw error;
    }
};

// 수거 및 분리량 조회 API
export const getBoxLog = async () => {
    try {
        const response = await axiosInstance.get("/admin/getBoxLog", {
            withCredentials: true, // 인증 정보 포함 (쿠키, 세션)
        });

        console.log("응답 데이터:", response.data);
        return response.data;
    } catch (error) {
        console.error("수거 및 분리량 조회 실패:", error.response?.data || error.message);
        return null;
    }
};

// ✅ 수거자 및 분리자 전체 조회 API
export const findUserAll = async () => {
    try {
        const response = await axiosInstance.get("/admin/findUserAll");
        console.log("📌 API 요청 성공:", response); // ✅ 전체 응답 확인
        console.log("📌 API 데이터:", response.data); // ✅ 데이터 확인
        return response.data || []; // ✅ undefined 방지
    } catch (error) {
        console.error("🚨 사용자 조회 실패:", error);
        return []; // 오류 발생 시 빈 배열 반환
    }
};

// ✅ 모든 박스 정보 조회 API
export const findAllBox = async () => { // ✅ Named export 유지
    try {
        const response = await axiosInstance.get("/admin/findAllBox"); // ✅ 올바른 API 경로 확인
        return response.data;
    } catch (error) {
        console.error("🚨 박스 데이터 조회 실패:", error);
        throw error;
    }
};

// 로그아웃 API 요청
export const logout = async () => {
    try {
        const response = await axiosInstance.post("/logout");
        console.log("✅ 로그아웃 성공:", response.data);

        return response.data;
    } catch (error) {
        console.error("❌ 로그아웃 실패:", error);
        throw error;
    }
};

// ✅ 내 정보 조회 API
export const getMyInfo = async () => {
    const response = await axiosInstance.get("/admin/MyInfo");
    return response.data;
};

// 비밀번호 확인 API
export const checkPassword = async (currentPassword) => {
    try {
        const response = await axiosInstance.post("/admin/checkPw", { pw: currentPassword });
        return response.data; // "Success" 또는 "Fail"
    } catch (error) {
        console.error("❌ 비밀번호 확인 실패:", error);
        throw error;
    }
};

// 비밀번호 변경 API
export const updatePassword = async (newPassword) => {
    try {
        const response = await axiosInstance.patch("/admin/updatePw", { pw: newPassword });
        return response.data; // "Success" 또는 "Fail"
    } catch (error) {
        console.error("❌ 비밀번호 변경 실패:", error);
        throw error;
    }
};

// ✅ 수거자 가입 요청 목록 조회 API
export const fetchEmployeeRequests = async () => {
    try {
        const response = await axiosInstance.get("/admin/showEmployeeRequest", {
            withCredentials: true, // 인증 포함
        });
        return response.data; // API 응답 데이터 반환
    } catch (error) {
        console.error("🚨 직원 가입 요청 조회 실패:", error);
        throw error;
    }
};

// ✅ 가입 신청 수락 API
export const approveUserRequest = async (userId) => {
    try {
        const response = await axiosInstance.patch(`/admin/permitJoin/${userId}`);
        console.log("✅ 가입 신청 수락 성공:", response.data);
        return response.data; // "Success" 반환 예상
    } catch (error) {
        console.error("❌ 가입 신청 수락 실패:", error.response?.data || error.message);
        throw error;
    }
};

// 가입 신청 반려 API
export const rejectUserJoin = async (userId: string) => {
    try {
        const response = await axiosInstance.patch(`/admin/noJoin/${userId}`, null, {
            withCredentials: true, // 인증 정보 포함
        });

        console.log("✅ 가입 신청 반려 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("🚨 가입 신청 반려 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 모든 사용자 주문 내역 조회 API
export const fetchOrderList = async () => {
    try {
        const response = await axiosInstance.get("/admin/findOrderList"); // GET 요청
        return response.data; // 주문 리스트 반환
    } catch (error) {
        console.error("🚨 주문 내역 조회 실패:", error);
        throw error;
    }
};

// ✅ 주문번호로 주문 아이템 검색 API
export const fetchOrderItemsByOrderId = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/admin/findByOrderId/${orderId}`); // GET 요청
        return response.data; // 주문 아이템 리스트 반환
    } catch (error) {
        console.error("🚨 주문 아이템 조회 실패:", error);
        throw error;
    }
};

// ✅ 사용자 ID로 주문 내역 조회 API
export const fetchOrdersByUserId = async (userId) => {
    try {
        const response = await axiosInstance.get(`/admin/findOrderListByUserId/${userId}`); // GET 요청
        return response.data; // 주문 리스트 반환
    } catch (error) {
        console.error("🚨 사용자 주문 내역 조회 실패:", error);
        throw error;
    }
};

// ✅ Flask 추천 알고리즘 실행 API
export const runRecommendationAlgorithm = async () => {
    try {
        const response = await axiosInstance.post("/admin/recommendation/run");
        console.log("✅ 추천 알고리즘 실행 완료:", response.data);
        return response.data; // Flask에서 온 메시지
    } catch (error) {
        console.error("❌ 추천 알고리즘 실행 실패:", error.response?.data || error.message);
        throw error;
    }
};

// 📌 Flask로부터 필터링된 추천 수거함 위치 받아오기
export const fetchFilteredRecommendedBoxes = async () => {
    try {
        const response = await axiosInstance.post("/admin/getFilteredRecommendedBoxes", {
            withCredentials: true
        });
        console.log("✅ 필터링된 추천 위치:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 추천 위치 조회 실패:", error);
        throw error;
    }
};


// 파일 업로드 함수
export const uploadFileToFlask = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/admin/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

// ✅ 수거함 설치 요청 API (longitude / latitude 별도 전송)
export const requestInstallBox = async ({ name, ipAddress, longitude, latitude }) => {
    try {
        const response = await axiosInstance.post("/admin/installRequest", {
            name,
            ipAddress,
            longitude,
            latitude,
        });
        console.log("✅ 수거함 설치 요청 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 수거함 설치 요청 실패:", error.response?.data || error.message);
        throw error;
    }
};

// 수거함 제거 요청 API
export const requestRemoveBox = async (boxId) => {
    try {
        const response = await axiosInstance.patch(`/admin/removeRequest/${boxId}`);
        return response.data;
    } catch (error) {
        console.error("❌ 수거함 제거 요청 실패:", error);
        throw error;
    }
};

// 수거함 설치 확정 API
export const requestInstallConfirmed = async (boxId) => {
    try {
        const response = await axiosInstance.patch(`/admin/installConFiremed/${boxId}`);
        return response.data;  // 요청 성공 시 서버에서 반환된 데이터
    } catch (error) {
        console.error("❌ 수거함 설치 확정 실패:", error);
        throw error;  // 에러 발생 시 다시 던져서 처리할 수 있도록
    }
};

// 수거함 제거 확정 API
export const requestRemoveConfirmed = async (boxId) => {
    try {
        const response = await axiosInstance.patch(`/admin/removeConFiremed/${boxId}`);
        return response.data;  // 요청 성공 시 서버에서 반환된 데이터
    } catch (error) {
        console.error("❌ 수거함 제거 확정 실패:", error);
        throw error;  // 에러 발생 시 다시 던져서 처리할 수 있도록
    }
};

// ✅ 관리자용 미해결 알람 조회 API
export const fetchUnresolvedAlarms = async () => {
    try {
        const response = await axiosInstance.get("/admin/alarm/unResolved", {
            withCredentials: true, // 인증이 필요한 경우
        });
        console.log("✅ 미해결 알람 조회 성공:", response.data);
        return response.data; // Alarm[] 형태의 응답
    } catch (error) {
        console.error("❌ 미해결 알람 조회 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 소방서 및 어린이보호구역 좌표 데이터 가져오기
export const fetchCoordinates = async () => {
    try {
        const response = await axiosInstance.get("/admin/getCoordinates");
        console.log("✅ 좌표 데이터 로드 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 좌표 데이터 로드 실패:", error.response?.data || error.message);
        throw error;
    }
};