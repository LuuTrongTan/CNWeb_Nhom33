import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAdmin } from '../api/auth.api';
import { getProduct, createProduct, updateProduct } from '../api/admin.api';

const AdminProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        images: [],
        category: '',
        stock: ''
    });

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
        const fetchProduct = async () => {
            if (id) {
                try {
                    const data = await getProduct(id);
                    setProduct(data);
                } catch (error) {
                    console.error('Error fetching product:', error);
                }
            }
            setLoading(false);
        };

        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setProduct(prev => ({
            ...prev,
            images: [...prev.images, ...imageUrls]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await updateProduct(id, product);
            } else {
                await createProduct(product);
            }
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
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
            <h1 className="text-3xl font-bold mb-8">
                {id ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên sản phẩm
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Danh mục
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={product.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số lượng
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={product.stock}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={product.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows="4"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={handleImageChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            accept="image/*"
                        />
                        <div className="mt-4 grid grid-cols-4 gap-4">
                            {product.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Product ${index + 1}`}
                                    className="h-32 w-32 object-cover rounded"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        {id ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductFormPage; 