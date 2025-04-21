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
const OrderHistoryPage = lazy(() => import('../pages/OrderHistoryPage'))
const BoxAddRemovePage = lazy(() => import('../pages/BoxAddRemovePage'))
const CollectorAssignmentPage = lazy(() => import('../pages/CollectorAssignmentPage'))
const BoxControlLogPage = lazy(() => import('../pages/BoxControlLogPage'))
const MonitoringPage = lazy(() => import('../pages/MonitoringPage'))

const N_LoginPage = lazy(() => import('../pages/NewPage/N_loginPage'))
const N_MainPage = lazy(() => import('../pages/NewPage/N_mainPage'))
const N_BoxAddRemovePage = lazy(() => import('../pages/NewPage/N_boxAddRemovePage'))
const N_BoxControlLogPage = lazy(() => import('../pages/NewPage/N_boxControlLogPage'))
const N_collectorAssignmentPage = lazy(() => import('../pages/NewPage/N_collectorAssignmentPage'))
const N_MonitoringPage = lazy(() => import('../pages/NewPage/N_MonitoringPage'))

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
    },
    {
        path:"orderHistoryPage",
        element:<Suspense fallback={Loading}><OrderHistoryPage/></Suspense>
    },
    {
        path:"boxAddRemovePage",
        element:<Suspense fallback={Loading}><BoxAddRemovePage/></Suspense>
    },
    {
        path:"collectorAssignmentPage",
        element:<Suspense fallback={Loading}><CollectorAssignmentPage/></Suspense>
    },
    {
        path:"boxControlLogPage",
        element:<Suspense fallback={Loading}><BoxControlLogPage/></Suspense>
    },
    {
        path:"monitoringPage",
        element:<Suspense fallback={Loading}><MonitoringPage/></Suspense>
    },
    {
        path:"n_LoginPage",
        element:<Suspense fallback={Loading}><N_LoginPage/></Suspense>
    },
    {
        path:"n_MainPage",
        element:<Suspense fallback={Loading}><N_MainPage/></Suspense>
    },
    {
        path:"n_BoxAddRemovePage",
        element:<Suspense fallback={Loading}><N_BoxAddRemovePage/></Suspense>
    },
    {
        path:"n_BoxControlLogPage",
        element:<Suspense fallback={Loading}><N_BoxControlLogPage/></Suspense>
    },
    {
        path:"n_collectorAssignmentPage",
        element:<Suspense fallback={Loading}><N_collectorAssignmentPage/></Suspense>
    },
    {
        path:"n_MonitoringPage",
        element:<Suspense fallback={Loading}><N_MonitoringPage/></Suspense>
    }
]);
export default root;