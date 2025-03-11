import {Suspense, lazy} from 'react'

const {createBrowserRouter} = require("react-router-dom");

const Loading = <div>Loaging....</div>
const LoginPage = lazy(() => import('../pages/LoginPage'))
const SignupPage = lazy(() => import('../pages/SignupPage'))
const FindIdPage = lazy(() => import('../pages/FindIdPage'))
const FindPasswordPage = lazy(() => import('../pages/FindPasswordPage'))
const MainPage = lazy(() => import('../pages/MainPage'))
const CollectorPage = lazy(() => import('../pages/CollectorPage'))
const UserPage = lazy(() => import('../pages/UserPage'))
const ControlPage = lazy(() => import('../pages/ControlPage'))
const LogPage = lazy(() => import('../pages/LogPage'))
const UserApprovalPage = lazy(() => import('../pages/UserApprovalPage'))

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
    },
    {
        path:"collector/:id",
        element:<Suspense fallback={Loading}><CollectorPage/></Suspense>
    },
    {
        path:"user/:id",
        element:<Suspense fallback={Loading}><UserPage/></Suspense>
    },
    {
        path:"control",
        element:<Suspense fallback={Loading}><ControlPage/></Suspense>
    },
    {
        path:"log",
        element:<Suspense fallback={Loading}><LogPage/></Suspense>
    },
    {
        path:"userApprovalPage",
        element:<Suspense fallback={Loading}><UserApprovalPage/></Suspense>
    }
]);
export default root;