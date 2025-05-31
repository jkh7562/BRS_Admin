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

// ✅ 사용자 담당구역 변경 API
export const changeUserLocation = async (userId, location1, location2) => {
    try {
        const response = await axiosInstance.patch(
            `/admin/changeLocation/${userId}/${location1}/${location2}`
        ); // PATCH 요청
        return response.data; // 변경된 결과 반환
    } catch (error) {
        console.error("🚨 사용자 위치 변경 실패:", error);
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

export const uploadFile = async (formData) => {
    try {
        const response = await axiosInstance.post('/admin/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Content-Type 설정 유지
            },
        });

        if (response.status === 200) {
            return response.data; // 성공 시 응답 데이터 반환 (필요에 따라)
        } else {
            return null; // 실패 시 null 또는 에러 코드 반환
        }
    } catch (error) {
        console.error('파일 업로드 실패:', error);
        throw error;
    }
};

// ✅ 박스 이미지(설치 / 제거) 조회 API
export const getBoxImage = async (boxId) => {
    try {
        const response = await axiosInstance.get(`/admin/boxImage/${boxId}`, {
            responseType: 'blob', // 이미지 데이터를 blob으로 받기
            headers: {
                Accept: "image/*"  // 여기서만 헤더 덮어씀
            },
        });

        // Blob을 URL로 변환하여 이미지 소스로 사용
        const imageUrl = URL.createObjectURL(response.data);
        return imageUrl;
    } catch (error) {
        console.error("❌ 박스 이미지 조회 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 수거 이미지 조회 API
export const getCollectionImage = async (boxLogId: number | string): Promise<string> => {
    try {
        const response = await axiosInstance.get(`/admin/collectionImage/${boxLogId}`, {
            responseType: 'blob', // 이미지 데이터를 blob으로 받기
            headers: {
                Accept: "image/*"  // 여기서만 헤더 덮어씀
            },
        });

        // Blob을 URL로 변환하여 이미지 소스로 사용
        const imageUrl = URL.createObjectURL(response.data);
        return imageUrl;
    } catch (error) {
        console.error("❌ 수거함 컬렉션 이미지 조회 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 배터리 이미지 조회 API
export const getBatteryImage = async (boxLogId: number | string): Promise<string> => {
    try {
        const response = await axiosInstance.get(`/admin/getBatteryImage/${boxLogId}`, {
            responseType: 'blob', // 이미지 데이터를 blob으로 받기
            headers: {
                Accept: "image/*"  // 여기서만 헤더 덮어씀
            },
        });

        // Blob을 URL로 변환하여 이미지 소스로 사용
        const imageUrl = URL.createObjectURL(response.data);
        return imageUrl;
    } catch (error) {
        console.error("❌ 배터리 이미지 조회 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 방전된 폐전지 이미지 조회 API
export const getDischargedImage = async (boxLogId: number | string): Promise<string> => {
    try {
        const response = await axiosInstance.get(`/admin/getDischargedImage/${boxLogId}`, {
            responseType: 'blob', // 이미지 데이터를 blob으로 받기
            headers: {
                Accept: "image/*"  // 여기서만 헤더 덮어씀
            },
        });

        // Blob을 URL로 변환하여 이미지 소스로 사용
        const imageUrl = URL.createObjectURL(response.data);
        return imageUrl;
    } catch (error) {
        console.error("❌ 방전된 폐전지 이미지 조회 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 방전되지 않은 폐전지 이미지 조회 API
export const getUndischargedImage = async (boxLogId: number | string): Promise<string> => {
    try {
        const response = await axiosInstance.get(`/admin/getUndischargedImage/${boxLogId}`, {
            responseType: 'blob', // 이미지 데이터를 blob으로 받기
            headers: {
                Accept: "image/*"  // 여기서만 헤더 덮어씀
            },
        });

        // Blob을 URL로 변환하여 이미지 소스로 사용
        const imageUrl = URL.createObjectURL(response.data);
        return imageUrl;
    } catch (error) {
        console.error("❌ 방전되지 않은 폐전지 이미지 조회 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 화재 이미지 조회 API
export const getFireImage = async (alarmId: number | string): Promise<string> => {
    try {
        const response = await axiosInstance.get(`/admin/fireImage/${alarmId}`, {
            responseType: 'blob', // 이미지 데이터를 blob으로 받기
            headers: {
                Accept: "image/*"  // 여기서만 헤더 덮어씀
            },
        });

        // Blob을 URL로 변환하여 이미지 소스로 사용
        const imageUrl = URL.createObjectURL(response.data);
        return imageUrl;
    } catch (error) {
        console.error("❌ 화재 이미지 조회 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 수거함 설치 요청 API (longitude / latitude 별도 전송)
export const requestInstallBox = async ({ name, ipaddress, longitude, latitude }) => {
    try {
        const response = await axiosInstance.post("/admin/installRequest", {
            name,
            ipaddress,
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

// 수거 확정 요청 API
export const requestCollectionConfirmed = async (alarmId) => {
    try {
        const response = await axiosInstance.patch(`/admin/collectionConFirmed/${alarmId}`)
        return response.data
    } catch (error) {
        console.error("수거 확정 요청 실패:", error)
        throw error
    }
}

// 화재 확정 요청 API
export const requestFireConfirmed = async (alarmId) => {
    try {
        const response = await axiosInstance.patch(`/admin/fireConFirmed/${alarmId}`)
        return response.data
    } catch (error) {
        console.error("화재처리 확정 요청 실패:", error)
        throw error
    }
}

// ✅ 관리자용 미해결 알람 조회 API(모든 관리자)
export const fetchUnresolvedAlarms = async () => {
    try {
        const response = await axiosInstance.get("/admin/alarm/unResolved");
        console.log("✅ 미해결 알람 조회 성공:", response.data);
        return response.data; // Alarm[] 형태의 응답
    } catch (error) {
        console.error("❌ 미해결 알람 조회 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 미해결된 알람 가져오기 API(모니터링)
export const getUserUnresolvedAlarms = async () => {
    try {
        const response = await axiosInstance.get("/alarm/unResolved");
        console.log("✅ 미해결 알람 조회 성공:", response.data);
        return response.data; // Alarm[] 형태의 응답
    } catch (error) {
        console.error("❌ 미해결 알람 조회 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 박스 구획 열기 API
export const openBoxCompartment = async (boxId, number) => {
    try {
        const response = await axiosInstance.get(`/admin/boxOpen/${boxId}/${number}`);
        console.log("✅ 박스 구획 열기 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 박스 구획 열기 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 박스 구획 닫기 API
export const closeBoxCompartment = async (boxId, number) => {
    try {
        const response = await axiosInstance.get(`/admin/boxClose/${boxId}/${number}`);
        console.log("✅ 박스 구획 닫기 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 박스 구획 닫기 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 박스 구획 제어 통합 함수
export const controlBoxCompartment = async (boxId, compartmentType, isOpen) => {
    // 구획 타입을 숫자로 매핑
    const compartmentNumberMap = {
        collectorEntrance: 3,        // 수거자 입구
        battery: 0,                  // 배터리 (store1)
        dischargedBattery: 1,        // 방전 배터리 (store2)
        remainingCapacityBattery: 2, // 잔여 용량 배터리 (store3)
    };

    const number = compartmentNumberMap[compartmentType];

    if (number === undefined) {
        throw new Error(`Invalid compartment type: ${compartmentType}`);
    }

    try {
        if (isOpen) {
            return await openBoxCompartment(boxId, number);
        } else {
            return await closeBoxCompartment(boxId, number);
        }
    } catch (error) {
        console.error(`❌ 박스 구획 제어 실패 (${compartmentType}):`, error);
        throw error;
    }
};

// ✅ 배터리 구획 제어 API
export const openBatteryCompartment = (boxId) => {
    return openBoxCompartment(boxId, 1);
};

export const closeBatteryCompartment = (boxId) => {
    return closeBoxCompartment(boxId, 1);
};

// ✅ 방전 배터리 구획 제어 API
export const openDischargedBatteryCompartment = (boxId) => {
    return openBoxCompartment(boxId, 2);
};

export const closeDischargedBatteryCompartment = (boxId) => {
    return closeBoxCompartment(boxId, 2);
};

// ✅ 잔여 용량 배터리 구획 제어 API
export const openRemainingCapacityBatteryCompartment = (boxId) => {
    return openBoxCompartment(boxId, 3);
};

export const closeRemainingCapacityBatteryCompartment = (boxId) => {
    return closeBoxCompartment(boxId, 3);
};

// ✅ 수거자 입구 제어 API
export const openCollectorEntrance = (boxId) => {
    return openBoxCompartment(boxId, 0);
};

export const closeCollectorEntrance = (boxId) => {
    return closeBoxCompartment(boxId, 0);
};

// ✅ 수거함 차단 API (토글 방식)
export const blockBox = async (boxId) => {
    try {
        const response = await axiosInstance.patch(`/admin/blockBox/${boxId}`);
        console.log("✅ 수거함 차단/해제 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 수거함 차단/해제 실패:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ 수거함 강제 차단 API (토글 방식)
export const superBlockBox = async (boxId) => {
    try {
        const response = await axiosInstance.patch(`/admin/superBlockBox/${boxId}`);
        console.log("✅ 수거함 강제 차단/해제 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 수거함 강제 차단/해제 실패:", error.response?.data || error.message);
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

// ✅ 서버 전체 상태 확인 API (Flask 포함)
export const fetchServerStatus = async () => {
    try {
        const response = await axiosInstance.get("/admin/serverStatus");
        console.log("✅ 서버 상태:", response.data);
        return response.data; // 예: { userApp: "UP", flaskServer: "UP", ... }
    } catch (error) {
        console.error("❌ 서버 상태 확인 실패:", error.response?.data || error.message);
        throw error;
    }
};