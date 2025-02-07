import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postCreateNewUser } from "../api/apiServices"; // ✅ named import 사용

const useSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: "",
        pw: "",
        name: "",
        phoneNumber: "",
        confirmPassword: "",
    });

    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.pw !== formData.confirmPassword) {
            setErrorMessage("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            await postCreateNewUser(formData.id, formData.pw, formData.name, formData.phoneNumber);
            alert("회원가입이 완료되었습니다.");
            navigate("/");
        } catch (error) {
            setErrorMessage("회원가입 실패. 다시 시도해주세요.");
        }
    };

    return { formData, handleChange, handleSubmit, errorMessage };
};

export default useSignup;
