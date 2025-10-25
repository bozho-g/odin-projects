import { useEffect, useState, useContext } from "react";
import { CartContext } from "./CartContext";
import toast from "react-hot-toast";

function Products() {
    const [products, setProducts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        fetch("https://fakestoreapi.com/products")
            .then(res => {
                if (!res.ok) throw new Error('Network error');
                return res.json();
            })
            .then(setProducts)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div>Loading products...</div>;
    }

    if (!loading && !products) {
        return <div>No products found.</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Products</h1>
            <p className="text-gray-600">Browse our collection of amazing products.</p>
            {
                products && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                        {products.map(product => (
                            <div key={product.id} className="item border rounded-lg p-4 flex flex-col">
                                <img src={product.image} alt={product.title} className="h-48 w-full object-contain mb-4" />
                                <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
                                <p className="text-gray-700 mb-4">${product.price.toFixed(2)}</p>
                                <button onClick={() => {
                                    addToCart(product);
                                    toast.success(`Added "${product.title}" to cart!`);
                                }} className="mt-auto bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add to Cart</button>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );

}

export default Products;