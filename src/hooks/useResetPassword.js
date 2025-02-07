import { useState } from "react";
import { resetPassword } from "../api/apiServices"; // ✅ 비밀번호 변경 API import

const useResetPassword = () => {
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        phoneNumber: "",
        newPassword: "",
    });

    const [message, setMessage] = useState("");

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 비밀번호 변경 요청 처리
    const handleResetPassword = async () => {
        try {
            const response = await resetPassword(
                formData.id,
                formData.name,
                formData.phoneNumber,
                formData.newPassword
            );

            if (response === "Success") {
                setMessage("비밀번호가 성공적으로 변경되었습니다.");
            } else {
                setMessage("입력한 정보와 일치하는 계정이 없습니다.");
            }
        } catch (error) {
            setMessage("서버 오류 발생. 다시 시도해주세요.");
        }
    };

    return { formData, handleChange, handleResetPassword, message };
};

export default useResetPassword;
