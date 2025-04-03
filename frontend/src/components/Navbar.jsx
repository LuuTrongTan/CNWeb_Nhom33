import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between">
            <Link to="/" className="text-xl font-bold">Shop</Link>
            <div>
                <Link to="/cart" className="ml-4">Giỏ hàng</Link>
            </div>
        </nav>
    );
};

export default Navbar;
