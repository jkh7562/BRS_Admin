import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/apiServices"; // ✅ 로그인 API import

const useLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [errorMessage, setErrorMessage] = useState("");

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 로그인 요청 처리
    const handleLogin = async (e) => {
        e.preventDefault(); // 기본 동작 방지
        try {
            const response = await loginUser(formData.username, formData.password);
            if (response === "Success") {
                alert("로그인 성공!");
                navigate("/main"); // ✅ 로그인 성공 후 메인 페이지로 이동
            } else {
                setErrorMessage("로그인 실패. 아이디 또는 비밀번호를 확인하세요.");
            }
        } catch (error) {
            setErrorMessage("서버 오류 발생. 다시 시도해주세요.");
        }
    };

    return { formData, handleChange, handleLogin, errorMessage };
};

export default useLogin;
