import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMyInfo } from "../api/apiServices"; // ✅ API 함수 변경 (fetchMyInfo → getMyInfo)

// ✅ 비동기 액션 (내 정보 조회)
export const fetchMyInfo = createAsyncThunk(
    "myInfo/fetchMyInfo",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getMyInfo(); // ✅ API 호출 함수 변경
            return response; // 받아온 데이터 반환
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const myInfoSlice = createSlice({
    name: "myInfo",
    initialState: {
        data: null, // ✅ 내 정보 데이터 저장
        status: "idle", // ✅ "idle" | "loading" | "succeeded" | "failed"
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyInfo.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchMyInfo.fulfilled, (state, action) => {
                console.log("👤 Redux Thunk - 내 정보:", action.payload);
                state.status = "succeeded";
                state.data = action.payload; // ✅ 내 정보 저장
            })
            .addCase(fetchMyInfo.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
                console.error("🚨 Redux fetchMyInfo 오류:", action.payload);
            });
    },
});

// ✅ 리듀서 내보내기
export default myInfoSlice.reducer;
