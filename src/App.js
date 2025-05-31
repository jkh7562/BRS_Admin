import { useEffect, useState } from "react"
import { RouterProvider } from "react-router-dom"
import root from "./router/root"
import { findAllBox } from "./api/apiServices"

// 전역 알람 상태 관리를 위한 간단한 객체 - 로컬스토리지 제거, API 기준으로 변경
window.alarmState = {
  alarms: [],
  fireAlarms: [],
  boxesMap: {},
  listeners: new Set(),

  // 알람 ID 추출 함수 (원본 ID 반환)
  extractAlarmId: (alarm) => {
    return String(alarm.id || alarm.alarmId || "")
  },

  // 상태 업데이트 함수
  setAlarms: function (newAlarms) {
    this.alarms = newAlarms
    this.notifyListeners()
  },

  setFireAlarms: function (newFireAlarms) {
    this.fireAlarms = newFireAlarms
    this.notifyListeners()
  },

  setBoxesMap: function (newBoxesMap) {
    this.boxesMap = newBoxesMap
  },

  // API에서 가져온 알람 설정 (기본 알람 상태)
  setAPIAlarms: function (apiAlarms) {
    if (!apiAlarms || !Array.isArray(apiAlarms)) {
      this.alarms = []
      this.fireAlarms = []
      this.notifyListeners()
      return
    }

    console.log("🔄 API 알람 설정 시작:", apiAlarms.length, "건")

    const normalizedAlarms = []
    const normalizedFireAlarms = []

    apiAlarms.forEach((alarmData) => {
      const normalizedAlarm = {
        id: String(alarmData.id || alarmData.alarmId || Date.now()),
        type: alarmData.type || alarmData.alarmType || "GENERAL",
        boxId: alarmData.boxId || alarmData.box_id,
        location: alarmData.location || (alarmData.boxId && this.boxesMap[alarmData.boxId]) || "알 수 없는 위치",
        timestamp: alarmData.timestamp || alarmData.createdAt || new Date().toISOString(),
        message: alarmData.message,
        priority: alarmData.type === "fire" || alarmData.type === "FIRE" ? 1 : alarmData.priority || 3,
        source: "api", // API에서 가져온 알람 표시
        originalData: alarmData, // 원본 데이터 보존
      }

      normalizedAlarms.push(normalizedAlarm)

      // 화재 알람인 경우 화재 알람 배열에도 추가
      if (normalizedAlarm.type === "fire" || normalizedAlarm.type === "FIRE") {
        normalizedFireAlarms.push(normalizedAlarm)
      }
    })

    this.alarms = normalizedAlarms
    this.fireAlarms = normalizedFireAlarms

    console.log("✅ API 알람 설정 완료:", normalizedAlarms.length, "건")
    this.notifyListeners()
  },

  // SSE 알람 처리 - 같은 ID가 있으면 업데이트, 없으면 추가, 확정 상태면 제거
  updateOrAddSSEAlarm: function (sseAlarm) {
    const sseAlarmId = this.extractAlarmId(sseAlarm)

    console.log("📨 SSE 알람 처리:", sseAlarmId, "타입:", sseAlarm.type)

    // 확정 상태 알람들 - 해당 알람을 제거해야 함
    const confirmedTypes = ["INSTALL_CONFIRMED", "REMOVE_CONFIRMED", "COLLECTION_CONFIRMED", "FIRE_CONFIRMED"]

    if (confirmedTypes.includes(sseAlarm.type)) {
      console.log("✅ 확정 상태 알람 - 기존 알람 제거:", sseAlarmId)

      // 일반 알람에서 제거
      this.alarms = this.alarms.filter((alarm) => this.extractAlarmId(alarm) !== sseAlarmId)

      // 화재 알람에서도 제거
      this.fireAlarms = this.fireAlarms.filter((alarm) => this.extractAlarmId(alarm) !== sseAlarmId)

      this.notifyListeners()
      return
    }

    // boxId가 있으면 boxesMap에서 해당 박스 이름 찾기
    if (sseAlarm.boxId && this.boxesMap[sseAlarm.boxId]) {
      sseAlarm.location = this.boxesMap[sseAlarm.boxId]
    }

    const normalizedSSEAlarm = {
      id: sseAlarmId,
      type: sseAlarm.type || "GENERAL",
      boxId: sseAlarm.boxId,
      location: sseAlarm.location || "알 수 없는 위치",
      timestamp: sseAlarm.timestamp || new Date().toISOString(),
      message: sseAlarm.message,
      priority: sseAlarm.type === "fire" || sseAlarm.type === "FIRE" ? 1 : sseAlarm.priority || 3,
      source: "sse", // SSE에서 받은 알람 표시
      originalData: sseAlarm, // 원본 데이터 보존
    }

    // 기존 알람에서 같은 ID 찾기
    const existingAlarmIndex = this.alarms.findIndex((alarm) => this.extractAlarmId(alarm) === sseAlarmId)

    if (existingAlarmIndex !== -1) {
      // 기존 알람 업데이트
      console.log("🔄 기존 알람 업데이트:", sseAlarmId)
      this.alarms[existingAlarmIndex] = normalizedSSEAlarm
    } else {
      // 새 알람 추가
      console.log("➕ 새 SSE 알람 추가:", sseAlarmId)
      this.alarms.push(normalizedSSEAlarm)
    }

    // 화재 알람 처리
    const existingFireAlarmIndex = this.fireAlarms.findIndex((alarm) => this.extractAlarmId(alarm) === sseAlarmId)

    if (normalizedSSEAlarm.type === "fire" || normalizedSSEAlarm.type === "FIRE") {
      if (existingFireAlarmIndex !== -1) {
        // 기존 화재 알람 업데이트
        this.fireAlarms[existingFireAlarmIndex] = normalizedSSEAlarm
      } else {
        // 새 화재 알람 추가
        this.fireAlarms.push(normalizedSSEAlarm)
      }
    } else {
      // 화재가 아닌 알람이면 화재 알람 배열에서 제거
      if (existingFireAlarmIndex !== -1) {
        this.fireAlarms.splice(existingFireAlarmIndex, 1)
      }
    }

    this.notifyListeners()
  },

  // 알람 추가 함수 (SSE용) - 기존 함수와의 호환성 유지
  addAlarm: function (alarm) {
    this.updateOrAddSSEAlarm(alarm)
  },

  addFireAlarm: function (alarm) {
    this.updateOrAddSSEAlarm(alarm)
  },

  // 리스너 관리
  subscribe: function (listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  },

  notifyListeners: function () {
    this.listeners.forEach((listener) => listener())
  },
}

