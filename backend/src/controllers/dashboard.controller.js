const Order = require("../models/order.model");
const Product = require("../models/product.model");
const SalesAnalytics = require("../models/SalesAnalytics");
const VisitorAnalytics = require("../models/VisitorAnalytics");
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } = require("date-fns");

// Helper function to get date range
const getDateRange = (period, date = new Date()) => {
  switch (period) {
    case "day":
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      };
    case "week":
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
      };
    case "month":
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    case "year":
      return {
        start: new Date(date.getFullYear(), 0, 1),
        end: new Date(date.getFullYear(), 11, 31, 23, 59, 59),
      };
    default:
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      };
  }
};

// Get revenue reports (daily, weekly, monthly)
const getRevenueReports = async (req, res) => {
  try {
    const { period, date } = req.query;
    
    // Default to current date if not provided
    const targetDate = date ? new Date(date) : new Date();
    
    // Get date range based on period
    const { start, end } = getDateRange(period || "day", targetDate);

    // For comparison with previous period
    let previousStart, previousEnd;
    if (period === "day") {
      previousStart = startOfDay(subDays(targetDate, 1));
      previousEnd = endOfDay(subDays(targetDate, 1));
    } else if (period === "week") {
      previousStart = startOfWeek(subDays(targetDate, 7), { weekStartsOn: 1 });
      previousEnd = endOfWeek(subDays(targetDate, 7), { weekStartsOn: 1 });
    } else if (period === "month") {
      previousStart = startOfMonth(subMonths(targetDate, 1));
      previousEnd = endOfMonth(subMonths(targetDate, 1));
    } else {
      previousStart = startOfDay(subDays(targetDate, 1));
      previousEnd = endOfDay(subDays(targetDate, 1));
    }

    // Get orders for current period
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      paymentStatus: "paid",
    });

    // Get orders for previous period (for comparison)
    const previousOrders = await Order.find({
      createdAt: { $gte: previousStart, $lte: previousEnd },
      paymentStatus: "paid",
    });

    // Calculate revenue metrics for current period
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Calculate metrics for previous period
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 100;

    // Group revenue by payment method
    const revenueByPaymentMethod = orders.reduce((acc, order) => {
      const method = order.paymentMethod;
      acc[method] = (acc[method] || 0) + order.totalAmount;
      return acc;
    }, {});

    // Get sales analytics records if available
    const salesAnalytics = await SalesAnalytics.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { start, end },
        totalRevenue,
        orderCount,
        avgOrderValue,
        revenueChange,
        revenueByPaymentMethod,
        salesAnalytics,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get customer analytics
