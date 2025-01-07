import React from "react";

const NavigationBar = () => {
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-white shadow-md fixed top-0 left-0 w-full z-50">
            {/* 로고 */}
            <div className="flex flex-none">
                <button className="px-4 py-2 border rounded">로고</button>
            </div>

            {/* 중앙 버튼 그룹 */}
            <div className="flex flex-grow justify-center space-x-4">
                <button className="px-4 py-2 border rounded">수거함 제어</button>
                <button className="px-4 py-2 border rounded">수거함 로그</button>
                <button className="px-4 py-2 border rounded">가입 코드 관리</button>
            </div>

            {/* 오른쪽 아이콘 그룹 */}
            <div className="flex flex-none items-center space-x-4">
                <img src="/path/to/springboot-logo.png" alt="Spring Boot" className="h-6" />
                <img src="/path/to/mysql-logo.png" alt="MySQL" className="h-6" />
                <img src="/path/to/react-logo.png" alt="React" className="h-6" />
                <button className="px-4 py-2 border rounded">알림</button>
                <button className="px-4 py-2 border rounded">프로필</button>
            </div>
        </div>
    );
};

export default NavigationBar;