function App() {
  const [isSSEConnected, setIsSSEConnected] = useState(false)
  const [boxesLoaded, setBoxesLoaded] = useState(false)

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const kakaoScript = document.createElement("script")
    kakaoScript.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_KEY}&autoload=false&libraries=services`
    kakaoScript.async = true

    kakaoScript.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log("✅ Kakao Maps SDK 로드 완료")
        })
      }
    }

    document.head.appendChild(kakaoScript)

    return () => {
      if (document.head.contains(kakaoScript)) {
        document.head.removeChild(kakaoScript)
      }
    }
  }, [])

  // 박스 정보 가져오기
  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        console.log("📦 박스 정보 로드 시작...")
        const boxes = await findAllBox()
        const newBoxesMap = {}
        boxes.forEach((box) => {
          newBoxesMap[box.id] = box.name
        })
        window.alarmState.setBoxesMap(newBoxesMap)
        setBoxesLoaded(true)
        console.log("✅ 박스 정보 로드 완료:", Object.keys(newBoxesMap).length, "개")
      } catch (error) {
        console.error("❌ 박스 정보 불러오기 실패:", error)
        setBoxesLoaded(true) // 실패해도 다음 단계로 진행
      }
    }

    fetchBoxes()
  }, [])

  // SSE 연결 - 한 번만 실행됨
  useEffect(() => {
    const eventSource = new EventSource(`${process.env.REACT_APP_API_BASE_URL}/SSEsubscribe`, {
      withCredentials: true,
    })

    console.log("🔗 SSE 구독 시작", eventSource)

    eventSource.onopen = () => {
      console.log("✅ SSE 연결 성공")
      setIsSSEConnected(true)
    }

    eventSource.addEventListener("alarm", (event) => {
      try {
        console.log("📨 SSE 메시지 수신:", event.data)
        const alarmData = JSON.parse(event.data)

        // 알람 타입에 따른 처리
        if (alarmData.type === "NEW_USER_REQUEST") {
          // 신규 가입자 요청 알람은 처리하지 않음
          return
        } else {
          // 모든 알람을 updateOrAddSSEAlarm으로 처리
          window.alarmState.updateOrAddSSEAlarm(alarmData)

          // 화재 발생 시 즉시 화재 상태 확인
          if (alarmData.type === "fire") {
            findAllBox()
                .then((boxes) => {
                  const fireBoxes = boxes.filter(
                      (box) => box.fire_status1 === "FIRE" || box.fire_status2 === "FIRE" || box.fire_status3 === "FIRE",
                  )
                  console.log("🔥 화재 발생 수거함:", fireBoxes)
                })
                .catch((error) => {
                  console.error("❌ 화재 상태 확인 실패:", error)
                })
          }
        }
      } catch (error) {
        console.error("❌ SSE 데이터 파싱 에러:", error, "원본 데이터:", event.data)
      }
    })

    eventSource.onerror = (error) => {
      console.error("❌ SSE Error:", error)
      setIsSSEConnected(false)

      // 5초 후 재연결 시도
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log("🔄 SSE 재연결 시도...")
          // 컴포넌트가 다시 마운트되면서 재연결됨
        }
      }, 5000)
    }

    return () => {
      console.log("🔌 SSE 연결 종료")
      setIsSSEConnected(false)
      eventSource.close()
    }
  }, []) // 빈 의존성 배열로 한 번만 실행

  return (
      <div>
        <RouterProvider router={root} />
      </div>
  )
}

export default App