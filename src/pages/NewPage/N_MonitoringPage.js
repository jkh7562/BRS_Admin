import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"

const N_MonitoringPage = () => {

    return (
        <div className="flex min-h-screen w-screen bg-[#F3F3F5]">
            <Sidebar />
            <div className="flex-1 relative">
                <Topbar />
                <main className="pt-24 px-24 pb-6 space-y-4">
                    <p className="font-bold text-xl">모니터링</p>
                </main>
            </div>
        </div>
    )

}

export default N_MonitoringPage