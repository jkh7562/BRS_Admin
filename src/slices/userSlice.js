import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { findUserAll } from "../api/apiServices"; // ✅ API 요청 함수

// ✅ 비동기 액션 (사용자 데이터 가져오기)
export const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, { rejectWithValue }) => {
    try {
        const response = await findUserAll();
        console.log("📌 Redux Thunk - API 응답 데이터:", response);
        return response || []; // ✅ undefined 방지
    } catch (error) {
        console.error("🚨 Redux Thunk - API 요청 실패:", error);
        return rejectWithValue(error.message); // Redux에서 rejected 처리
    }
});

const userSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        collectors: [],
        status: "idle",
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                console.log("📌 Redux fetchUsers.fulfilled 실행됨, payload:", action.payload);

                if (Array.isArray(action.payload)) {
                    console.log("📌 API 응답 데이터 확인:", action.payload);

                    // ✅ 일반 사용자(`ROLE_USER`)만 users에 저장
                    state.users = action.payload.filter(user => !user.id.includes("수거자"));

                    // ✅ 수거자(`ROLE_EMPLOYEE`)만 collectors에 저장
                    state.collectors = action.payload.filter(user => user.id.includes("수거자"));

                    console.log("📌 Redux 업데이트 후 users 상태:", state.users);
                    console.log("📌 Redux 업데이트 후 collectors 상태:", state.collectors);
                } else {
                    console.error("🚨 Redux fetchUsers 오류 - payload가 배열이 아님:", action.payload);
                }

                state.status = "succeeded";
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
                console.error("🚨 Redux fetchUsers 오류:", action.payload);
            });
    }
});

export default userSlice.reducer;
