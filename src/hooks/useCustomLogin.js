import { Navigate, createSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../api/apiServices";
import { removeCookie, setCookie } from "../util/cookieUtil";
import { setLoginState, resetLoginState } from "../redux/slices/loginSlice";

const useCustomLogin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux에서 로그인 상태 가져오기
    const loginState = useSelector((state) => state.login);

    // 로그인 여부 확인
    const isLogin = loginState.email ? true : false;

    // 로그인 함수
    const doLogin = async (loginParam) => {
        try {
            const result = await login(loginParam);

            console.log(result);

            saveAsCookie(result);

            return result;
        } catch (error) {
            console.error("로그인 실패:", error);
            throw error;
        }
    };

    // 쿠키와 상태 저장
    const saveAsCookie = (data) => {
        setCookie("member", JSON.stringify(data), 1); // 1일 보관
        dispatch(setLoginState(data)); // Redux 상태 업데이트
    };

    // 로그아웃 함수
    const doLogout = () => {
        removeCookie("member");
        dispatch(resetLoginState()); // 로그인 상태 초기화
    };

    // 예외 처리 함수
    const exceptionHandle = (ex) => {
        console.log("Exception------------------------");
        console.log(ex);

        const errorMsg = ex.response.data.error;
        const errorStr = createSearchParams({ error: errorMsg }).toString();

        if (errorMsg === "REQUIRE_LOGIN") {
            alert("로그인 해야만 합니다.");
            navigate({ pathname: "/", search: errorStr });
            return;
        }

        if (errorMsg === "ERROR_ACCESSDENIED") {
            alert("해당 메뉴를 사용할 수 있는 권한이 없습니다.");
            navigate({ pathname: "/", search: errorStr });
            return;
        }
    };

    // 페이지 이동 함수
    const moveToPath = (path) => {
        navigate({ pathname: path }, { replace: true });
    };

    // 로그인 페이지로 이동
    const moveToLogin = () => {
        navigate({ pathname: "/" }, { replace: true });
    };

    // 로그인 페이지로 이동 (컴포넌트 형태)
    const moveToLoginReturn = () => {
        return <Navigate replace to="/" />;
    };

    return {
        loginState,
        isLogin,
        doLogin,
        doLogout,
        moveToPath,
        moveToLogin,
        moveToLoginReturn,
        exceptionHandle,
        saveAsCookie,
    };
};

export default useCustomLogin;
