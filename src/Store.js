import { configureStore } from "@reduxjs/toolkit";
import sellerSliceReducer from "./Components/ProductApi"
import homeSliceReducer from "./Components/HomeApi"
import textSliceReducer from "./Components/Customer"
import userSliceReducer from "./Components/Userpost"
import messageSliceReducer from "./Components/Usertext"
import messagingSliceReducer from "./Components/Text"
import OrderSliceReducer from "./Components/OrderApi"
import orderproductSlice from "./Components/GetordersApi"
import shippingSliceReducer from "./Components/Shipping"
import ordershippingSliceReducer  from "./Components/OrderShipping";
import getshippingSliceReducer from "./Components/GetShipping"
import orderInfoReducer from "./Components/Getorderinfo"
export const Store = configureStore({
    reducer:{
        seller:sellerSliceReducer,
        home:homeSliceReducer,
        text:textSliceReducer,
        user:userSliceReducer,
        message:messageSliceReducer,
        messaging:messagingSliceReducer,
        order:OrderSliceReducer,
        shipping:shippingSliceReducer,
        orderproduct:orderproductSlice,
        shippingOrder:ordershippingSliceReducer,
        getshipping:getshippingSliceReducer,
        getorderInfo:orderInfoReducer
        
    }
})