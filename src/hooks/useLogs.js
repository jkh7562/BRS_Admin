import { useState } from "react";
import { useSelector } from "react-redux";

const useLogs = () => {
    const users = useSelector(state => state.users.users);
    const collectors = useSelector(state => state.users.collectors);
    const boxLogs = useSelector(state => state.boxLog.logs);
    const boxes = useSelector(state => state.boxes.list);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBox, setSelectedBox] = useState(null);

    // ✅ 수거함 검색 필터링
    const filteredBoxes = boxes.filter(box =>
        box.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ 선택된 박스에 대한 로그 필터링
    const filteredLogs = selectedBox
        ? boxLogs.filter(log => log.boxLogId?.boxId === selectedBox.id)
        : [];

    // ✅ 배출 로그와 수거 로그로 분리 (이름 대신 `id` 표시)
    const disposalLogs = filteredLogs
        .filter(log => log.type === 1)
        .map(log => ({
            ...log,
            userId: log.boxLogId?.userId || "알 수 없음",
        }));

    const collectionLogs = filteredLogs
        .filter(log => log.type === 0)
        .map(log => ({
            ...log,
            collectorId: log.boxLogId?.userId || "알 수 없음",
        }));

    return {
        searchTerm,
        setSearchTerm,
        selectedBox,
        setSelectedBox,
        filteredBoxes,
        disposalLogs,
        collectionLogs,
    };
};

export default useLogs;
