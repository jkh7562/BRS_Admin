import { Cookies } from "react-cookie";

// react-cookie를 사용하여 쿠키 관리 객체 생성
const cookies = new Cookies();

// 쿠키를 설정하는 함수
export const setCookie = (name, value, days) => {

    const expires = new Date(); // 현재 날짜와 시간을 기반으로
    expires.setUTCDate(expires.getUTCDate() + days); // 보관 기한 설정 (현재 날짜에 days를 더함)

    // 쿠키 설정 (name: 쿠키 이름, value: 쿠키 값, path: '/'로 설정하여 모든 경로에서 접근 가능, expires: 만료 날짜)
    return cookies.set(name, value, { path: '/', expires: expires });
};

// 쿠키를 가져오는 함수
export const getCookie = (name) => {
    return cookies.get(name); // 이름에 해당하는 쿠키 값을 반환
};

// 쿠키를 삭제하는 함수
export const removeCookie = (name, path = "/") => {
    cookies.remove(name, { path }); // 이름에 해당하는 쿠키를 삭제 (기본 경로는 '/')
};
