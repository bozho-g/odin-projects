import { useContext } from 'react';
import { CartContext } from './CartContext';

function Cart() {
    const { cartItems, removeFromCart, updateQty } = useContext(CartContext);

    if (cartItems.length === 0) {
        return (
            <p>Your cart is currently empty.</p>
        );
    }

    return (
        <div className="mt-8">
            <ul role="list" className="-my-6 divide-y divide-gray-200">
                {cartItems.map((product) => (
                    <li key={product.id} className="flex py-6">
                        <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img alt={product.title} src={product.image} className="size-full object-contain" />
                        </div>


                        <div className="ml-4 flex flex-1 flex-col">
                            <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>
                                        {product.title}
                                    </h3>
                                    <p className="ml-4">${(product.price * product.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="flex items-center px-2.5 py-1.5 border border-gray-300 text-slate-900 text-xs rounded-md">
                                    <span onClick={() => updateQty(product.id, -1)} className="cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-2.5 fill-current ${product.quantity === 1 ? 'text-red-600' : ''}`} viewBox="0 0 124 124">
                                            <path d="M112 50H12C5.4 50 0 55.4 0 62s5.4 12 12 12h100c6.6 0 12-5.4 12-12s-5.4-12-12-12z" data-original="#000000"></path>
                                        </svg>
                                    </span>

                                    <span className="mx-3">{product.quantity}</span>
                                    <span onClick={() => updateQty(product.id, 1)} className="cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 fill-current" viewBox="0 0 42 42">
                                            <path d="M37.059 16H26V4.941C26 2.224 23.718 0 21 0s-5 2.224-5 4.941V16H4.941C2.224 16 0 18.282 0 21s2.224 5 4.941 5H16v11.059C16 39.776 18.282 42 21 42s5-2.224 5-4.941V26h11.059C39.776 26 42 23.718 42 21s-2.224-5-4.941-5z" data-original="#000000"></path>
                                        </svg>
                                    </span>
                                </div>

                                <div className="flex">
                                    <button onClick={() => removeFromCart(product.id)} type="button" className="font-medium text-red-600 hover:text-indigo-500">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Cart;