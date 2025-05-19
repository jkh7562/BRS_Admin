import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AlarmIcon from "../assets/알림.png"
import DownIcon from "../assets/Down.png"
import FireInfoIcon from "../assets/FireInfo.png"
import BoxIcon from "../assets/수거함Black.png"
import UserIcon from "../assets/user.png"
import { getMyInfo, logout, fetchEmployeeRequests, findAllBox, checkPassword, updatePassword } from "../api/apiServices"

const Topbar = () => {
    const navigate = useNavigate()
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false)
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    // 비밀번호 변경 관련 오류 메시지 상태 추가
    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        general: "",
    })
    // 비밀번호 변경 성공 메시지 상태 추가
    const [passwordSuccess, setPasswordSuccess] = useState("")

    const [userInfo, setUserInfo] = useState({ name: "", id: "" })
    const [alarms, setAlarms] = useState([])
    const [employeeRequests, setEmployeeRequests] = useState([])
    const [hasNewRequests, setHasNewRequests] = useState(false)
    const [fireAlarms, setFireAlarms] = useState([])
    const [boxesMap, setBoxesMap] = useState({}) // 박스 ID와 이름을 매핑하는 객체

    // 사용자 정보 가져오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const data = await getMyInfo()
                setUserInfo({
                    name: data.name || "",
                    id: data.id || "",
                })
            } catch (error) {
                console.error("내 정보 불러오기 실패:", error)
            }
        }

        fetchUserInfo()
    }, [])

    // 화재 상태 확인 및 알람 생성
    useEffect(() => {
        const checkFireStatus = async () => {
            try {
                const boxes = await findAllBox()
                const fireBoxes = boxes.filter(
                    (box) => box.fire_status1 === "FIRE" || box.fire_status2 === "FIRE" || box.fire_status3 === "FIRE",
                )

                if (fireBoxes.length > 0) {
                    // 기존 화재 알람 ID 목록
                    const existingFireAlarmIds = fireAlarms.map((alarm) => alarm.boxId)

                    // 새로운 화재 알람 생성
                    const newFireAlarms = fireBoxes
                        .filter((box) => !existingFireAlarmIds.includes(box.id))
                        .map((box) => ({
                            id: `fire-${box.id}-${Date.now()}`,
                            type: "fire",
                            boxId: box.id,
                            location: box.name,
                            timestamp: new Date().toISOString(),
                            priority: 1, // 최우선 순위
                        }))

                    if (newFireAlarms.length > 0) {
                        setFireAlarms((prev) => [...prev, ...newFireAlarms])
                        // 화재 알람을 일반 알람에도 추가
                        setAlarms((prev) => [...prev, ...newFireAlarms])
                    }
                }
            } catch (error) {
                console.error("화재 상태 확인 실패:", error)
            }
        }

        // 초기 로드 시 화재 상태 확인
        checkFireStatus()

        // 1분마다 화재 상태 확인 코드 제거

        return () => {}
    }, [fireAlarms])

    // 신규 가입자 요청 가져오기
    useEffect(() => {
        const getEmployeeRequests = async () => {
            try {
                const requests = await fetchEmployeeRequests()
                if (requests && requests.length > 0) {
                    setEmployeeRequests(requests)
                    setHasNewRequests(true)
                    // 신규 가입자 알람 추가 코드 제거됨
                }
            } catch (error) {
                console.error("가입 요청 불러오기 실패:", error)
            }
        }

        getEmployeeRequests()

        return () => {}
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

    // SSE 연결
    useEffect(() => {
        const eventSource = new EventSource(`${process.env.REACT_APP_API_BASE_URL}/SSEsubscribe`, {
            withCredentials: true,
        })
        console.log("구독 후", eventSource)

        eventSource.onopen = () => {
            console.log("SSE 연결 성공")
        }

        eventSource.addEventListener("alarm", (event) => {
            try {
                console.log("SSE 메시지 수신:", event.event)
                const alarmData = JSON.parse(event.data)

                // boxId가 있으면 boxesMap에서 해당 박스 이름 찾기
                if (alarmData.boxId && boxesMap[alarmData.boxId]) {
                    alarmData.location = boxesMap[alarmData.boxId]
                }

                // 알람 타입에 따른 처리
                if (alarmData.type === "NEW_USER_REQUEST") {
                    // 신규 가입자 요청 알람은 처리하지 않음
                    return
                } else if (alarmData.type === "fire") {
                    // 화재 알람은 최우선 순위로 설정
                    alarmData.priority = 1
                    setFireAlarms((prev) => [...prev, alarmData])
                    setAlarms((prev) => [...prev, alarmData])

                    // 화재 발생 시 즉시 화재 상태 확인
                    findAllBox().then((boxes) => {
                        const fireBoxes = boxes.filter(
                            (box) => box.fire_status1 === "FIRE" || box.fire_status2 === "FIRE" || box.fire_status3 === "FIRE",
                        )
                        console.log("화재 발생 수거함:", fireBoxes)
                    })
                } else {
                    // 기타 알람은 낮은 우선순위로 설정
                    alarmData.priority = 3
                    setAlarms((prev) => [...prev, alarmData])
                }
            } catch (error) {
                console.error("SSE 데이터 파싱 에러:", error)
            }
        })

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error)
            eventSource.close()
        }

        return () => {
            eventSource.close()
        }
    }, [boxesMap]) // boxesMap이 변경될 때마다 이벤트 리스너 재설정

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
        // 폼 열 때 오류 메시지와 성공 메시지 초기화
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
        // 폼 닫을 때 오류 메시지와 성공 메시지 초기화
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

        // 입력 시 해당 필드의 오류 메시지 초기화
        setPasswordErrors((prev) => ({
            ...prev,
            [name]: "",
        }))
    }

    // 비밀번호 변경 로직 구현 - 오류 메시지를 alert 대신 상태로 관리
    const handlePasswordSubmit = async (e) => {
        e.preventDefault()

        // 오류 메시지 초기화
        setPasswordErrors({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            general: "",
        })
        setPasswordSuccess("")

        // 1. 입력값 검증
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

        // 2. 새 비밀번호와 확인 비밀번호 일치 여부 확인
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
            // 3. 현재 비밀번호 확인
            const checkResult = await checkPassword(passwordForm.currentPassword)

            if (checkResult !== "Success") {
                setPasswordErrors({
                    ...newErrors,
                    currentPassword: "현재 비밀번호가 일치하지 않습니다.",
                })
                return
            }

            // 4. 새 비밀번호로 변경
            const updateResult = await updatePassword(passwordForm.newPassword)

            if (updateResult === "Success") {
                // 성공 메시지 설정
                setPasswordSuccess("비밀번호가 성공적으로 변경되었습니다.")

                // 3초 후 폼 닫기
                setTimeout(() => {
                    // 폼 초기화 및 드롭다운 닫기
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
            console.error("비밀번호 변경 중 오류 발생:", error)
            setPasswordErrors({
                ...newErrors,
                general: "서버 오류로 비밀번호 변경에 실패했습니다. 다시 시도해주세요.",
            })
        }
    }

    const handleLogoutClick = async () => {
        try {
            await logout()
            navigate("/n_LoginPage")
        } catch (error) {
            console.error("❌ 로그아웃 실패:", error)
            alert("로그아웃에 실패했습니다. 다시 시도해주세요.")
        }
    }

    // 알람 클릭 핸들러
    const handleAlarmClick = (alarm) => {
        // 알람 타입에 따라 다른 페이지로 이동
        if (alarm.type === "NEW_USER_REQUEST") {
            navigate("/n_UserApprovalPage") // 가입 관리 페이지로 이동
        } else if (alarm.type === "fire") {
            navigate("/n_MonitoringPage") // 모니터링 페이지로 이동
        } else if (alarm.type.startsWith("INSTALL_") || alarm.type.startsWith("REMOVE_")) {
            navigate("/n_BoxAddRemovePage") // 수거함 설치/제거 페이지로 이동
        }

        // 알림 사이드바 닫기
        setIsNotificationSidebarOpen(false)
    }

    // 알람 타입에 따른 제목과 아이콘 가져오기
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
                    bgColor: "bg-red-500",
                    textColor: "text-white",
                }
            case "FIRE_COMPLETED":
                return {
                    title: "화재처리 완료",
                    icon: FireInfoIcon,
                    bgColor: "bg-red-400",
                    textColor: "text-white",
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

    // 알람 메시지 포맷팅
    const formatAlarmMessage = (alarm) => {
        // If this is a grouped alarm with count, return the count message
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

        // For backward compatibility, handle individual alarms
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

    // Add a function to group alarms by type and count them
    const groupAlarmsByType = (alarms) => {
        // Create a map to count alarms by type
        const alarmCounts = {}

        // Count alarms by type
        alarms.forEach((alarm) => {
            const type = alarm.type
            if (!alarmCounts[type]) {
                alarmCounts[type] = {
                    count: 0,
                    priority: alarm.priority || 3,
                    timestamp: alarm.timestamp || new Date().toISOString(),
                    type: type,
                }
            }
            alarmCounts[type].count++

            // Use the most recent timestamp
            if (alarm.timestamp && new Date(alarm.timestamp) > new Date(alarmCounts[type].timestamp)) {
                alarmCounts[type].timestamp = alarm.timestamp
            }
        })

        // Convert the map to an array
        return Object.values(alarmCounts).map((alarm) => ({
            id: `${alarm.type}-group-${Date.now()}`,
            type: alarm.type,
            count: alarm.count,
            timestamp: alarm.timestamp,
            priority: alarm.priority,
        }))
    }

    // 테스트용 더미 알람 데이터 (실제 구현 시 제거)
    const dummyAlarms = [
        /*{ id: 1, type: "fire", location: "서울특별시 송파구 가락로 111", timestamp: new Date().toISOString(), priority: 1 },
                    { id: 2, type: "INSTALL_COMPLETED", location: "선문대 동문 앞", timestamp: new Date().toISOString(), priority: 3 },
                    { id: 3, type: "REMOVE_COMPLETED", location: "선문대 서문 앞", timestamp: new Date().toISOString(), priority: 3 }*/
    ]

    // 실제 알람과 더미 알람 합치기 (테스트용, 실제 구현 시 alarms만 사용)
    const allAlarms = [...alarms, ...dummyAlarms]

    // 우선순위에 따라 알람 정렬 (1: 화재, 2: 신규가입, 3: 기타)
    // NEW_USER_REQUEST 타입 알람 제외
    const filteredAlarms = [...allAlarms].filter((alarm) => alarm.type !== "NEW_USER_REQUEST")
    const groupedAlarms = groupAlarmsByType(filteredAlarms)
    const sortedAlarms = groupedAlarms.sort((a, b) => {
        // 우선순위로 먼저 정렬
        if (a.priority !== b.priority) {
            return a.priority - b.priority
        }
        // 같은 우선순위면 최신순으로 정렬
        return new Date(b.timestamp) - new Date(a.timestamp)
    })

    // 알림 개수
    const totalNotifications = sortedAlarms.length

    // 화재 알람 개수
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
                            {/* 화재 알람이 있을 경우 특별한 표시 추가 */}
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
                                        className={`${bgColor} py-6 px-6 rounded-2xl shadow cursor-pointer hover:opacity-90 transition-opacity ${
                                            alarm.type === "fire" ? "animate-pulse-slow border-2 border-red-700" : ""
                                        }`}
                                        onClick={() => handleAlarmClick(alarm)}
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
                                                <p className={`text-sm mt-1 ${alarm.type === "fire" ? "text-white" : "text-[#60697E]"}`}>
                                                    {message}
                                                </p>
                                                {alarm.timestamp && (
                                                    <p className={`text-xs mt-2 ${alarm.type === "fire" ? "text-gray-300" : "text-gray-500"}`}>
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

            {/* 화재 알람을 위한 CSS 애니메이션 */}
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