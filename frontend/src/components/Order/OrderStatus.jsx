import React from 'react';

const OrderStatus = ({ status }) => {
  let statusColor = '';
  let statusText = '';

  switch (status) {
    case 'pending':
      statusColor = 'bg-yellow-200 text-yellow-800';
      statusText = 'Chờ xác nhận';
      break;
    case 'processing':
      statusColor = 'bg-blue-200 text-blue-800';
      statusText = 'Đang xử lý';
      break;
    case 'shipped':
      statusColor = 'bg-purple-200 text-purple-800';
      statusText = 'Đang giao hàng';
      break;
    case 'delivered':
      statusColor = 'bg-green-200 text-green-800';
      statusText = 'Đã giao hàng';
      break;
    case 'cancelled':
      statusColor = 'bg-red-200 text-red-800';
      statusText = 'Đã hủy';
      break;
    default:
      statusColor = 'bg-gray-200 text-gray-800';
      statusText = 'Không xác định';
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
      {statusText}
    </span>
  );
};

export default OrderStatus; 