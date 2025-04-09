import Sidebar from "../../component/Sidebar"
import Topbar from "../../component/Topbar"

const N_boxAddRemovePage = () => {
    return (
        <div className="flex min-h-screen w-screen bg-[#F3F3F5]">
            <Sidebar/>
            <div className="flex-1 relative">
                <Topbar/>
            </div>
        </div>
    )
}

export default N_boxAddRemovePage