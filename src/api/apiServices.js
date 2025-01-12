import axios from "./axiosInstance";

//API 예시(회원가입)
const postCreateNewUser = (id, password, username, phoneNum) => { //서버로 보낼 데이터
    const formData = new FormData(); //폼데이터에 데이터들 넣어서 전송
    formData.append('id', id);
    formData.append('password', password);
    formData.append('username', username);
    formData.append('phoneNum', phoneNum);

    return axios.post(`/signup`, formData) //해당 API로 폼데이터 전송
}

// 로그인 API 요청(예시)
const login = async (email, password) => {
    try {
        const response = await axiosInstance.post("/login", { email, password });
        console.log("로그인 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("로그인 실패:", error);
        throw error;
    }
};

// 사용자 데이터를 가져오는 API 요청(예시)
const fetchUserData = async () => {
    try {
        const response = await axiosInstance.get("/user");
        return response.data;
    } catch (error) {
        console.error("사용자 데이터 가져오기 실패:", error);
        throw error;
    }
};