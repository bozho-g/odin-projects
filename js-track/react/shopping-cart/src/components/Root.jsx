import { Fade } from "react-awesome-reveal";
import { Link, Outlet, useLocation } from "react-router";
import { useContext, useState } from 'react';
import CartDrawer from './CartDrawer';
import { CartContext } from './CartContext';
import { Toaster } from 'react-hot-toast';

export default function Root() {
    const location = useLocation();
    const [cartOpen, setCartOpen] = useState(false);
    const { getQuantity } = useContext(CartContext);

    return (
        <>
            <nav className="bg-gray-800 p-4 text-white shadow-xl">
                <ul className="flex gap-4 items-center">
                    <li className="mr-auto"><Link to="/" className="text-3xl px-2 py-1">FrostShop</Link></li>
                    <li><Link to="/" className="text-xl px-3 py-2 rounded hover:bg-gray-700">Home</Link></li>
                    <li><Link to="/products" className="text-xl px-3 py-2 rounded hover:bg-gray-700">Products</Link></li>
                    <li className="mr-10"><button onClick={() => setCartOpen(true)} className="text-xl px-3 py-2 rounded hover:bg-gray-700"><span className="material-icons"></span>Cart ({getQuantity()})</button></li>
                </ul>
            </nav>

            <Fade key={location.pathname} duration={1000}>
                <Outlet />
            </Fade>

            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

            <Toaster />
        </>
    );
};