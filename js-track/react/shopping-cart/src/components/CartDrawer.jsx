import { useEffect, useContext } from 'react';
import Cart from './Cart';
import { useNavigate } from 'react-router';
import { CartContext } from './CartContext';

export default function CartDrawer({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { getSubtotal } = useContext(CartContext);

    useEffect(() => {
        if (!isOpen) return;
        function onKey(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-40 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            <aside
                className={`fixed right-0 top-0 h-full w-80 md:w-96 bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!isOpen}
            >
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Your Cart</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900 px-2 py-1">
                        Close
                    </button>
                </div>

                <div className="p-4 overflow-auto flex-1">
                    <Cart />
                </div>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>${getSubtotal().toFixed(2)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                    <div className="mt-6">
                        <a
                            href="#"
                            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-blue-700"
                        >
                            Checkout
                        </a>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                            or{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    navigate('/products');
                                }}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Continue Shopping
                                <span aria-hidden="true"> &rarr;</span>
                            </button>
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
