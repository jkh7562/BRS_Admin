import { Link } from "react-router-dom"
import TextAnimation from "../../component/TextAnimation"
import useLogin from "../../hooks/useLogin"

const LoginPage = () => {
    const { formData, handleChange, handleLogin, errorMessage } = useLogin()

    return (
        <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
            {/* 전체 화면을 좌우로 나누는 컨테이너 */}
            <div className="grid grid-cols-2 w-full h-full bg-white shadow-md">
                {/* 왼쪽 영역 */}
                <TextAnimation />

                {/* 오른쪽 영역 */}
                <div className="flex flex-col justify-center items-center space-y-4 p-4">
                    {/* 이미지 */}
                    <div className="bg-gray-200 w-24 h-24 flex items-center justify-center">Image</div>

                    {/* 로그인 입력 폼 */}
                    <form onSubmit={handleLogin} className="w-3/4 space-y-4">
                        {/* 아이디 입력 */}
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="ID"
                            className="border rounded px-4 py-2 w-full"
                            required
                        />

                        {/* 비밀번호 입력 */}
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="border rounded px-4 py-2 w-full"
                            required
                        />

                        {/* 에러 메시지 */}
                        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

                        {/* 버튼들 */}
                        <div className="grid grid-cols-2 gap-2">
                            <Link to="/signup">
                                <button type="button" className="border rounded py-2 w-full">
                                    회원가입
                                </button>
                            </Link>
                            <button type="submit" className="border rounded py-2 bg-blue-500 text-white hover:bg-blue-600">
                                로그인
                            </button>
                        </div>
                    </form>

                    {/* 아이디 / 비밀번호 찾기 */}
                    <div className="grid grid-cols-2 gap-2 w-3/4">
                        <Link to="/findid">
                            <button type="button" className="border rounded py-2 w-full">
                                아이디 찾기
                            </button>
                        </Link>
                        <Link to="/findpassword">
                            <button type="button" className="border rounded py-2 w-full">
                                비밀번호 찾기
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage