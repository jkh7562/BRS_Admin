import React from "react";
import AlarmIcon from "../assets/알림.png";

const Topbar = () => {
    return (
        <div className="fixed top-0 left-[340px] right-0 bg-white z-10 border-b border-gray-200 h-16 flex items-center justify-end px-6">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <img
                        src="https://via.placeholder.com/32"
                        alt="profile"
                        className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700">재민</span>
                    <span className="text-gray-400 text-xs">▼</span>
                </div>
                <div className="relative w-6 h-6">
                    <img
                        src={AlarmIcon}
                        alt="알림 아이콘"
                        className="w-full h-full object-contain"
                    />
                    {/*<span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>*/}
                </div>
            </div>
        </div>
    );
};

export default Topbar;