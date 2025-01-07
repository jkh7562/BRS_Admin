import {Suspense, lazy} from 'react'

const {createBrowserRouter} = require("react-router-dom");

const Loading = <div>Loaging....</div>
const LoginPage = lazy(() => import('../pages/LoginPage'))

const root = createBrowserRouter([
    {
        path:"",
        element:<Suspense fallback={Loading}><LoginPage/></Suspense>
    }
]);
export default root;