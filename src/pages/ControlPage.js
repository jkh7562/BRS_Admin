import React from "react";
import NavigationBar from "../component/NavigationBar"; // NavigationBar 컴포넌트 임포트

const ControlPage = () => {
    return (
        <div className="h-screen w-screen flex flex-col bg-gray-100">
            {/* 네비게이션 바 */}
            <NavigationBar />

            {/* 페이지 내용 */}
            <div className="mt-16 p-4">
                {/* 상단 영역 */}
                <div className="flex justify-between mb-4">
                    <div className="flex items-center">
                        <p className="font-bold mr-2">수거함 이름:</p>
                        <input
                            type="text"
                            className="border px-2 py-1 rounded w-64"
                            placeholder="수거함 이름 입력"
                            value="선문대 동문 앞 수거함"
                            readOnly
                        />
                    </div>
                </div>

                {/* 중간 영역 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* 지도 또는 카메라 영역 */}
                    <div className="bg-white shadow-md p-4">
                        <div className="h-96 bg-gray-200 flex items-center justify-center">
                            <p className="font-bold text-gray-500">지도 or 카메라</p>
                        </div>
                    </div>

                    {/* 수거함 검색 및 리스트 */}
                    <div className="bg-white shadow-md p-4">
                        <p className="font-bold mb-4">수거함</p>
                        <div className="flex space-x-2 mb-4">
                            <input
                                type="text"
                                className="border px-2 py-1 rounded flex-1"
                                placeholder="수거함 검색"
                            />
                            <button className="px-4 py-1 bg-blue-500 text-white rounded">
                                검색
                            </button>
                        </div>
                        <div className="h-72 overflow-y-auto">
                            <ul className="border rounded divide-y">
                                <li className="p-2">선문대 동문 앞 수거함</li>
                                <li className="p-2">선문대 서문 앞 수거함</li>
                                <li className="p-2">선문대 상봉마을 앞 수거함</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 버튼 영역 */}
                <div className="mt-4 flex flex-col items-left space-y-2 ml-40">
                    <div className="flex">
                        {/* 사용자 개방 버튼 */}
                        <button className="px-4 py-2 bg-blue-500 text-white rounded mr-2">
                            사용자 개방
                        </button>

                        {/* 사용자 폐쇄 버튼 */}
                        <button className="px-4 py-2 bg-red-500 text-white rounded mr-10">
                            사용자 폐쇄
                        </button>

                        {/* 차단 버튼 */}
                        <button className="px-4 py-2 bg-gray-500 text-white rounded mr-10">
                            차단
                        </button>

                        {/* 수거자 개방 버튼 */}
                        <button className="px-4 py-2 bg-blue-500 text-white rounded mr-2">
                            수거자 개방
                        </button>

                        {/* 수거자 폐쇄 버튼 */}
                        <button className="px-4 py-2 bg-red-500 text-white rounded">
                            수거자 폐쇄
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlPage;
