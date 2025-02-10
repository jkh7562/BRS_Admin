import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../slices/userSlice"; // ✅ Redux에서 데이터 가져오기

const useUsers = () => {
    const dispatch = useDispatch();

    // ✅ Redux에서 상태 가져오기
    const users = useSelector(state => state.users.users);
    const collectors = useSelector(state => state.users.collectors);
    const status = useSelector(state => state.users.status);

    useEffect(() => {
        if (status === "idle") {
            console.log("📌 Redux 상태가 idle -> fetchUsers 실행");
            dispatch(fetchUsers());
        }
    }, [status, dispatch]);

    useEffect(() => {
        console.log("✅ Redux 업데이트 후 users:", users);
        console.log("✅ Redux 업데이트 후 collectors:", collectors);
    }, [users, collectors]);

    return { users, collectors, status };
};

export default useUsers;
