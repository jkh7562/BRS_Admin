import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import bgImage from "../../assets/Login_Background.jpg"
import { loginUser } from "../../api/apiServices" // ✅ 로그인 API import 추가

const N_LoginPage = () => {
    const navigate = useNavigate()

    const [userId, setUserId] = useState("")
    const [userPw, setUserPw] = useState("")
    const [loginMessage, setLoginMessage] = useState({ text: "", isSuccess: null })
    const [saveId, setSaveId] = useState(false) // 아이디 저장 상태

    // 컴포넌트 마운트 시 localStorage에서 저장된 아이디 불러오기
    useEffect(() => {
        const savedId = localStorage.getItem("savedUserId")
        if (savedId) {
            setUserId(savedId)
            setSaveId(true)
        }
    }, [])

    const handleSignupClick = () => {
        navigate("/n_SignupPage")
    }

    const handleFindidClick = () => {
        navigate("/n_FindIdPage")
    }

    const handleFindapasswordClick = () => {
        navigate("/n_FindPasswordPage")
    }

    const handleLogin = async () => {
        if (!userId || !userPw) {
            setLoginMessage({ text: "아이디와 비밀번호를 입력해 주세요.", isSuccess: false })
            return
        }

        // 아이디 저장 처리
        if (saveId) {
            localStorage.setItem("savedUserId", userId)
        } else {
            localStorage.removeItem("savedUserId")
        }

        try {
            const result = await loginUser(userId, userPw)
            console.log("✅ 로그인 결과:", result)

            if (result === "Success") {
                navigate("/n_MainPage")
            } else {
                setLoginMessage({ text: "로그인 실패: 아이디 또는 비밀번호를 확인하세요.", isSuccess: false })
            }
        } catch (error) {
            setLoginMessage({ text: "서버 오류로 로그인에 실패했습니다.", isSuccess: false })
        }
    }

    // 아이디 저장 체크박스 상태 변경 핸들러
    const handleSaveIdChange = (e) => {
        setSaveId(e.target.checked)
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="bg-white rounded-xl shadow-2xl p-12 w-[500px]">
                <h2 className="text-[48px] font-bold text-center font-nexon">Let's batter.</h2>

                <p className="text-center text-[18px] text-gray-600 mb-12 leading-relaxed font-[Pretendard]">
                    화재걱정 없는 배터리배출의 시작
                    <br />
                    배터가 함께하겠습니다
                </p>

                <input
                    type="text"
                    placeholder="아이디"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={userPw}
                    onChange={(e) => setUserPw(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full mb-5 px-5 py-2.5 border-none border-gray-300 rounded text-[16px] font-[Pretendard] bg-[#F3F4F8]"
                />

                <div className="flex items-center justify-between mb-6 text-[14px]">
                    <label className="flex items-center font-[Pretendard]">
                        <input type="checkbox" className="mr-2 accent-green-600" checked={saveId} onChange={handleSaveIdChange} />
                        아이디 저장
                    </label>
                    <div className="space-x-2 text-gray-500">
                        <button onClick={handleFindidClick} className="hover:underline font-[Pretendard]">
                            아이디 찾기
                        </button>
                        <span>•</span>
                        <button onClick={handleFindapasswordClick} className="hover:underline font-[Pretendard]">
                            비밀번호 찾기
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleLogin}
                    className="w-full bg-[#00C17B] text-white mb-14 py-2.5 rounded hover:bg-green-600 mb-6 text-[18px] font-[Pretendard]"
                >
                    로그인
                </button>

                {/* ✅ 로그인 메시지 표시 */}
                {loginMessage.text && (
                    <p className={`text-sm font-[Pretendard] ${loginMessage.isSuccess ? "text-green-500" : "text-red-500"}`}>
                        {loginMessage.text}
                    </p>
                )}

                <div className="mt-8 text-center text-[16px] text-[#1A0A0B] font-[Pretendard]">
                    지구를 위해 배터와 함께해요{" "}
                    <button
                        onClick={handleSignupClick}
                        className="ml-6 text-black text-[16px] font-semibold hover:underline font-[Pretendard]"
                    >
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    )
}

export default N_LoginPage