import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../api/auth.api';
import { getProducts, deleteProduct } from '../api/admin.api';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const admin = await isAdmin();
                setIsAdminUser(admin);
                if (!admin) {
                    navigate('/');
                }
            } catch (error) {
                navigate('/login');
            }
        };

        checkAdmin();
    }, [navigate]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleDelete = async (productId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await deleteProduct(productId);
                setProducts(products.filter(product => product._id !== productId));
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAdminUser) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
                <button
                    onClick={() => navigate('/admin/products/new')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Thêm sản phẩm mới
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hình ảnh
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tên sản phẩm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giá
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số lượng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Đánh giá
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => (
                            <tr key={product._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="h-16 w-16 object-cover rounded"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {product.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {product.category}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {product.price.toLocaleString('vi-VN')}đ
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {product.stock}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="text-sm text-gray-900 mr-2">
                                            {product.averageRating.toFixed(1)}
                                        </div>
                                        <div className="text-yellow-400">
                                            ★
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProductsPage; 