import { useEffect, useState } from "react";
import { findAllBox } from "../api/apiServices"; // ✅ Named export 가져오기

const useBoxes = () => {
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBoxes = async () => {
            try {
                const data = await findAllBox(); // ✅ API 호출

                // ✅ 좌표 데이터 로그 확인
                console.log("📌 박스 데이터:", data);

                // ✅ 좌표값 변환 및 필터링
                const processedData = data.map(box => {
                    const coords = box.location.match(/POINT\s?\(([^)]+)\)/);
                    if (coords) {
                        const [lng, lat] = coords[1].split(" ").map(Number);
                        return { id: box.id, name: box.name, lat, lng };
                    }
                    return null;
                }).filter(Boolean);

                setBoxes(processedData);
            } catch (err) {
                console.error("🚨 박스 데이터 조회 실패:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBoxes();
    }, []);

    return { boxes, loading, error };
};

export default useBoxes;
