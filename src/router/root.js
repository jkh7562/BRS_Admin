import { Suspense, lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';

const { createBrowserRouter } = require("react-router-dom");

const Loading = <div>Loading....</div>;

const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const FindIdPage = lazy(() => import('../pages/FindIdPage'));
const FindPasswordPage = lazy(() => import('../pages/FindPasswordPage'));
const MainPage = lazy(() => import('../pages/MainPage'));
const CollectorPage = lazy(() => import('../pages/CollectorPage'));
const UserPage = lazy(() => import('../pages/UserPage'));
const ControlPage = lazy(() => import('../pages/ControlPage'));
const LogPage = lazy(() => import('../pages/LogPage'));
const UserApprovalPage = lazy(() => import('../pages/UserApprovalPage'));
const OrderHistoryPage = lazy(() => import('../pages/OrderHistoryPage'));
const BoxAddRemovePage = lazy(() => import('../pages/BoxAddRemovePage2'));
const CollectorAssignmentPage = lazy(() => import('../pages/CollectorAssignmentPage'));
const BoxControlLogPage = lazy(() => import('../pages/BoxControlLogPage'));
const MonitoringPage = lazy(() => import('../pages/MonitoringPage'));

const N_LoginPage = lazy(() => import('../pages/NewPage/N_loginPage'));
const N_SignupPage = lazy(() => import('../pages/NewPage/N_SignupPage'));
const N_FindIdPage = lazy(() => import('../pages/NewPage/N_FindIdPage'));
const N_FindPasswordPage = lazy(() => import('../pages/NewPage/N_FindPasswordPage'));
const N_MainPage = lazy(() => import('../pages/NewPage/N_mainPage'));
const N_BoxAddRemovePage = lazy(() => import('../pages/NewPage/N_boxAddRemovePage'));
const N_BoxControlLogPage = lazy(() => import('../pages/NewPage/N_boxControlLogPage'));
const N_collectorAssignmentPage = lazy(() => import('../pages/NewPage/N_collectorAssignmentPage'));
const N_MonitoringPage = lazy(() => import('../pages/NewPage/N_MonitoringPage'));
const N_UserApprovalPage = lazy(() => import('../pages/NewPage/N_UserApprovalPage'));
const N_OrderHistoryPage = lazy(() => import('../pages/NewPage/N_OrderHistoryPage'));

const root = createBrowserRouter([
    { path: "", element: <Suspense fallback={Loading}><N_LoginPage /></Suspense> },
    /*{ path: "signup", element: <Suspense fallback={Loading}><SignupPage /></Suspense> },
    { path: "findid", element: <Suspense fallback={Loading}><FindIdPage /></Suspense> },
    { path: "findpassword", element: <Suspense fallback={Loading}><FindPasswordPage /></Suspense> },*/
    { path: "n_SignupPage", element: <Suspense fallback={Loading}><N_SignupPage /></Suspense> },
    { path: "n_FindIdPage", element: <Suspense fallback={Loading}><N_FindIdPage /></Suspense> },
    { path: "n_FindPasswordPage", element: <Suspense fallback={Loading}><N_FindPasswordPage /></Suspense> },

    {
        path: "main",
        element: <ProtectedRoute><Suspense fallback={Loading}><MainPage /></Suspense></ProtectedRoute>
    },
    {
        path: "collector/:id",
        element: <ProtectedRoute><Suspense fallback={Loading}><CollectorPage /></Suspense></ProtectedRoute>
    },
    {
        path: "user/:id",
        element: <ProtectedRoute><Suspense fallback={Loading}><UserPage /></Suspense></ProtectedRoute>
    },
    {
        path: "control",
        element: <ProtectedRoute><Suspense fallback={Loading}><ControlPage /></Suspense></ProtectedRoute>
    },
    {
        path: "log",
        element: <ProtectedRoute><Suspense fallback={Loading}><LogPage /></Suspense></ProtectedRoute>
    },
    {
        path: "userApprovalPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><UserApprovalPage /></Suspense></ProtectedRoute>
    },
    {
        path: "orderHistoryPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><OrderHistoryPage /></Suspense></ProtectedRoute>
    },
    {
        path: "boxAddRemovePage",
        element: <ProtectedRoute><Suspense fallback={Loading}><BoxAddRemovePage /></Suspense></ProtectedRoute>
    },
    {
        path: "collectorAssignmentPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><CollectorAssignmentPage /></Suspense></ProtectedRoute>
    },
    {
        path: "boxControlLogPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><BoxControlLogPage /></Suspense></ProtectedRoute>
    },
    {
        path: "monitoringPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><MonitoringPage /></Suspense></ProtectedRoute>
    },
    {
        path: "n_MainPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><N_MainPage /></Suspense></ProtectedRoute>
    },
    {
        path: "n_BoxAddRemovePage",
        element: <ProtectedRoute><Suspense fallback={Loading}><N_BoxAddRemovePage /></Suspense></ProtectedRoute>
    },
    {
        path: "n_BoxControlLogPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><N_BoxControlLogPage /></Suspense></ProtectedRoute>
    },
    {
        path: "n_collectorAssignmentPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><N_collectorAssignmentPage /></Suspense></ProtectedRoute>
    },
    {
        path: "n_MonitoringPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><N_MonitoringPage /></Suspense></ProtectedRoute>
    },
    {
        path: "n_UserApprovalPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><N_UserApprovalPage /></Suspense></ProtectedRoute>
    },
    {
        path: "n_OrderHistoryPage",
        element: <ProtectedRoute><Suspense fallback={Loading}><N_OrderHistoryPage /></Suspense></ProtectedRoute>
    }
]);

export default root;