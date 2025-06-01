import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import AlarmIcon from "../assets/알림.png"
import DownIcon from "../assets/Down.png"
import FireInfoIcon from "../assets/FireInfo.png"
import BoxIcon from "../assets/수거함Black.png"
import UserIcon from "../assets/user.png"
import {
    getMyInfo,
    logout,
    fetchEmployeeRequests,
    findAllBox,
    checkPassword,
    updatePassword,
    getUserUnresolvedAlarms,
} from "../api/apiServices"
import { useAlarms } from "../hooks/useAlarms"

const Topbar = () => {
    const navigate = useNavigate()
    const { alarms, fireAlarms, boxesMap, addFireAlarm } = useAlarms()

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false)
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        general: "",
    })
    const [passwordSuccess, setPasswordSuccess] = useState("")
    const [userInfo, setUserInfo] = useState({ name: "", id: "" })
    const [employeeRequests, setEmployeeRequests] = useState([])
    const [hasNewRequests, setHasNewRequests] = useState(false)
    const [lastApiCheck, setLastApiCheck] = useState(0)
    const apiCheckIntervalRef = useRef(null)

    // 사용자 정보 가져오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const data = await getMyInfo()
                setUserInfo({
                    name: data.name || "",
                    id: data.id || "",
                })
                console.log("👤 사용자 정보 로드:", data.name)
            } catch (error) {
                console.error("❌ 내 정보 불러오기 실패:", error)
            }
        }

        fetchUserInfo()
    }, [])

    // 미해결 알람 가져오기 - 주기적으로 실행 (30초마다)
    useEffect(() => {
        // 컴포넌트 마운트 시 즉시 실행
        fetchUnresolvedAlarms()

        // 30초마다 미해결 알람 갱신
        apiCheckIntervalRef.current = setInterval(() => {
            fetchUnresolvedAlarms()
        }, 30000) // 30초마다 실행

        return () => {
            if (apiCheckIntervalRef.current) {
                clearInterval(apiCheckIntervalRef.current)
            }
        }
    }, [])

    // 미해결 알람 가져오기 함수
    const fetchUnresolvedAlarms = async () => {
        try {
            const now = Date.now()
            // 마지막 API 호출 후 5초 이내면 스킵 (너무 빈번한 호출 방지)
            if (now - lastApiCheck < 5000) {
                console.log("⏱️ API 호출 간격이 너무 짧음, 스킵")
                return
            }

            setLastApiCheck(now)
            console.log("📋 미해결 알람 로드 시작...")
            const unresolvedAlarms = await getUserUnresolvedAlarms()

            if (unresolvedAlarms && Array.isArray(unresolvedAlarms)) {
                console.log("📋 미해결 알람 데이터:", unresolvedAlarms.length, "건")
                // 전역 상태에 API 알람 설정
                window.alarmState.setAPIAlarms(unresolvedAlarms)
            } else {
                console.log("📋 미해결 알람 없음")
                window.alarmState.setAPIAlarms([]) // 빈 배열로 설정
            }
        } catch (error) {
            console.error("❌ 미해결 알람 불러오기 실패:", error)
        }
    }

    // 화재 상태 확인 및 알람 생성
    useEffect(() => {
        const checkFireStatus = async () => {
            try {
                const boxes = await findAllBox()
                const fireBoxes = boxes.filter(
                    (box) => box.fire_status1 === "FIRE" || box.fire_status2 === "FIRE" || box.fire_status3 === "FIRE",
                )

                if (fireBoxes.length > 0) {
                    const existingFireAlarmIds = fireAlarms.map((alarm) => alarm.boxId)

                    const newFireAlarms = fireBoxes
                        .filter((box) => !existingFireAlarmIds.includes(box.id))
                        .map((box) => ({
                            id: `fire-${box.id}-${Date.now()}`,
                            type: "fire",
                            boxId: box.id,
                            location: box.name,
                            timestamp: box.fire_detected_at || box.updated_at || new Date().toISOString(), // 실제 화재 감지 시간 사용
                            priority: 1,
                        }))

                    // 새로운 화재 알람이 있으면 추가
                    newFireAlarms.forEach((alarm) => addFireAlarm(alarm))

                    if (newFireAlarms.length > 0) {
                        console.log("🚨 새로운 화재 알람 생성:", newFireAlarms.length, "건")
                    }
                }
            } catch (error) {
                console.error("❌ 화재 상태 확인 실패:", error)
            }
        }

        checkFireStatus()
    }, [fireAlarms, addFireAlarm])

    // 신규 가입자 요청 가져오기
    useEffect(() => {
        const getEmployeeRequests = async () => {
            try {
                const requests = await fetchEmployeeRequests()
                if (requests && requests.length > 0) {
                    setEmployeeRequests(requests)
                    setHasNewRequests(true)
                    console.log("📝 신규 가입 요청:", requests.length, "건")
                }
            } catch (error) {
                console.error("❌ 가입 요청 불러오기 실패:", error)
            }
        }

        getEmployeeRequests()
    }, [])

    // 클릭 이벤트 처리
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isNotificationSidebarOpen &&
                !event.target.closest(".notification-sidebar") &&
                !event.target.closest(".notification-button")
            ) {
                setIsNotificationSidebarOpen(false)
            }

            if (
                isProfileDropdownOpen &&
                !event.target.closest(".profile-dropdown") &&
                !event.target.closest(".profile-button")
            ) {
                setIsProfileDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isProfileDropdownOpen, isNotificationSidebarOpen])

    const toggleProfileDropdown = () => {
        if (!isProfileDropdownOpen) {
            setShowPasswordForm(false)
        }
        setIsProfileDropdownOpen(!isProfileDropdownOpen)
    }

    const toggleNotificationSidebar = () => {
        setIsNotificationSidebarOpen(!isNotificationSidebarOpen)
    }

    const openPasswordForm = () => {
        setPasswordErrors({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            general: "",
        })
        setPasswordSuccess("")
        setShowPasswordForm(true)
    }

    const closePasswordForm = () => {
        setShowPasswordForm(false)
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        })
        setPasswordErrors({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            general: "",
        })
        setPasswordSuccess("")
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }))

        setPasswordErrors((prev) => ({
            ...prev,
            [name]: "",
        }))
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()

        setPasswordErrors({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            general: "",
        })
        setPasswordSuccess("")

        let hasError = false
        const newErrors = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            general: "",
        }

        if (!passwordForm.currentPassword) {
            newErrors.currentPassword = "현재 비밀번호를 입력해주세요."
            hasError = true
        }

        if (!passwordForm.newPassword) {
            newErrors.newPassword = "새 비밀번호를 입력해주세요."
            hasError = true
        }

        if (!passwordForm.confirmPassword) {
            newErrors.confirmPassword = "비밀번호 확인을 입력해주세요."
            hasError = true
        }

        if (
            passwordForm.newPassword &&
            passwordForm.confirmPassword &&
            passwordForm.newPassword !== passwordForm.confirmPassword
        ) {
            newErrors.confirmPassword = "새 비밀번호와 확인 비밀번호가 일치하지 않습니다."
            hasError = true
        }

        if (hasError) {
            setPasswordErrors(newErrors)
            return
        }

        try {
            const checkResult = await checkPassword(passwordForm.currentPassword)

            if (checkResult !== "Success") {
                setPasswordErrors({
                    ...newErrors,
                    currentPassword: "현재 비밀번호가 일치하지 않습니다.",
                })
                return
            }

            const updateResult = await updatePassword(passwordForm.newPassword)

            if (updateResult === "Success") {
                setPasswordSuccess("비밀번호가 성공적으로 변경되었습니다.")

                setTimeout(() => {
                    setIsProfileDropdownOpen(false)
                    setShowPasswordForm(false)
                    setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                    })
                    setPasswordSuccess("")
                }, 3000)
            } else {
                setPasswordErrors({
                    ...newErrors,
                    general: "비밀번호 변경에 실패했습니다. 다시 시도해주세요.",
                })
            }
        } catch (error) {
            console.error("❌ 비밀번호 변경 중 오류 발생:", error)
            setPasswordErrors({
                ...newErrors,
                general: "서버 오류로 비밀번호 변경에 실패했습니다. 다시 시도해주세요.",
            })
        }
    }

    const handleLogoutClick = async () => {
        try {
            await logout()
            navigate("/")
            console.log("👋 로그아웃 완료")
        } catch (error) {
            console.error("❌ 로그아웃 실패:", error)
            alert("로그아웃에 실패했습니다. 다시 시도해주세요.")
        }
    }

    const getMonitoringTabFromAlarmType = (alarmType) => {
        switch (alarmType) {
            case "fire":
            case "FIRE":
            case "FIRE_IN_PROGRESS":
            case "FIRE_COMPLETED":
            case "FIRE_CONFIRMED":
                return "화재 처리"
            case "COLLECTION_NEEDED":
            case "COLLECTION_RECOMMENDED":
            case "COLLECTION_IN_PROGRESS":
            case "COLLECTION_COMPLETED":
            case "COLLECTION_CONFIRMED":
                return "수거 현황"
            case "INSTALL_REQUEST":
            case "INSTALL_IN_PROGRESS":
            case "INSTALL_COMPLETED":
            case "INSTALL_CONFIRMED":
                return "설치 현황"
            case "REMOVE_REQUEST":
            case "REMOVE_IN_PROGRESS":
            case "REMOVE_COMPLETED":
            case "REMOVE_CONFIRMED":
                return "제거 현황"
            default:
                return "설치 현황"
        }
    }

    const handleAlarmClick = (e, alarm) => {
        console.log("🔔 알람 클릭됨:", alarm.type, "ID:", alarm.id, "Source:", alarm.source)

        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }

        setIsNotificationSidebarOpen(false)

        const targetTab = getMonitoringTabFromAlarmType(alarm.type)
        localStorage.setItem("activeMonitoringTab", targetTab)
        navigate("/n_MonitoringPage")
    }

    const getAlarmInfo = (alarmType) => {
        switch (alarmType) {
            case "fire":
            case "FIRE":
                return {
                    title: "화재 발생",
                    icon: FireInfoIcon,
                    bgColor: "bg-red-600",
                    textColor: "text-white",
                }
            case "FIRE_IN_PROGRESS":
                return {
                    title: "화재처리 진행",
                    icon: FireInfoIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "FIRE_COMPLETED":
                return {
                    title: "화재처리 완료",
                    icon: FireInfoIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "FIRE_CONFIRMED":
                return {
                    title: "화재처리 확정",
                    icon: FireInfoIcon,
                    bgColor: "bg-red-300",
                    textColor: "text-white",
                }
            case "COLLECTION_NEEDED":
                return {
                    title: "수거 필요",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "COLLECTION_RECOMMENDED":
                return {
                    title: "수거 권장",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "COLLECTION_IN_PROGRESS":
                return {
                    title: "수거 진행",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "COLLECTION_COMPLETED":
                return {
                    title: "수거 완료",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "COLLECTION_CONFIRMED":
                return {
                    title: "수거 확정",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "INSTALL_REQUEST":
                return {
                    title: "설치 요청",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "INSTALL_IN_PROGRESS":
                return {
                    title: "설치 진행 중",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "INSTALL_COMPLETED":
                return {
                    title: "설치 완료",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "INSTALL_CONFIRMED":
                return {
                    title: "설치 확정",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "REMOVE_REQUEST":
                return {
                    title: "제거 요청",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "REMOVE_IN_PROGRESS":
                return {
                    title: "제거 진행 중",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "REMOVE_COMPLETED":
                return {
                    title: "제거 완료",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            case "REMOVE_CONFIRMED":
                return {
                    title: "제거 확정",
                    icon: BoxIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
            default:
                return {
                    title: "새로운 알림",
                    icon: AlarmIcon,
                    bgColor: "bg-white",
                    textColor: "text-[#21262B]",
                }
        }
    }

    const formatAlarmMessage = (alarm) => {
        if (alarm.count) {
            switch (alarm.type) {
                case "COLLECTION_NEEDED":
                    return `수거 필요 ${alarm.count}건이 있습니다.`
                case "COLLECTION_RECOMMENDED":
                    return `수거 권장 ${alarm.count}건이 있습니다.`
                case "COLLECTION_IN_PROGRESS":
                    return `수거 진행 ${alarm.count}건이 있습니다.`
                case "COLLECTION_COMPLETED":
                    return `수거 완료 ${alarm.count}건이 있습니다.`
                case "COLLECTION_CONFIRMED":
                    return `수거 확정 ${alarm.count}건이 있습니다.`
                case "FIRE":
                    return `화재 발생 ${alarm.count}건이 있습니다.`
                case "FIRE_IN_PROGRESS":
                    return `화재처리 진행 ${alarm.count}건이 있습니다.`
                case "FIRE_COMPLETED":
                    return `화재처리 완료 ${alarm.count}건이 있습니다.`
                case "FIRE_CONFIRMED":
                    return `화재처리 확정 ${alarm.count}건이 있습니다.`
                case "INSTALL_REQUEST":
                    return `설치 요청 ${alarm.count}건이 있습니다.`
                case "INSTALL_IN_PROGRESS":
                    return `설치 진행 ${alarm.count}건이 있습니다.`
                case "INSTALL_COMPLETED":
                    return `설치 완료 ${alarm.count}건이 있습니다.`
                case "INSTALL_CONFIRMED":
                    return `설치 확정 ${alarm.count}건이 있습니다.`
                case "REMOVE_REQUEST":
                    return `제거 요청 ${alarm.count}건이 있습니다.`
                case "REMOVE_IN_PROGRESS":
                    return `제거 진행 ${alarm.count}건이 있습니다.`
                case "REMOVE_COMPLETED":
                    return `제거 완료 ${alarm.count}건이 있습니다.`
                case "REMOVE_CONFIRMED":
                    return `제거 확정 ${alarm.count}건이 있습니다.`
                default:
                    return `${alarm.count}건의 알림이 있습니다.`
            }
        }

        switch (alarm.type) {
            case "fire":
                return "화재 발생 알림이 있습니다."
            case "INSTALL_REQUEST":
                return "설치 요청 알림이 있습니다."
            case "INSTALL_IN_PROGRESS":
                return "설치 진행 알림이 있습니다."
            case "INSTALL_COMPLETED":
                return "설치 완료 알림이 있습니다."
            case "INSTALL_CONFIRMED":
                return "설치 확정 알림이 있습니다."
            case "REMOVE_REQUEST":
                return "제거 요청 알림이 있습니다."
            case "REMOVE_IN_PROGRESS":
                return "제거 진행 알림이 있습니다."
            case "REMOVE_COMPLETED":
                return "제거 완료 알림이 있습니다."
            case "REMOVE_CONFIRMED":
                return "제거 확정 알림이 있습니다."
            default:
                return alarm.message || "새로운 알림이 있습니다."
        }
    }

    const groupAlarmsByType = (alarms) => {
        const alarmCounts = {}

        alarms.forEach((alarm) => {
            const type = alarm.type
            if (!alarmCounts[type]) {
                alarmCounts[type] = {
                    count: 0,
                    priority: alarm.priority || 3,
                    timestamp: alarm.timestamp || alarm.created_at || alarm.date || new Date().toISOString(),
                    type: type,
                    // 그룹의 첫 번째 알람 ID를 저장 (클릭 시 사용)
                    firstAlarmId: alarm.id,
                    source: alarm.source, // 소스 정보도 저장
                }
            }
            alarmCounts[type].count++

            // 알람 테이블의 실제 날짜를 우선 사용
            const alarmDate = alarm.timestamp || alarm.created_at || alarm.date || alarm.updated_at
            if (alarmDate && new Date(alarmDate) > new Date(alarmCounts[type].timestamp)) {
                alarmCounts[type].timestamp = alarmDate
            }
        })

        return Object.values(alarmCounts).map((alarm) => ({
            id: alarm.firstAlarmId, // 그룹의 첫 번째 알람 ID 사용
            type: alarm.type,
            count: alarm.count,
            timestamp: alarm.timestamp,
            priority: alarm.priority,
            source: alarm.source, // 소스 정보 포함
        }))
    }

    const filteredAlarms = alarms.filter((alarm) => alarm.type !== "NEW_USER_REQUEST")
    const groupedAlarms = groupAlarmsByType(filteredAlarms)
    const sortedAlarms = groupedAlarms.sort((a, b) => {
        if (a.priority !== b.priority) {
            return a.priority - b.priority
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    const totalNotifications = sortedAlarms.length
    const fireAlarmsCount = sortedAlarms.filter((alarm) => alarm.type === "fire").length

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bg-[#F3F3F5] z-40 border-b border-gray-200 h-16 flex items-center justify-end px-6">
                <div className="flex items-center gap-8">
                    <div className="relative flex items-center gap-3">
                        <img src={UserIcon || "/placeholder.svg"} alt="profile" className="w-8 h-8 rounded-full" />
                        <span className="text-lg font-medium text-[#272F42]">{userInfo.name}</span>
                        <button onClick={toggleProfileDropdown} className="profile-button flex items-center justify-center">
                            <img src={DownIcon || "/placeholder.svg"} alt="드롭다운 아이콘" className="w-3 h-3 object-contain" />
                        </button>

                        {isProfileDropdownOpen && (
                            <div className="profile-dropdown absolute top-full right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                                <div className="p-4 flex items-center gap-3">
                                    <img src={UserIcon || "/placeholder.svg"} alt="profile" className="w-14 h-14 rounded-full" />
                                    <div>
                                        <p className="text-xl font-medium text-[#21262B]">{userInfo.name}</p>
                                        <p className="text-[#60697E]">ID: {userInfo.id}</p>
                                    </div>
                                </div>

                                {!showPasswordForm ? (
                                    <div className="p-3 flex flex-col gap-2">
                                        <button
                                            className="w-full py-2 bg-[#7A7F8A] text-white rounded-md hover:bg-gray-500 transition-colors"
                                            onClick={openPasswordForm}
                                        >
                                            비밀번호 변경
                                        </button>
                                        <button
                                            onClick={handleLogoutClick}
                                            className="w-full py-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors"
                                        >
                                            로그아웃
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <form onSubmit={handlePasswordSubmit}>
                                            <div className="space-y-3">
                                                <div>
                                                    <input
                                                        type="password"
                                                        name="currentPassword"
                                                        value={passwordForm.currentPassword}
                                                        onChange={handlePasswordChange}
                                                        placeholder="현재 비밀번호"
                                                        className={`w-full px-3 py-2 border ${passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                        required
                                                    />
                                                    {passwordErrors.currentPassword && (
                                                        <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={passwordForm.newPassword}
                                                        onChange={handlePasswordChange}
                                                        placeholder="새 비밀번호"
                                                        className={`w-full px-3 py-2 border ${passwordErrors.newPassword ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                        required
                                                    />
                                                    {passwordErrors.newPassword && (
                                                        <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={passwordForm.confirmPassword}
                                                        onChange={handlePasswordChange}
                                                        placeholder="새 비밀번호 확인"
                                                        className={`w-full px-3 py-2 border ${passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                        required
                                                    />
                                                    {passwordErrors.confirmPassword && (
                                                        <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                                                    )}
                                                </div>

                                                {passwordErrors.general && <p className="text-red-500 text-sm">{passwordErrors.general}</p>}

                                                {passwordSuccess && <p className="text-green-500 text-sm font-medium">{passwordSuccess}</p>}
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                                >
                                                    확인
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={closePasswordForm}
                                                    className="flex-1 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative w-6 h-6 mr-4">
                        <button
                            onClick={toggleNotificationSidebar}
                            className="notification-button w-full h-full flex items-center justify-center"
                        >
                            <img src={AlarmIcon || "/placeholder.svg"} alt="알림 아이콘" className="w-full h-full object-contain" />
                            {totalNotifications > 0 && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                            {fireAlarmsCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] animate-pulse">
                  {fireAlarmsCount}
                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={`notification-sidebar fixed top-16 right-0 h-[calc(100%-4rem)] w-80 bg-[#F3F3F5] shadow-lg z-30 transition-transform duration-300 ease-in-out ${
                    isNotificationSidebarOpen ? "transform-none" : "transform translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 pt-8">
                    <h2 className="font-bold text-[#21262B] text-lg">
                        알림 {totalNotifications}건
                        {fireAlarmsCount > 0 && (
                            <span className="ml-2 text-sm font-bold text-red-600 animate-pulse">(화재 {fireAlarmsCount}건)</span>
                        )}
                    </h2>
                </div>

                <div className="p-5 overflow-y-auto h-[calc(100%-60px)]">
                    <div className="flex flex-col gap-2">
                        {totalNotifications > 0 ? (
                            sortedAlarms.map((alarm) => {
                                const { title, icon, bgColor, textColor } = getAlarmInfo(alarm.type)
                                const message = formatAlarmMessage(alarm)

                                return (
                                    <div
                                        key={alarm.id}
                                        className={`${bgColor} py-6 px-6 rounded-2xl shadow cursor-pointer hover:opacity-90 transition-opacity relative ${
                                            alarm.type === "fire" ? "animate-pulse-slow border-2 border-red-700" : ""
                                        }`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleAlarmClick(e, alarm)
                                        }}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="w-full">
                                                <div className="flex items-center gap-2">
                                                    <img src={icon || "/placeholder.svg"} alt="알림 아이콘" className="w-5 h-5 object-contain" />
                                                    <p className={`font-semibold text-lg ${textColor}`}>{title}</p>
                                                    {alarm.type === "fire" && (
                                                        <span className="bg-red-700 text-white text-xs px-2 py-0.5 rounded-full ml-auto">긴급</span>
                                                    )}
                                                </div>
                                                <p
                                                    className={`text-sm mt-1 ${alarm.type === "fire" || alarm.type === "FIRE" ? "text-white" : "text-[#60697E]"}`}
                                                >
                                                    {message}
                                                </p>
                                                {alarm.timestamp && (
                                                    <p
                                                        className={`text-xs mt-2 ${alarm.type === "fire" || alarm.type === "FIRE" ? "text-gray-300" : "text-gray-500"}`}
                                                    >
                                                        {new Date(alarm.timestamp).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-10 text-gray-500">알림이 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </>
    )
}

export default Topbar