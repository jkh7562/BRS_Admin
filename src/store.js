import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import boxLogReducer from "./slices/boxLogSlice";
import boxReducer from "./slices/boxSlice";
import myInfoReducer from "./slices/myInfoSlice";

const store = configureStore({
    reducer: {
        users: userReducer,
        boxLog: boxLogReducer,
        boxes: boxReducer,
        myInfo: myInfoReducer,
    },
});

export default store;