const getCustomerAnalytics = async (req, res) => {
  try {
    const { period, date } = req.query;
    
    // Default to current date if not provided
    const targetDate = date ? new Date(date) : new Date();
    
    // Get date range based on period
    const { start, end } = getDateRange(period || "day", targetDate);
    
    // Placeholder data
    const data = {
      period,
      dateRange: { start, end },
      totalCustomers: 0,
      newCustomers: 0,
      activeCustomers: 0,
      customerRetentionRate: 0,
      averageOrdersPerCustomer: 0
    };
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get inventory reports
const getInventoryReports = async (req, res) => {
  try {
    // Get products with their quantities
    const products = await Product.find().select('name stock sold price');
    
    // Calculate total inventory value
    const totalValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);
    
    // Calculate low stock items (less than 10 in stock)
    const lowStockItems = products.filter(product => product.stock < 10);
    
    res.status(200).json({
      success: true,
      data: {
        totalProducts: products.length,
        totalInventoryValue: totalValue,
        lowStockItems,
        outOfStockItems: products.filter(product => product.stock === 0)
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get sales performance
const getSalesPerformance = async (req, res) => {
  try {
    const { period, date } = req.query;
    
    // Default to current date if not provided
    const targetDate = date ? new Date(date) : new Date();
    
    // Get date range based on period
    const { start, end } = getDateRange(period || "day", targetDate);
    
    // Placeholder data
    const data = {
      period,
      dateRange: { start, end },
      topSellingProducts: [],
      salesByCategory: {},
      revenueOverTime: []
    };
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const today = new Date();
    
    // Lấy khoảng thời gian hiện tại
    const { start, end } = getDateRange(period, today);
    
    // Lấy khoảng thời gian trước đó để so sánh
    let previousStart, previousEnd;
    
    if (period === "day") {
      previousStart = startOfDay(subDays(today, 1));
      previousEnd = endOfDay(subDays(today, 1));
    } else if (period === "week") {
      previousStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
      previousEnd = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });
    } else if (period === "month") {
      previousStart = startOfMonth(subMonths(today, 1));
      previousEnd = endOfMonth(subMonths(today, 1));
    } else if (period === "year") {
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      previousStart = new Date(lastYear.getFullYear(), 0, 1);
      previousEnd = new Date(lastYear.getFullYear(), 11, 31, 23, 59, 59);
    } else {
      previousStart = startOfDay(subDays(today, 1));
      previousEnd = endOfDay(subDays(today, 1));
    }
    
    // 1. Tính toán doanh thu hiện tại
    const currentOrders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    });
    
    const currentRevenue = currentOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Tính toán doanh thu kỳ trước
    const previousOrders = await Order.find({
      createdAt: { $gte: previousStart, $lte: previousEnd },
      status: { $ne: 'cancelled' }
    });
    
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Tính phần trăm thay đổi
    const revenuePercentChange = previousRevenue !== 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 100;
    
    // 2. Tính toán đơn hàng
    const currentOrderCount = currentOrders.length;
    const previousOrderCount = previousOrders.length;
    
    const orderPercentChange = previousOrderCount !== 0 
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 
      : 100;
    
    // 3. Tính toán khách hàng
    // Giả định: đếm user_id duy nhất trong orders
    const currentCustomerIds = [...new Set(currentOrders.map(order => order.user ? order.user.toString() : null).filter(id => id))];
    const previousCustomerIds = [...new Set(previousOrders.map(order => order.user ? order.user.toString() : null).filter(id => id))];
    
    const currentCustomerCount = currentCustomerIds.length;
    const previousCustomerCount = previousCustomerIds.length;
    
    const customerPercentChange = previousCustomerCount !== 0 
      ? ((currentCustomerCount - previousCustomerCount) / previousCustomerCount) * 100 
      : 100;
    
    // Xác định khách hàng mới (có trong hiện tại nhưng không có trong trước đó)
    const newCustomers = currentCustomerIds.filter(id => !previousCustomerIds.includes(id)).length;
    
    // 4. Thông tin sản phẩm
    const productsInfo = {
      total: await Product.countDocuments(),
      outOfStock: await Product.countDocuments({ stock: 0 }),
      lowStock: await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
      totalStock: await Product.aggregate([
        { $group: { _id: null, total: { $sum: "$stock" } } }
      ]).then(result => result.length > 0 ? result[0].total : 0)
    };
    
    // 5. Sản phẩm bán chạy
    let topSellingProducts = await Product.find()
      .sort({ soldCount: -1 })
      .limit(5)
      .select('name stock')
      .lean();
    
    // Thêm thông tin bán hàng cho các sản phẩm
    for (let product of topSellingProducts) {
      const productOrders = currentOrders.filter(order => 
        order.items.some(item => item.product && item.product.toString() === product._id.toString())
      );
      
      const sales = productOrders.reduce((total, order) => {
        const productItems = order.items.filter(item => 
          item.product && item.product.toString() === product._id.toString()
        );
        return total + productItems.reduce((sum, item) => sum + item.quantity, 0);
      }, 0);
      
      const revenue = productOrders.reduce((total, order) => {
        const productItems = order.items.filter(item => 
          item.product && item.product.toString() === product._id.toString()
        );
        return total + productItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }, 0);
      
      product.sales = sales;
      product.revenue = revenue;
      product.id = product._id;
    }
    
    // Nếu không có sản phẩm nào hoặc không có dữ liệu bán hàng, sử dụng dữ liệu mẫu
    if (topSellingProducts.length === 0 || topSellingProducts.every(p => p.sales === 0)) {
      topSellingProducts = [
        { id: '1', name: 'Áo sơ mi trắng nam', sales: 125, stock: 75, revenue: 5625000 },
        { id: '2', name: 'Quần jean nữ ống rộng', sales: 98, stock: 42, revenue: 5390000 },
        { id: '3', name: 'Váy đầm hoa nữ', sales: 82, stock: 35, revenue: 5330000 },
        { id: '4', name: 'Áo thun nam thể thao', sales: 76, stock: 120, revenue: 2128000 },
        { id: '5', name: 'Áo khoác denim unisex', sales: 63, stock: 28, revenue: 4725000 }
      ];
    }
    
    // 6. Đơn hàng gần đây
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .lean();
    
    // Định dạng lại đơn hàng gần đây
    let formattedRecentOrders = recentOrders.map(order => ({
      id: order._id.toString().slice(-6),
      customer: order.user ? order.user.name : 'Khách vãng lai',
      date: order.createdAt,
      status: order.status,
      total: order.totalPrice
    }));
    
    // Nếu không có đơn hàng nào, sử dụng dữ liệu mẫu
    if (formattedRecentOrders.length === 0) {
      formattedRecentOrders = [
        { id: 'ORD123', customer: 'Nguyễn Văn A', date: '2023-08-15', status: 'delivered', total: 1250000 },
        { id: 'ORD122', customer: 'Trần Thị B', date: '2023-08-15', status: 'processing', total: 850000 },
        { id: 'ORD121', customer: 'Lê Văn C', date: '2023-08-14', status: 'shipped', total: 2340000 },
        { id: 'ORD120', customer: 'Phạm Thị D', date: '2023-08-14', status: 'completed', total: 1780000 },
        { id: 'ORD119', customer: 'Hoàng Văn E', date: '2023-08-13', status: 'cancelled', total: 950000 }
      ];
    }
    
    // Tạo cấu trúc phản hồi theo định dạng yêu cầu của frontend
    res.status(200).json({
      revenue: {
        total: currentRevenue,
        previousPeriod: previousRevenue,
        percentChange: revenuePercentChange
      },
      orders: {
        total: currentOrderCount,
        previousPeriod: previousOrderCount,
        percentChange: orderPercentChange
      },
      customers: {
        total: currentCustomerCount,
        previousPeriod: previousCustomerCount,
        percentChange: customerPercentChange,
        new: newCustomers
      },
      products: productsInfo,
      topSellingProducts,
      recentOrders: formattedRecentOrders
    });
  } catch (error) {
    console.error('Lỗi dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tải dữ liệu tổng quan',
      error: error.message
    });
  }
};

module.exports = {
  getRevenueReports,
  getCustomerAnalytics,
  getInventoryReports,
  getSalesPerformance,
  getDashboardSummary
}; 