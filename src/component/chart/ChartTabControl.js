const ChartTabControl = ({ tabs, selectedTab, onSelectTab }) => {
    return (
        <div className="relative mb-6">
            {/* 회색 선 */}
            <div className="absolute bottom-0 left-0 w-full border-b border-gray-200" />
            {/* 탭 버튼 */}
            <div className="flex gap-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onSelectTab(tab)}
                        className={`pb-1 ${
                            selectedTab === tab ? "border-b-[3px] border-black text-[#21262B] font-semibold" : "text-[#60697E]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default ChartTabControl