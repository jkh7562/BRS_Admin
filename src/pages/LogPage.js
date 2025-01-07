import React from "react";
import NavigationBar from "../component/NavigationBar"; // NavigationBar 컴포넌트 임포트

const LogPage = () => {
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
                <div className="grid grid-cols-12 gap-4 mb-4">
                    {/* 배출 로그 */}
                    <div className="bg-white shadow-md p-4 col-span-4">
                        <p className="font-bold mb-2">배출 로그</p>
                        <table className="w-full table-auto border-collapse border border-gray-200">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">이름</th>
                                <th className="border border-gray-300 px-4 py-2">배출량</th>
                                <th className="border border-gray-300 px-4 py-2">배출 일자</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">홍길동</td>
                                <td className="border border-gray-300 px-4 py-2">3</td>
                                <td className="border border-gray-300 px-4 py-2">2024/12/30</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">홍길동</td>
                                <td className="border border-gray-300 px-4 py-2">4</td>
                                <td className="border border-gray-300 px-4 py-2">2024/12/29</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">홍길동</td>
                                <td className="border border-gray-300 px-4 py-2">7</td>
                                <td className="border border-gray-300 px-4 py-2">2024/12/28</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 수거 로그 */}
                    <div className="bg-white shadow-md p-4 col-span-4">
                        <p className="font-bold mb-2">수거 로그</p>
                        <table className="w-full table-auto border-collapse border border-gray-200">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">이름</th>
                                <th className="border border-gray-300 px-4 py-2">수거량</th>
                                <th className="border border-gray-300 px-4 py-2">수거 일자</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">홍길동</td>
                                <td className="border border-gray-300 px-4 py-2">38</td>
                                <td className="border border-gray-300 px-4 py-2">2024/12/30</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">홍길동</td>
                                <td className="border border-gray-300 px-4 py-2">23</td>
                                <td className="border border-gray-300 px-4 py-2">2024/12/29</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">홍길동</td>
                                <td className="border border-gray-300 px-4 py-2">78</td>
                                <td className="border border-gray-300 px-4 py-2">2024/12/28</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 수거함 검색 및 리스트 */}
                    <div className="bg-white shadow-md p-4 col-span-4">
                        <p className="font-bold mb-2">수거함</p>
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
            </div>
        </div>
    );
};

export default LogPage;
