import { useCart } from "../context/CartContext";
import products from "../data/products";

const ProductPage = () => {
    const { addToCart } = useCart();

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Danh sách sản phẩm</h1>
            <div className="flex flex-row gap-4 overflow-x-auto"> {/* Thay đổi ở đây */}
                {products.map(product => (
                    <div key={product.id} className="flex flex-row gap-4 overflow-x-auto"> {/* Thêm kích thước cố định */}
                        <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded" />
                        <h3 className="mt-2 font-semibold">{product.name}</h3>
                        <p className="text-gray-500">{product.price.toLocaleString()} VND</p>
                        <button
                            onClick={() => addToCart(product)}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded w-full">
                            Thêm vào giỏ
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductPage;