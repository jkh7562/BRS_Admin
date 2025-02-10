import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"; // ✅ userSlice 추가
import boxLogReducer from "./slices/boxLogSlice";
import boxReducer from "./slices/boxSlice";

const store = configureStore({
    reducer: {
        users: userReducer,
        boxLog: boxLogReducer,
        boxes: boxReducer,
    },
});

export default store;