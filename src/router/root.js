import {Suspense, lazy} from 'react'

const {createBrowserRouter} = require("react-router-dom");

const Loading = <div>Loaging....</div>
const LoginPage = lazy(() => import('../pages/LoginPage'))
const SignupPage = lazy(() => import('../pages/SignupPage'))

const root = createBrowserRouter([
    {
        path:"",
        element:<Suspense fallback={Loading}><LoginPage/></Suspense>
    },
    {
        path:"signup",
        element:<Suspense fallback={Loading}><SignupPage/></Suspense>
    }
]);
export default root;