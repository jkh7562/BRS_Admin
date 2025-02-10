import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBoxes } from "../slices/boxSlice"; // ✅ Redux 슬라이스 가져오기

const useBoxes = () => {
    const dispatch = useDispatch();

    // ✅ Redux 상태에서 박스 데이터 가져오기
    const { list: boxes, status, error } = useSelector(state => state.boxes);

    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchBoxes()); // ✅ Redux Thunk 호출 (박스 데이터 가져오기)
        }
    }, [status, dispatch]);

    // ✅ 데이터 로딩 상태 반환
    const loading = status === "loading";

    // ✅ 좌표 데이터 변환
    const processedData = boxes.map(box => {
        const coords = box.location.match(/POINT\s?\(([^)]+)\)/);
        if (coords) {
            const [lng, lat] = coords[1].split(" ").map(Number);
            return { id: box.id, name: box.name, lat, lng };
        }
        return null;
    }).filter(Boolean);

    return { boxes: processedData, loading, error };
};

export default useBoxes;
