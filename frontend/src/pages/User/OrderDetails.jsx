import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrderDetails, cancelOrder } from '../../services/order.service';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order details on component mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrderDetails(orderId);
        setOrder(response.order);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again later.');
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await cancelOrder(orderId);
        setOrder(response.order);
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

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>
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
              <p className="text-sm text-red-700">
                {error || 'Order not found'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Order header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Order #{order._id.substring(order._id.length - 8)}
              </p>
              <p className="text-sm text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </span>
              {order.orderStatus === 'processing' && (
                <button
                  onClick={handleCancelOrder}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
          <ul className="divide-y divide-gray-200">
            {order.products.map((item) => (
              <li key={item._id} className="py-4 flex">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
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
                      <p className="ml-4">{formatCurrency(item.price)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.product.category}
                    </p>
                  </div>
                  <div className="flex-1 flex items-end justify-between text-sm">
                    <p className="text-gray-500">Qty {item.quantity}</p>
                    <p className="text-gray-500">
                      Subtotal: {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Order summary */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
          <div className="flow-root">
            <dl className="-my-4 text-sm divide-y divide-gray-200">
              <div className="py-4 flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </dd>
              </div>
              <div className="py-4 flex justify-between">
                <dt className="text-gray-600">Shipping</dt>
                <dd className="font-medium text-gray-900">Free</dd>
              </div>
              <div className="py-4 flex justify-between">
                <dt className="text-gray-600">Tax</dt>
                <dd className="font-medium text-gray-900">Included</dd>
              </div>
              <div className="py-4 flex justify-between">
                <dt className="text-base font-medium text-gray-900">Order Total</dt>
                <dd className="text-base font-medium text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Payment info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Payment Method</dt>
              <dd className="mt-1 text-gray-900">{order.paymentMethod}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Payment Status</dt>
              <dd className="mt-1 text-gray-900">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : order.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Shipping info */}
        <div className="px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="col-span-2">
              <dt className="text-gray-500">Shipping Address</dt>
              <dd className="mt-1 text-gray-900">
                {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.state} {order.shippingAddress.zipCode},{' '}
                {order.shippingAddress.country}
              </dd>
            </div>
            {order.trackingNumber && (
              <div>
                <dt className="text-gray-500">Tracking Number</dt>
                <dd className="mt-1 text-gray-900">{order.trackingNumber}</dd>
              </div>
            )}
            {order.notes && (
              <div className="col-span-2">
                <dt className="text-gray-500">Notes</dt>
                <dd className="mt-1 text-gray-900">{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Link to="/orders" className="btn btn-secondary">
          Back to Orders
        </Link>
        <button onClick={() => window.print()} className="btn btn-primary">
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default OrderDetails; 