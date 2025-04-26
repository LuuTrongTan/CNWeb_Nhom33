import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserOrders, cancelOrder } from '../../services/order.service';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getUserOrders();
        setOrders(response.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await cancelOrder(orderId);
        // Update the order in the state
        setOrders(
          orders.map((order) =>
            order._id === orderId ? response.order : order
          )
        );
        toast.success('Order cancelled successfully');
      } catch (error) {
        console.error('Error cancelling order:', error);
        toast.error(error.message || 'Failed to cancel order');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status badge style
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">No orders yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order._id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order placed on {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order._id.substring(order._id.length - 8)}
                    </p>
                  </div>
                  <div className="mt-2 lg:mt-0 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    {order.orderStatus === 'processing' && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {order.products.slice(0, 2).map((item) => (
                        <li key={item._id} className="py-4 flex">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="h-full w-full object-cover object-center"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-500">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.product.name}</h3>
                                <p className="ml-4">
                                  {formatCurrency(item.price)}
                                </p>
                              </div>
                            </div>
                            <div className="flex-1 flex items-end justify-between text-sm">
                              <p className="text-gray-500">
                                Qty {item.quantity}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Show indicator if there are more items */}
                    {order.products.length > 2 && (
                      <div className="pt-3 text-sm text-gray-500 text-center">
                        + {order.products.length - 2} more items
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Total:</span>{' '}
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <p className="mt-1">
                      <span className="font-medium">Payment:</span>{' '}
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderHistory; 