import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"; // ✅ userSlice 추가

const store = configureStore({
    reducer: {
        users: userReducer,
    },
});

export default store;