import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { findAllBox } from "../api/apiServices"; // API 호출 함수

// ✅ 비동기 액션 (박스 데이터 조회)
export const fetchBoxes = createAsyncThunk(
    "boxes/fetchBoxes",
    async (_, { rejectWithValue }) => {
        try {
            const response = await findAllBox();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const boxSlice = createSlice({
    name: "boxes",
    initialState: {
        list: [], // ✅ 박스 데이터 배열
        status: "idle", // ✅ "idle" | "loading" | "succeeded" | "failed"
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoxes.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchBoxes.fulfilled, (state, action) => {
                console.log("📦 Redux Thunk - 박스 데이터:", action.payload);
                state.status = "succeeded";
                state.list = action.payload; // ✅ 박스 데이터 저장
            })
            .addCase(fetchBoxes.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
                console.error("🚨 Redux fetchBoxes 오류:", action.payload);
            });
    },
});

// ✅ 리듀서 내보내기
export default boxSlice.reducer;
