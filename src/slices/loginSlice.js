import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginPost } from "../api/memberApi";

import { getCookie, setCookie, removeCookie } from "../util/cookieUtil";

// 초기 상태 정의
const initState = {
    email: '' // email 필드는 빈 문자열로 초기화
};

// 비동기 액션 생성 (loginPostAsync): 서버에 로그인 요청을 보내고 결과를 반환
export const loginPostAsync = createAsyncThunk('loginPostAsync', (param) => {
    return loginPost(param); // loginPost는 API 호출 함수 (로그인 요청)
});

// 쿠키에서 로그인 정보를 로딩하는 함수
const loadMemberCookie = () => {
    const memberInfo = getCookie("member"); // "member"라는 이름의 쿠키 값을 가져옴

    // 닉네임이 있을 경우, 한글 처리를 위해 디코딩
    if (memberInfo && memberInfo.nickname) {
        memberInfo.nickname = decodeURIComponent(memberInfo.nickname);
    }

    return memberInfo; // 쿠키에서 가져온 정보를 반환
};

// loginSlice 생성: 상태, 리듀서, 액션을 정의
const loginSlice = createSlice({
    name: 'LoginSlice', // Slice 이름 (디버깅 및 Redux DevTools에서 사용)
    initialState: loadMemberCookie() || initState, // 초기 상태: 쿠키가 있으면 쿠키 정보 사용, 없으면 initState 사용
    reducers: {
        // 동기 액션: 로그인 처리
        login: (state, action) => {
            console.log("login.....");

            const payload = action.payload; // 액션에서 전달된 데이터

            // 쿠키에 로그인 정보 저장 (유효 기간 1일)
            setCookie("member", JSON.stringify(payload), 1);

            return payload; // 상태를 새로운 로그인 정보로 교체
        },

        // 동기 액션: 로그아웃 처리
        logout: (state, action) => {
            console.log("logout....");

            removeCookie("member"); // 쿠키 삭제

            return { ...initState }; // 상태를 초기 상태로 재설정
        }
    },
    extraReducers: (builder) => {
        // 비동기 액션: 성공적으로 로그인 요청을 처리했을 때
        builder.addCase(loginPostAsync.fulfilled, (state, action) => {
            console.log("fulfilled");

            const payload = action.payload; // 서버에서 반환된 데이터

            // 닉네임이 있을 경우 한글 처리를 위해 인코딩
            if (payload.nickname) {
                payload.nickname = encodeURIComponent(payload.nickname);
            }

            // 에러가 없을 경우 쿠키에 로그인 정보 저장
            if (!payload.error) {
                setCookie("member", JSON.stringify(payload), 1); // 유효 기간 1일
            }

            return payload; // 상태를 서버에서 받은 데이터로 업데이트
        });

        // 비동기 액션: 로그인 요청이 진행 중일 때
        builder.addCase(loginPostAsync.pending, (state, action) => {
            console.log("pending"); // 요청 상태를 디버깅 로그로 출력
        });

        // 비동기 액션: 로그인 요청이 실패했을 때
        builder.addCase(loginPostAsync.rejected, (state, action) => {
            console.log("rejected"); // 요청 실패 상태를 디버깅 로그로 출력
        });
    }
});

// 동기 액션 내보내기: login, logout
export const { login, logout } = loginSlice.actions;

// 리듀서를 기본 내보내기
export default loginSlice.reducer;
