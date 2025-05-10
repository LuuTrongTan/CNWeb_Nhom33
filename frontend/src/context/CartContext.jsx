import { createContext, useContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import axios from "axios";
import { useAuth } from "./AuthContext";
import apiClient from "../services/api.service";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const { currentUser, isAuthenticated } = useAuth();

  // Hàm hiển thị thông báo lỗi
  const showError = (message) => {
    setError(message);
    if (typeof toast !== 'undefined') {
      toast.error(message);
    } else {
      console.error(message);
    }
  };

  // Hàm hiển thị thông báo thành công
  const showSuccess = (message) => {
    if (typeof toast !== 'undefined') {
      toast.success(message);
    } else {
      console.log(message);
    }
  };

  // Hàm lấy giỏ hàng từ API hoặc localStorage khi component mount
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        try {
          // Lấy giỏ hàng từ API cho người dùng đã đăng nhập
          setLoading(true);
          const response = await apiClient.get("/cart");
          
          if (response && response.items) {
            // Chuyển đổi định dạng từ API để phù hợp với frontend
            const formattedItems = response.items.map(item => ({
              id: item.product,
              cartItemId: item.cartItemId || `${item.product}-${item.selectedSize || 'no-size'}-${item.selectedColor || 'no-color'}-${Date.now()}`,
              name: item.name,
              price: item.price,
              originalPrice: item.originalPrice,
              hasDiscount: item.hasDiscount,
              image: item.image,
              quantity: item.quantity,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor
            }));
            
            setCart(formattedItems);
            
            // Mặc định chọn tất cả sản phẩm trong giỏ hàng
            // ƯU TIÊN sử dụng cartItemId
            setSelectedItems(formattedItems.map(item => item.cartItemId));
            
            // Kiểm tra xem có giỏ hàng local không để đồng bộ
            const localCart = localStorage.getItem("cart");
            if (localCart) {
              try {
                const parsedLocalCart = JSON.parse(localCart);
                if (Array.isArray(parsedLocalCart) && parsedLocalCart.length > 0) {
                  // Đồng bộ giỏ hàng từ local lên server
                  const syncResult = await apiClient.post("/cart/sync", { items: parsedLocalCart });
                  // Xóa giỏ hàng local sau khi đồng bộ
                  localStorage.removeItem("cart");
                  
                  // Hiển thị cảnh báo nếu có sản phẩm không thêm được
                  if (syncResult.warnings && syncResult.warnings.length > 0) {
                    syncResult.warnings.forEach(warning => {
                      showError(warning);
                    });
                  }
                  
                  // Lấy lại giỏ hàng đã đồng bộ
                  if (syncResult.cart) {
                    const updatedItems = syncResult.cart.items.map(item => ({
                      id: item.product,
                      cartItemId: item.cartItemId || `${item.product}-${item.selectedSize || 'no-size'}-${item.selectedColor || 'no-color'}-${Date.now()}`,
                      name: item.name,
                      price: item.price,
                      originalPrice: item.originalPrice,
                      hasDiscount: item.hasDiscount,
                      image: item.image,
                      quantity: item.quantity,
                      selectedSize: item.selectedSize,
                      selectedColor: item.selectedColor
                    }));
                    
                    setCart(updatedItems);
                    setSelectedItems(updatedItems.map(item => item.cartItemId));
                  }
                }
              } catch (e) {
                console.error("Lỗi khi đồng bộ giỏ hàng từ localStorage:", e);
              }
            }
          }
        } catch (err) {
          const errorMessage = err.response?.data?.message || "Không thể lấy giỏ hàng từ server";
          showError(errorMessage);
        } finally {
          setLoading(false);
        }
      } else {
        // Lấy giỏ hàng từ localStorage cho người dùng chưa đăng nhập
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            // Đảm bảo mỗi item có cartItemId
            const cartWithIds = parsedCart.map(item => {
              if (!item.cartItemId) {
                return {
                  ...item,
                  cartItemId: `${item.id}-${item.selectedSize || 'no-size'}-${item.selectedColor || 'no-color'}-${Date.now()}`
                };
              }
              return item;
            });
            setCart(cartWithIds);
            // LUÔN ƯU TIÊN sử dụng cartItemId, không sử dụng item.id
            setSelectedItems(cartWithIds.map(item => item.cartItemId));
            // Lưu lại giỏ hàng với cartItemId
            localStorage.setItem("cart", JSON.stringify(cartWithIds));
          } catch (e) {
            console.error("Lỗi khi đọc giỏ hàng từ localStorage:", e);
            localStorage.removeItem("cart");
          }
        }
      }
    };
    
    fetchCart();
  }, [isAuthenticated, currentUser]);

  // Lưu giỏ hàng vào localStorage khi thay đổi (chỉ cho người dùng chưa đăng nhập)
  useEffect(() => {
    if (!isAuthenticated && cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addToCart = async (product) => {
    // Chuyển đổi _id thành id nếu cần
    const productToAdd = {
      id: product._id || product.id,
      name: product.name,
      price: product.hasDiscount ? product.discountPrice : product.price,
      originalPrice: product.price,
      hasDiscount: product.hasDiscount || false,
      image: product.images?.[0] || product.image,
      quantity: product.quantity || 1,
      selectedSize: product.selectedSize,
      selectedColor: product.selectedColor,
    };

    if (isAuthenticated) {
      try {
        setLoading(true);
        
        // Xử lý nếu đã có sản phẩm với cùng ID nhưng khác màu/kích thước
        const response = await apiClient.get("/cart");
        let existingItem = null;
        
        if (response && response.items) {
          existingItem = response.items.find(
            item => item.product === productToAdd.id && 
                    item.selectedSize === productToAdd.selectedSize && 
                    item.selectedColor === productToAdd.selectedColor
          );
        }
        
        // Gọi API để thêm vào giỏ hàng
        if (existingItem) {
          // Cập nhật số lượng nếu đã có sản phẩm giống hệt (cùng ID, size, color)
          await apiClient.put("/cart/items", {
            productId: productToAdd.id,
            quantity: existingItem.quantity + productToAdd.quantity,
            selectedSize: productToAdd.selectedSize,
            selectedColor: productToAdd.selectedColor
          });
        } else {
          // Thêm mới nếu chưa có hoặc khác size/color
          await apiClient.post("/cart/items", {
            productId: productToAdd.id,
            quantity: productToAdd.quantity,
            selectedSize: productToAdd.selectedSize, 
            selectedColor: productToAdd.selectedColor
          });
        }
        
        // Lấy lại giỏ hàng từ server
        const updatedResponse = await apiClient.get("/cart");
        
        if (updatedResponse && updatedResponse.items) {
          const formattedItems = updatedResponse.items.map(item => ({
            id: item.product,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            hasDiscount: item.hasDiscount,
            image: item.image,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          }));
          
          setCart(formattedItems);
          showSuccess(`Đã thêm ${productToAdd.name} vào giỏ hàng`);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng";
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Nếu chưa đăng nhập, thêm vào state và localStorage
      setCart((prev) => {
        // Kiểm tra xem sản phẩm đã tồn tại với CÙNG màu sắc và kích thước chưa
        const existing = prev.find((item) => 
          item.id === productToAdd.id && 
          item.selectedSize === productToAdd.selectedSize && 
          item.selectedColor === productToAdd.selectedColor
        );

        if (existing) {
          // Nếu sản phẩm đã tồn tại với cùng màu sắc và kích thước, chỉ cập nhật số lượng
          return prev.map((item) =>
            (item.id === productToAdd.id && 
             item.selectedSize === productToAdd.selectedSize && 
             item.selectedColor === productToAdd.selectedColor)
              ? {
                  ...item,
                  quantity: item.quantity + (productToAdd.quantity || 1),
                }
              : item
          );
        } else {
          // Nếu là sản phẩm mới HOẶC có màu/kích thước khác, thêm mới vào giỏ hàng
          return [...prev, {
            ...productToAdd,
            // Tạo ID duy nhất cho mục giỏ hàng này để phân biệt các biến thể khác nhau
            cartItemId: `${productToAdd.id}-${productToAdd.selectedSize || 'no-size'}-${productToAdd.selectedColor || 'no-color'}-${Date.now()}`
          }];
        }
      });
      showSuccess(`Đã thêm ${productToAdd.name} vào giỏ hàng`);
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      // Nếu đã đăng nhập, gọi API để xóa khỏi giỏ hàng
      try {
        setLoading(true);
        
        // Ghi log để debug
        console.log(`Đang xóa sản phẩm với ID: ${itemId}`);
        
        await apiClient.delete(`/cart/items/${itemId}`);
        
        // Lấy lại giỏ hàng từ server
        const response = await apiClient.get("/cart");
        
        if (response && response.items) {
          const formattedItems = response.items.map(item => ({
            id: item.product,
            cartItemId: item.cartItemId,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            hasDiscount: item.hasDiscount,
            image: item.image,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          }));
          
          setCart(formattedItems);
          setSelectedItems(prev => prev.filter(id => formattedItems.some(item => item.cartItemId === id)));
          showSuccess("Đã xóa sản phẩm khỏi giỏ hàng");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Không thể xóa sản phẩm khỏi giỏ hàng";
        showError(errorMessage);
        console.error("Lỗi khi xóa sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    } else {
      // Nếu chưa đăng nhập, xóa từ state và localStorage
      const itemToRemove = cart.find(item => item.cartItemId === itemId);
      const updatedCart = cart.filter(item => item.cartItemId !== itemId);
      setCart(updatedCart);
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      
      if (itemToRemove) {
        showSuccess(`Đã xóa ${itemToRemove.name} khỏi giỏ hàng`);
      }
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    
    if (isAuthenticated) {
      // Nếu đã đăng nhập, cập nhật qua API
      try {
        setLoading(true);
        const item = cart.find(item => item.cartItemId === itemId);
        
        if (!item) {
          throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
        }
        
        // Sử dụng product ID cho API và giữ nguyên size, color
        await apiClient.put("/cart/items", { 
          productId: item.id,
          cartItemId: itemId,
          quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        });
        
        // Lấy lại giỏ hàng từ server
        const response = await apiClient.get("/cart");
        
        if (response && response.items) {
          const formattedItems = response.items.map(item => ({
            id: item.product,
            cartItemId: item.cartItemId,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            hasDiscount: item.hasDiscount,
            image: item.image,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          }));
          
          setCart(formattedItems);
          showSuccess("Đã cập nhật số lượng sản phẩm");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Không thể cập nhật số lượng sản phẩm";
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Nếu chưa đăng nhập, cập nhật trong state và localStorage
      const updatedCart = cart.map(item => 
        item.cartItemId === itemId ? { ...item, quantity } : item
      );
      
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      showSuccess("Đã cập nhật số lượng sản phẩm");
    }
  };

  const updateCartItem = async (itemId, updateData) => {
    const { quantity, selectedSize, selectedColor } = updateData;
    
    if (quantity && quantity <= 0) {
      return removeFromCart(itemId);
    }
    
    if (isAuthenticated) {
      // Nếu đã đăng nhập, cập nhật qua API
      try {
        setLoading(true);
        
        // Tìm item hiện tại 
        const currentItem = cart.find(item => item.cartItemId === itemId);
        if (!currentItem) {
          throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
        }
        
        // Kiểm tra xem đã có sản phẩm với cùng ID và size/color mới chưa
        const newSize = selectedSize !== undefined ? selectedSize : currentItem.selectedSize;
        const newColor = selectedColor !== undefined ? selectedColor : currentItem.selectedColor;
        
        const duplicateItem = cart.find(item => 
          item.id === currentItem.id && 
          item.selectedSize === newSize && 
          item.selectedColor === newColor &&
          item.cartItemId !== currentItem.cartItemId
        );

        if (duplicateItem) {
          // Nếu đã có sản phẩm giống hệt với size/color mới, hợp nhất chúng
          const totalQuantity = (quantity || currentItem.quantity) + duplicateItem.quantity;
          
          // Cập nhật số lượng cho sản phẩm trùng
          await apiClient.put("/cart/items", {
            productId: duplicateItem.id,
            cartItemId: duplicateItem.cartItemId,
            quantity: totalQuantity,
            selectedSize: newSize,
            selectedColor: newColor
          });
          
          // Xóa sản phẩm hiện tại
          await apiClient.delete(`/cart/items/${itemId}`);
        } else {
          // Chuẩn bị dữ liệu cập nhật và đảm bảo luôn có quantity
          const updatePayload = { 
            productId: currentItem.id,
            cartItemId: itemId,
            quantity: quantity !== undefined ? quantity : currentItem.quantity, // Luôn gửi quantity
          };
          if (selectedSize !== undefined) updatePayload.selectedSize = selectedSize;
          if (selectedColor !== undefined) updatePayload.selectedColor = selectedColor;
          
          await apiClient.put("/cart/items", updatePayload);
        }
        
        // Lấy lại giỏ hàng từ server
        const response = await apiClient.get("/cart");
        
        if (response && response.items) {
          const formattedItems = response.items.map(item => ({
            id: item.product,
            cartItemId: item.cartItemId,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            hasDiscount: item.hasDiscount,
            image: item.image,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          }));
          
          setCart(formattedItems);
          // Cập nhật danh sách các mục đã chọn
          setSelectedItems(prev => {
            // Giữ lại các mục đã chọn mà vẫn còn trong giỏ hàng
            return prev.filter(id => formattedItems.some(item => item.cartItemId === id));
          });
          
          showSuccess("Đã cập nhật sản phẩm trong giỏ hàng");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Không thể cập nhật sản phẩm";
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Nếu chưa đăng nhập, cập nhật trong state và localStorage
      setCart(prev => {
        // Tìm sản phẩm hiện tại
        const currentItem = prev.find(item => item.cartItemId === itemId);
        if (!currentItem) return prev;
        
        // Chuẩn bị thông tin cập nhật
        const newSize = selectedSize !== undefined ? selectedSize : currentItem.selectedSize;
        const newColor = selectedColor !== undefined ? selectedColor : currentItem.selectedColor;
        
        // Kiểm tra xem đã có sản phẩm với cùng ID và size/color mới chưa
        const duplicateItem = prev.find(item => 
          item.id === currentItem.id && 
          item.selectedSize === newSize && 
          item.selectedColor === newColor &&
          item.cartItemId !== currentItem.cartItemId
        );

        if (duplicateItem) {
          // Nếu đã có sản phẩm giống hệt với size/color mới, hợp nhất và xóa hiện tại
          const updatedItems = prev.filter(item => item.cartItemId !== currentItem.cartItemId && item.cartItemId !== duplicateItem.cartItemId);
          const newQuantity = (quantity || currentItem.quantity) + duplicateItem.quantity;
          
          // Tạo mục mới với số lượng đã được kết hợp
          const mergedItem = {
            ...duplicateItem,
            quantity: newQuantity,
          };
          
          const result = [...updatedItems, mergedItem];
          localStorage.setItem("cart", JSON.stringify(result));
          
          // Cập nhật danh sách các mục đã chọn
          setSelectedItems(prev => {
            const newSelected = [...prev.filter(id => id !== itemId && id !== duplicateItem.cartItemId), mergedItem.cartItemId];
            return newSelected;
          });
          
          showSuccess("Đã cập nhật và gộp sản phẩm trong giỏ hàng");
          return result;
        } else {
          // Thông tin cập nhật
          const updatedItem = {
            ...currentItem,
            quantity: quantity !== undefined ? quantity : currentItem.quantity,
            selectedSize: newSize,
            selectedColor: newColor,
          };
          
          // Nếu size hoặc color thay đổi, tạo cartItemId mới
          if ((selectedSize !== undefined && selectedSize !== currentItem.selectedSize) || 
              (selectedColor !== undefined && selectedColor !== currentItem.selectedColor)) {
            updatedItem.cartItemId = `${currentItem.id}-${newSize || 'no-size'}-${newColor || 'no-color'}-${Date.now()}`;
            
            // Cập nhật mục đã chọn
            setSelectedItems(prev => {
              const newSelected = [...prev.filter(id => id !== itemId), updatedItem.cartItemId];
              return newSelected;
            });
          }
          
          // Cập nhật
          const result = prev.map(item => item.cartItemId === itemId ? updatedItem : item);
          localStorage.setItem("cart", JSON.stringify(result));
          
          return result;
        }
      });
      
      showSuccess("Đã cập nhật sản phẩm trong giỏ hàng");
    }
  };

  const applyDiscount = (code) => {
    if (code === "SALE10") setDiscount(10); // Giảm 10%
    else setDiscount(0);
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (acc, item) => {
        const itemId = item.id || item.cartItemId;
        if (selectedItems.includes(itemId)) {
          return acc + item.price * item.quantity;
        }
        return acc;
      },
      0
    );
    return subtotal - (subtotal * discount) / 100 + shippingFee;
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      // Nếu đã đăng nhập, xóa qua API
      try {
        setLoading(true);
        await apiClient.delete("/cart");
        setCart([]);
        showSuccess("Đã xóa toàn bộ giỏ hàng");
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Không thể xóa giỏ hàng";
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Nếu chưa đăng nhập, xóa từ state và localStorage
      setCart([]);
      localStorage.removeItem("cart");
      showSuccess("Đã xóa toàn bộ giỏ hàng");
    }
  };

  // Thêm hàm để chọn hoặc bỏ chọn sản phẩm
  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Hàm chọn tất cả hoặc bỏ chọn tất cả
  const toggleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedItems(cart.map(item => item.id || item.cartItemId));
    } else {
      setSelectedItems([]);
    }
  };

  // Hàm chỉ lấy các sản phẩm được chọn từ giỏ hàng
  const getSelectedItems = () => {
    return cart.filter(item => selectedItems.includes(item.id || item.cartItemId));
  };

  // Sửa lại hàm tạo đơn hàng để chỉ tạo đơn với các sản phẩm đã chọn
  const createOrder = async (shippingInfo) => {
    try {
      setLoading(true);
      setError(null);

      // Lọc chỉ các sản phẩm được chọn
      const selectedCartItems = getSelectedItems();
      
      if (selectedCartItems.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng");
      }

      const orderData = {
        items: selectedCartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        total: calculateTotal(),
        shippingInfo,
      };

      const response = await apiClient.post("/orders", orderData);

      // Nếu đặt hàng thành công, xóa các mục đã chọn khỏi giỏ hàng
      if (isAuthenticated) {
        // Đối với người dùng đã đăng nhập, xóa từng sản phẩm đã chọn
        for (const item of selectedCartItems) {
          await apiClient.delete(`/cart/items/${item.id}`);
        }
        
        // Cập nhật giỏ hàng
        const updatedCart = await apiClient.get("/cart");
        if (updatedCart && updatedCart.items) {
          const formattedItems = updatedCart.items.map(item => ({
            id: item.product,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            hasDiscount: item.hasDiscount,
            image: item.image,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          }));
          
          setCart(formattedItems);
          // Cập nhật danh sách mục đã chọn
          setSelectedItems(formattedItems.map(item => item.id));
        }
      } else {
        // Đối với người dùng chưa đăng nhập, lọc ra các mục chưa được chọn và cập nhật localStorage
        const remainingItems = cart.filter(item => !selectedItems.includes(item.id || item.cartItemId));
        setCart(remainingItems);
        setSelectedItems(remainingItems.map(item => item.id || item.cartItemId));
        localStorage.setItem("cart", JSON.stringify(remainingItems));
      }

      showSuccess("Đơn hàng đã được tạo thành công");
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Lỗi khi tạo đơn hàng";
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItem,
        applyDiscount,
        calculateTotal,
        setShippingFee,
        createOrder,
        clearCart,
        loading,
        error,
        // Thêm các giá trị mới cho tính năng chọn sản phẩm
        selectedItems,
        toggleSelectItem,
        toggleSelectAll,
        getSelectedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
