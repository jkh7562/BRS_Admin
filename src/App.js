"use client"

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
  // 로컬 스토리지 키
  storageKey: "sse_alarms",

  // 원본 알람 ID 추출 함수 (접두사 제거)
  extractOriginalId: (alarmId) => {
    const idString = String(alarmId) // 숫자를 문자열로 변환

    // api_alarm_ 접두사 제거
    if (idString.startsWith("api_alarm_")) {
      return idString.replace("api_alarm_", "").split("_")[0]
    }

    // sse_ 접두사 제거
    if (idString.startsWith("sse_")) {
      return idString.replace("sse_", "").split("-")[0]
    }

    return idString
  },

  // SSE 알람과 중복되는 API 알람 제거
  removeDuplicateAPIAlarms: function (newAPIAlarms) {
    const sseAlarmIds = this.alarms
        .filter((alarm) => alarm.source === "sse")
        .map((alarm) => this.extractOriginalId(alarm.id))

    const sseFireAlarmIds = this.fireAlarms
        .filter((alarm) => alarm.source === "sse")
        .map((alarm) => this.extractOriginalId(alarm.id))

    return newAPIAlarms.filter((apiAlarm) => {
      const originalId = this.extractOriginalId(apiAlarm.id || apiAlarm.alarmId)
      const isDuplicate = sseAlarmIds.includes(originalId) || sseFireAlarmIds.includes(originalId)

      if (isDuplicate) {
        console.log(`🔄 SSE 알람과 중복되는 API 알람 제거: ${originalId}`)
      }

      return !isDuplicate
    })
  },

  // 기존 API 알람 중 SSE 알람과 중복되는 것 제거
  removeConflictingAPIAlarms: function (sseAlarmId) {
    const originalId = this.extractOriginalId(sseAlarmId)

    // 일반 알람에서 중복 제거
    const filteredAlarms = this.alarms.filter((alarm) => {
      if (alarm.source === "api") {
        const alarmOriginalId = this.extractOriginalId(alarm.id)
        if (alarmOriginalId === originalId) {
          console.log(`🔄 SSE 알람으로 인한 API 알람 제거: ${alarm.id}`)
          return false
        }
      }
      return true
    })

    // 화재 알람에서 중복 제거
    const filteredFireAlarms = this.fireAlarms.filter((alarm) => {
      if (alarm.source === "api") {
        const alarmOriginalId = this.extractOriginalId(alarm.id)
        if (alarmOriginalId === originalId) {
          console.log(`🔄 SSE 화재 알람으로 인한 API 알람 제거: ${alarm.id}`)
          return false
        }
      }
      return true
    })

    this.alarms = filteredAlarms
    this.fireAlarms = filteredFireAlarms
  },

  // 상태 업데이트 함수
  setAlarms: function (newAlarms) {
    this.alarms = newAlarms
    this.saveSSEAlarmsToStorage()
    this.notifyListeners()
  },

  setFireAlarms: function (newFireAlarms) {
    this.fireAlarms = newFireAlarms
    this.saveSSEAlarmsToStorage()
    this.notifyListeners()
  },

  setBoxesMap: function (newBoxesMap) {
    this.boxesMap = newBoxesMap
  },

  // SSE 알람만 로컬 스토리지에 저장
  saveSSEAlarmsToStorage: function () {
    try {
      // API로 가져온 알람(api_alarm_ 접두사)은 저장하지 않음
      const sseAlarms = this.alarms.filter((alarm) => !String(alarm.id).startsWith("api_alarm_"))
      const sseFireAlarms = this.fireAlarms.filter((alarm) => !String(alarm.id).startsWith("api_alarm_"))

      localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            alarms: sseAlarms,
            fireAlarms: sseFireAlarms,
            timestamp: new Date().toISOString(),
          }),
      )
      console.log("💾 SSE 알람 저장 완료:", sseAlarms.length, "건")
    } catch (error) {
      console.error("❌ 알람 저장 실패:", error)
    }
  },

  // 로컬 스토리지에서 SSE 알람 불러오기
  loadSSEAlarmsFromStorage: function () {
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        // API 알람은 제외하고 SSE 알람만 복원
        this.alarms = data.alarms || []
        this.fireAlarms = data.fireAlarms || []
        console.log("📂 SSE 알람 복원 완료:", this.alarms.length, "건")
        this.notifyListeners()
        return true
      }
      return false
    } catch (error) {
      console.error("❌ 알람 복원 실패:", error)
      return false
    }
  },

  // API에서 가져온 알람 추가 (로컬 스토리지에 저장하지 않음)
  setAPIAlarms: function (apiAlarms) {
    if (!apiAlarms || !Array.isArray(apiAlarms)) return

    console.log("🔄 API 알람 설정 시작:", apiAlarms.length, "건")

    // 기존 API 알람 제거
    this.alarms = this.alarms.filter((alarm) => !alarm.id.startsWith("api_alarm_"))
    this.fireAlarms = this.fireAlarms.filter((alarm) => !alarm.id.startsWith("api_alarm_"))

    // SSE 알람과 중복되는 API 알람 제거
    const filteredAPIAlarms = this.removeDuplicateAPIAlarms(apiAlarms)

    // 새 API 알람 추가
    filteredAPIAlarms.forEach((alarmData) => {
      const normalizedAlarm = {
        id: `api_alarm_${alarmData.id || alarmData.type || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: alarmData.type || alarmData.alarmType || "GENERAL",
        boxId: alarmData.boxId || alarmData.box_id,
        location: alarmData.location || (alarmData.boxId && this.boxesMap[alarmData.boxId]) || "알 수 없는 위치",
        timestamp: alarmData.timestamp || alarmData.createdAt || new Date().toISOString(),
        message: alarmData.message,
        priority: alarmData.type === "fire" || alarmData.type === "FIRE" ? 1 : alarmData.priority || 3,
        source: "api", // API에서 가져온 알람 표시
        originalId: alarmData.id || alarmData.alarmId, // 원본 ID 저장
      }

      // 화재 알람인 경우 화재 알람으로 추가
      if (normalizedAlarm.type === "fire" || normalizedAlarm.type === "FIRE") {
        this.fireAlarms.push(normalizedAlarm)
        this.alarms.push(normalizedAlarm)
      } else {
        // 기타 알람은 일반 알람으로 추가
        this.alarms.push(normalizedAlarm)
      }
    })

    console.log("✅ API 알람 설정 완료:", filteredAPIAlarms.length, "건 (중복 제거 후)")
    this.notifyListeners() // 리스너에게 알림
  },

  // 알람 추가 함수 - 중복 방지 로직 추가 (SSE 알람용)
  addAlarm: function (alarm) {
    // 중복 체크: 같은 ID의 알람이 이미 존재하는지 확인
    const existingAlarm = this.alarms.find((existingAlarm) => String(existingAlarm.id) === String(alarm.id))
    if (existingAlarm) {
      console.log("⚠️ 중복 알람 감지, 추가하지 않음:", alarm.id)
      return
    }

    // 고유 ID 추가 - 원본 ID가 숫자면 문자열로 변환
    const newAlarm = {
      ...alarm,
      id: alarm.id || `sse_${alarm.type}-${Date.now()}-${Math.random()}`,
      timestamp: alarm.timestamp || new Date().toISOString(),
      source: "sse", // SSE에서 받은 알람 표시
      originalId: String(alarm.id || alarm.alarmId), // 원본 ID를 문자열로 저장
    }

    // 기존 API 알람 중 같은 원본 ID를 가진 것 제거
    this.removeConflictingAPIAlarms(newAlarm.id)

    this.alarms = [...this.alarms, newAlarm]
    this.saveSSEAlarmsToStorage()
    this.notifyListeners()

    console.log("✅ SSE 알람 추가 완료:", newAlarm.id)
  },

  addFireAlarm: function (alarm) {
    // 중복 체크: 같은 ID의 알람이 이미 존재하는지 확인
    const existingFireAlarm = this.fireAlarms.find((existingAlarm) => String(existingAlarm.id) === String(alarm.id))
    const existingAlarm = this.alarms.find((existingAlarm) => String(existingAlarm.id) === String(alarm.id))

    if (existingFireAlarm || existingAlarm) {
      console.log("⚠️ 중복 화재 알람 감지, 추가하지 않음:", alarm.id)
      return
    }

    // 고유 ID 추가 - 원본 ID가 숫자면 문자열로 변환
    const newAlarm = {
      ...alarm,
      id: alarm.id || `sse_fire-${Date.now()}-${Math.random()}`,
      timestamp: alarm.timestamp || new Date().toISOString(),
      source: "sse", // SSE에서 받은 알람 표시
      originalId: String(alarm.id || alarm.alarmId), // 원본 ID를 문자열로 저장
    }

    // 기존 API 알람 중 같은 원본 ID를 가진 것 제거
    this.removeConflictingAPIAlarms(newAlarm.id)

    this.fireAlarms = [...this.fireAlarms, newAlarm]
    this.alarms = [...this.alarms, newAlarm]
    this.saveSSEAlarmsToStorage()
    this.notifyListeners()

    console.log("✅ SSE 화재 알람 추가 완료:", newAlarm.id)
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

  // 앱 시작 시 로컬 스토리지에서 SSE 알람 복원
  useEffect(() => {
    console.log("🔄 저장된 SSE 알람 복원 시작...")
    window.alarmState.loadSSEAlarmsFromStorage()
  }, [])

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
