import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"; // ✅ userSlice 추가
import boxLogReducer from "./slices/boxLogSlice";

const store = configureStore({
    reducer: {
        users: userReducer,
        boxLog: boxLogReducer,
    },
});

export default store;