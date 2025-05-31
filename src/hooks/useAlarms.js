"use client"

import { useState, useEffect } from "react"

// 간단한 커스텀 훅 - 전역 알람 상태 구독
export const useAlarms = () => {
    const [alarms, setAlarms] = useState(window.alarmState?.alarms || [])
    const [fireAlarms, setFireAlarms] = useState(window.alarmState?.fireAlarms || [])

    useEffect(() => {
        // 전역 상태 변화 구독
        const unsubscribe = window.alarmState?.subscribe(() => {
            setAlarms([...window.alarmState.alarms])
            setFireAlarms([...window.alarmState.fireAlarms])
        })

        // 초기 상태 설정
        if (window.alarmState) {
            setAlarms([...window.alarmState.alarms])
            setFireAlarms([...window.alarmState.fireAlarms])
        }

        return unsubscribe
    }, [])

    return {
        alarms,
        fireAlarms,
        boxesMap: window.alarmState?.boxesMap || {},
        addAlarm: window.alarmState?.addAlarm.bind(window.alarmState),
        addFireAlarm: window.alarmState?.addFireAlarm.bind(window.alarmState),
    }
}
