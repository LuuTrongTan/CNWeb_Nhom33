import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getWishlist, removeFromWishlist, clearWishlist } from '../../services/wishlist.service';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wishlist items on component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await getWishlist();
        setWishlistItems(response.products);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setError('Failed to load wishlist. Please try again later.');
        toast.error('Failed to load wishlist');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // Handle remove item from wishlist
  const handleRemoveItem = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter(item => item.product._id !== productId));
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      toast.error(error.message || 'Failed to remove item from wishlist');
    }
  };

  // Handle clear wishlist
  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      try {
        await clearWishlist();
        setWishlistItems([]);
        toast.success('Wishlist cleared successfully');
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        toast.error(error.message || 'Failed to clear wishlist');
      }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        {wishlistItems.length > 0 && (
          <button
            onClick={handleClearWishlist}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Save items you're interested in to your wishlist for easy access later.
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {wishlistItems.map((item) => (
              <li key={item._id} className="p-6">
                <div className="flex flex-col md:flex-row">
                  {/* Product image */}
                  <div className="flex-shrink-0 h-24 w-24 rounded-md border border-gray-200 overflow-hidden">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Product details */}
                  <div className="flex-1 md:ml-6 mt-4 md:mt-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.product.category}
                        </p>
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        {formatCurrency(item.product.price)}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {item.product.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Added on{' '}
                        {new Date(item.addedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Add to Cart
                        </button>
                      </div>
                    </div>
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

export default Wishlist; 