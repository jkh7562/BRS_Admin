import { useEffect, useState } from "react"
import { RouterProvider } from "react-router-dom"
import root from "./router/root"
import { findAllBox } from "./api/apiServices"

// 전역 알람 상태 관리를 위한 간단한 객체
window.alarmState = {
  alarms: [],
  fireAlarms: [],
  boxesMap: {},
  listeners: new Set(),

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

  // 알람 추가 함수
  addAlarm: function (alarm) {
    // 고유 ID와 읽음 상태 추가
    const newAlarm = {
      ...alarm,
      id: alarm.id || `${alarm.type}-${Date.now()}-${Math.random()}`,
      isRead: false,
      timestamp: alarm.timestamp || new Date().toISOString(),
    }
    this.alarms = [...this.alarms, newAlarm]
    this.notifyListeners()
  },

  addFireAlarm: function (alarm) {
    // 고유 ID와 읽음 상태 추가
    const newAlarm = {
      ...alarm,
      id: alarm.id || `fire-${Date.now()}-${Math.random()}`,
      isRead: false,
      timestamp: alarm.timestamp || new Date().toISOString(),
    }
    this.fireAlarms = [...this.fireAlarms, newAlarm]
    this.alarms = [...this.alarms, newAlarm]
    this.notifyListeners()
  },

  // 개별 알람 읽음 처리
  markAlarmAsRead: function (alarmId) {
    this.alarms = this.alarms.map((alarm) => (alarm.id === alarmId ? { ...alarm, isRead: true } : alarm))
    this.fireAlarms = this.fireAlarms.map((alarm) => (alarm.id === alarmId ? { ...alarm, isRead: true } : alarm))
    this.notifyListeners()
  },

  // 모든 알람 읽음 처리
  markAllAlarmsAsRead: function () {
    this.alarms = this.alarms.map((alarm) => ({ ...alarm, isRead: true }))
    this.fireAlarms = this.fireAlarms.map((alarm) => ({ ...alarm, isRead: true }))
    this.notifyListeners()
  },

  // 읽지 않은 알람만 가져오기
  getUnreadAlarms: function () {
    return this.alarms.filter((alarm) => !alarm.isRead)
  },

  getUnreadFireAlarms: function () {
    return this.fireAlarms.filter((alarm) => !alarm.isRead)
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
        const boxes = await findAllBox()
        const newBoxesMap = {}
        boxes.forEach((box) => {
          newBoxesMap[box.id] = box.name
        })
        window.alarmState.setBoxesMap(newBoxesMap)
        console.log("📦 박스 정보 로드 완료:", Object.keys(newBoxesMap).length, "개")
      } catch (error) {
        console.error("❌ 박스 정보 불러오기 실패:", error)
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
        console.log("📨 SSE 메시지 수신:", event.event)
        const alarmData = JSON.parse(event.data)

        // boxId가 있으면 boxesMap에서 해당 박스 이름 찾기
        if (alarmData.boxId && window.alarmState.boxesMap[alarmData.boxId]) {
          alarmData.location = window.alarmState.boxesMap[alarmData.boxId]
        }

        // 알람 타입에 따른 처리
        if (alarmData.type === "NEW_USER_REQUEST") {
          // 신규 가입자 요청 알람은 처리하지 않음
          return
        } else if (alarmData.type === "fire") {
          // 화재 알람은 최우선 순위로 설정
          alarmData.priority = 1
          window.alarmState.addFireAlarm(alarmData)

          // 화재 발생 시 즉시 화재 상태 확인
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
        } else {
          // 기타 알람은 낮은 우선순위로 설정
          alarmData.priority = 3
          window.alarmState.addAlarm(alarmData)
        }
      } catch (error) {
        console.error("❌ SSE 데이터 파싱 에러:", error)
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