import {Suspense, lazy} from 'react'

const {createBrowserRouter} = require("react-router-dom");

const Loading = <div>Loaging....</div>
const LoginPage = lazy(() => import('../pages/LoginPage'))
const AboutPage = lazy(() => import('../pages/AboutPage'))

const root = createBrowserRouter([
    {
        path:"",
        element:<Suspense fallback={Loading}><LoginPage/></Suspense>
    },
    {
        path:"about",
        element:<Suspense fallback={Loading}><AboutPage/></Suspense>
    }
]);
export default root;