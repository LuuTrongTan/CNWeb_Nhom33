import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faSpinner,
  faTruck,
  faCheckCircle,
  faBan
} from '@fortawesome/free-solid-svg-icons';

const OrderStatus = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: faClock,
          text: 'Chờ xác nhận',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300',
          iconColor: 'text-yellow-600',
          pulseColor: 'yellow'
        };
      case 'processing':
        return {
          icon: faSpinner,
          text: 'Đang xử lý',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300',
          iconColor: 'text-blue-600',
          pulseColor: 'blue'
        };
      case 'shipped':
        return {
          icon: faTruck,
          text: 'Đang giao hàng',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-300',
          iconColor: 'text-purple-600',
          pulseColor: 'purple'
        };
      case 'delivered':
        return {
          icon: faCheckCircle,
          text: 'Đã giao hàng',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
          iconColor: 'text-green-600',
          pulseColor: 'green'
        };
      case 'cancelled':
        return {
          icon: faBan,
          text: 'Đã hủy',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
          iconColor: 'text-red-600',
          pulseColor: 'red'
        };
      default:
        return {
          icon: faClock,
          text: 'Không xác định',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
          iconColor: 'text-gray-600',
          pulseColor: 'gray'
        };
    }
  };

  const config = getStatusConfig();
  const needsAnimation = ['pending', 'processing', 'shipped'].includes(status);

  return (
    <div className={`px-3 py-1.5 rounded-lg ${config.bgColor} ${config.textColor} inline-flex items-center font-medium text-sm shadow-sm border ${config.borderColor} relative overflow-hidden group`}>
      <div className="mr-2 relative">
        <FontAwesomeIcon 
          icon={config.icon} 
          className={`${config.iconColor} ${needsAnimation ? 'animate-spin-slow' : ''}`} 
        />
        {needsAnimation && (
          <span className={`absolute -inset-1 rounded-full ${config.iconColor} opacity-30 animate-ping-slow`}></span>
        )}
      </div>
      {config.text}
      
      {/* Hover effect */}
      <div className={`absolute inset-0 ${config.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <style jsx="true">{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        
        .animate-spin-slow {
          animation: ${status === 'processing' ? 'spin-slow 3s linear infinite' : 'none'};
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default OrderStatus; 