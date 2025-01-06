import {Link} from "react-router-dom";

const loginPage = () => {
    return (
        <div>
            <div className="flex">
                <Link to={'/about'}>About</Link>
            </div>
            <div className=" text-3xl">Login Page</div>
        </div>
    );
}

export default loginPage;