import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBoxes } from "../slices/boxSlice";

const getStatusText = (installStatus) => {
    switch (installStatus) {
        case "INSTALL_REQUEST":
            return "설치 요청 중";
        case "INSTALL_IN_PROGRESS":
            return "설치 진행 중";
        case "INSTALL_COMPLETED":
            return "설치 완료";
        case "INSTALL_CONFIRMED":
            return "설치 확정";
        case "REMOVE_REQUEST":
            return "제거 요청 중";
        case "REMOVE_IN_PROGRESS":
            return "제거 진행 중";
        case "REMOVE_COMPLETED":
            return "제거 완료";
        case "REMOVE_CONFIRMED":
            return "제거 확정";
        default:
            return installStatus; // 예외처리 (알 수 없는 값은 그대로)
    }
};

const useBoxes = () => {
    const dispatch = useDispatch();
    const { list: boxes, status, error } = useSelector(state => state.boxes);

    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchBoxes());
        }
    }, [status, dispatch]);

    const loading = status === "loading";

    const processedData = boxes.map(box => {
        const coords = box.location.match(/POINT\s?\(([^)]+)\)/);
        if (coords) {
            const [lng, lat] = coords[1].split(" ").map(Number);
            return {
                id: box.id,
                name: box.name,
                lat,
                lng,
                installStatus: box.installStatus,
                statusText: getStatusText(box.installStatus) // ✅ 상태 텍스트 추가
            };
        }
        return null;
    }).filter(Boolean);

    return { boxes: processedData, loading, error };
};

export default useBoxes;
