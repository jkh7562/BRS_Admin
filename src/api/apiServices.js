import axiosInstance from "./axiosInstance"; // ✅ axiosInstance import 추가

// 회원가입 API
export const postCreateNewUser = (id, pw, name, phoneNumber) => {
    return axiosInstance.post(`/join`, {
        id,
        pw,
        name,
        phoneNumber,
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

// 비밀번호 변경 API
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

// 특정 코드 조회 API
export const findCode = async () => {
    try {
        const response = await axiosInstance.get("/admin/findCode");

        // 응답에서 value 값만 추출
        const value = response.data.value;

        if (value) {
            console.log("받은 value 값:", value); // value 값 출력
            return value;
        } else {
            console.log("value 값이 없습니다.");
            return null; // value 값이 없는 경우
        }
    } catch (error) {
        console.error("코드 조회 실패:", error);
        throw error; // 에러 처리
    }
};