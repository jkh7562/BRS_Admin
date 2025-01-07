import {Suspense, lazy} from 'react'

const {createBrowserRouter} = require("react-router-dom");

const Loading = <div>Loaging....</div>
const LoginPage = lazy(() => import('../pages/LoginPage'))
const SignupPage = lazy(() => import('../pages/SignupPage'))
const FindIdPage = lazy(() => import('../pages/FindIdPage'))
const FindPasswordPage = lazy(() => import('../pages/FindPasswordPage'))
const MainPage = lazy(() => import('../pages/MainPage'))

const root = createBrowserRouter([
    {
        path:"",
        element:<Suspense fallback={Loading}><LoginPage/></Suspense>
    },
    {
        path:"signup",
        element:<Suspense fallback={Loading}><SignupPage/></Suspense>
    },
    {
        path:"findid",
        element:<Suspense fallback={Loading}><FindIdPage/></Suspense>
    },
    {
        path:"findpassword",
        element:<Suspense fallback={Loading}><FindPasswordPage/></Suspense>
    },
    {
        path:"main",
        element:<Suspense fallback={Loading}><MainPage/></Suspense>
    }
]);
export default root;