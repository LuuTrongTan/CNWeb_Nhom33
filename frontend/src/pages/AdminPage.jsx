import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../api/auth.api';

const AdminPage = () => {
    const [isLoading, setIsLoading] = useState(true);
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
            } finally {
                setIsLoading(false);
            }
        };

        checkAdmin();
    }, [navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAdminUser) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Trang quản trị</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Quản lý tài khoản */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Quản lý tài khoản</h2>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            Danh sách tài khoản
                        </button>
                    </div>
                </div>

                {/* Quản lý sản phẩm */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Quản lý sản phẩm</h2>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/admin/products')}
                            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        >
                            Danh sách sản phẩm
                        </button>
                        <button
                            onClick={() => navigate('/admin/products/new')}
                            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        >
                            Thêm sản phẩm mới
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage; 