import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getBoxLog } from "../api/apiServices";

// ✅ 비동기 액션 (수거 및 분리량 데이터 가져오기)
export const fetchBoxLog = createAsyncThunk("boxLog/fetchBoxLog", async (_, { rejectWithValue }) => {
    try {
        const response = await getBoxLog();
        if (!response) throw new Error("수거 및 분리량 데이터를 가져올 수 없습니다.");
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const boxLogSlice = createSlice({
    name: "boxLog",
    initialState: {
        logs: [],
        status: "idle", // "idle" | "loading" | "succeeded" | "failed"
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoxLog.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchBoxLog.fulfilled, (state, action) => {
                console.log("📌 Redux Thunk - boxLog 데이터:", action.payload);
                state.status = "succeeded";
                state.logs = action.payload;
            })
            .addCase(fetchBoxLog.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
                console.error("🚨 Redux fetchBoxLog 오류:", action.payload);
            });
    },
});

// ✅ 리듀서 내보내기
export default boxLogSlice.reducer;
