import { useState } from "react";
import { findUserId } from "../api/apiServices"; // ✅ 아이디 찾기 API import

const useFindId = () => {
    const [formData, setFormData] = useState({ name: "", phoneNumber: "" });
    const [userId, setUserId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 아이디 찾기 요청 처리
    const handleFindId = async () => {
        try {
            const response = await findUserId(formData.name, formData.phoneNumber);
            if (response.includes("존재하지 않는 사용자")) {
                setUserId("");
                setErrorMessage("존재하지 않는 사용자입니다.");
            } else {
                setUserId(response);
                setErrorMessage("");
            }
        } catch (error) {
            setErrorMessage("서버 오류 발생. 다시 시도해주세요.");
        }
    };

    return { formData, handleChange, handleFindId, userId, errorMessage };
};

export default useFindId;
