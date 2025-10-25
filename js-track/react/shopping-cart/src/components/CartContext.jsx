import { createContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    function addToCart(item) {
        const existingItem = cartItems.find(i => i.id === item.id);
        if (existingItem) {
            setCartItems(cartItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCartItems([...cartItems, { ...item, quantity: 1 }]);
        }
    }

    function removeFromCart(itemId) {
        setCartItems(cartItems.filter(i => i.id !== itemId));
    }

    function updateQty(itemId, addQty) {
        setCartItems(cartItems.map(i => {
            if (i.id === itemId) {
                const newQty = i.quantity + addQty;
                if (newQty > 0) i.quantity = newQty;
            }
            return i;
        }));
    }

    function getQuantity() {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    function getSubtotal() {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, getQuantity, getSubtotal }}>
            {children}
        </CartContext.Provider>
    );
}

export { CartContext };