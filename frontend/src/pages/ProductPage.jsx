import { useCart } from "../context/CartContext";
import products from "../data/products";

const ProductPage = () => {
    const { addToCart } = useCart();

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Danh sách sản phẩm</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="product-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
                        <h3 className="mt-3 font-semibold text-lg">{product.name}</h3>
                        <p className="text-gray-600 mt-1">{product.price.toLocaleString()} VND</p>
                        <button
                            onClick={() => addToCart(product)}
                            className="add-to-cart-btn mt-3 px-4 py-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition-colors">
                            Thêm vào giỏ
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductPage;