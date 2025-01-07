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