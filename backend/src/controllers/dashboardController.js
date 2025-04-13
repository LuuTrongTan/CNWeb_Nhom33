const Order = require("../models/Order");
const Product = require("../models/Product");
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
exports.getRevenueReports = async (req, res) => {
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
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const { period, date } = req.query;
    
    // Default to current date if not provided
    const targetDate = date ? new Date(date) : new Date();
    
    // Get date range based on period
    const { start, end } = getDateRange(period || "day", targetDate);

    // Get visitor analytics
    const visitorData = await VisitorAnalytics.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    // If we have no visitor data, return empty response
    if (visitorData.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          period,
          dateRange: { start, end },
          totalVisits: 0,
          uniqueVisitors: 0,
          conversionRate: 0,
          bounceRate: 0,
          visitorData: [],
        },
      });
    }

    // Calculate totals
    const totalVisits = visitorData.reduce((sum, record) => sum + record.totalVisits, 0);
    const uniqueVisitors = visitorData.reduce((sum, record) => sum + record.uniqueVisitors, 0);
    
    // Get orders for the period to calculate conversion
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    });
    
    // Calculate conversion rate (orders / unique visitors)
    const conversionRate = uniqueVisitors > 0 
      ? (orders.length / uniqueVisitors) * 100 
      : 0;

    // Calculate average bounce rate
    const bounceRate = visitorData.reduce((sum, record) => sum + record.bounceRate, 0) / visitorData.length;

    // Device distribution
    const deviceDistribution = visitorData.reduce(
      (acc, record) => {
        acc.desktop += record.devices.desktop;
        acc.mobile += record.devices.mobile;
        acc.tablet += record.devices.tablet;
        return acc;
      },
      { desktop: 0, mobile: 0, tablet: 0 }
    );

    // Traffic sources
    const trafficSources = visitorData.reduce(
      (acc, record) => {
        Object.entries(record.sources).forEach(([key, value]) => {
          acc[key] = (acc[key] || 0) + value;
        });
        return acc;
      },
      {}
    );

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { start, end },
        totalVisits,
        uniqueVisitors,
        conversionRate,
        bounceRate,
        deviceDistribution,
        trafficSources,
        visitorData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get inventory reports
exports.getInventoryReports = async (req, res) => {
  try {
    // Get inventory data
    const products = await Product.find().select('name category stock sold stockHistory');

    // Calculate total inventory value
    const totalInventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
          totalStock: { $sum: "$stock" },
        },
      },
    ]);

    // Get low stock items (less than 10 items)
    const lowStockItems = await Product.find({ stock: { $lt: 10 } })
      .select('name category stock')
      .sort({ stock: 1 });

    // Get out of stock items
    const outOfStockItems = await Product.find({ stock: 0 })
      .select('name category');

    // Get top selling products
    const topSellingProducts = await Product.find()
      .sort({ sold: -1 })
      .limit(10)
      .select('name category sold');

    // Group by category
    const stockByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalStock: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalStock: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalInventory: totalInventoryValue[0] || { totalValue: 0, totalStock: 0 },
        lowStockItems,
        outOfStockItems,
        topSellingProducts,
        stockByCategory,
        products,
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
exports.getSalesPerformance = async (req, res) => {
  try {
    const { period, date } = req.query;
    
    // Default to current date if not provided
    const targetDate = date ? new Date(date) : new Date();
    
    // Get date range based on period
    const { start, end } = getDateRange(period || "month", targetDate);

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
      previousStart = startOfMonth(subMonths(targetDate, 1));
      previousEnd = endOfMonth(subMonths(targetDate, 1));
    }

    // Get sales analytics for current period
    const salesData = await SalesAnalytics.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    // Get sales analytics for previous period
    const previousSalesData = await SalesAnalytics.find({
      date: { $gte: previousStart, $lte: previousEnd },
    }).sort({ date: 1 });

    // Calculate campaign performance
    const campaignPerformance = [];
    if (salesData.length > 0) {
      // Extract all campaign data
      const allCampaigns = salesData.flatMap(record => record.campaignData);
      
      // Group by campaign ID
      const campaignMap = allCampaigns.reduce((acc, campaign) => {
        const id = campaign.campaignId.toString();
        if (!acc[id]) {
          acc[id] = {
            campaignId: campaign.campaignId,
            name: campaign.name,
            revenue: 0,
            orders: 0,
            conversion: 0,
          };
        }
        acc[id].revenue += campaign.revenue;
        acc[id].orders += campaign.orders;
        acc[id].conversion = (acc[id].conversion + campaign.conversion) / 2; // average conversion
        return acc;
      }, {});
      
      // Convert to array
      Object.values(campaignMap).forEach(campaign => {
        campaignPerformance.push(campaign);
      });
    }

    // Get best-selling products
    const bestSellingProducts = await Product.find()
      .sort({ sold: -1 })
      .limit(10)
      .select('name category price sold views');

    // Calculate conversion rate for products (sold / views)
    const productsWithConversion = bestSellingProducts.map(product => ({
      ...product.toObject(),
      conversionRate: product.views > 0 ? (product.sold / product.views) * 100 : 0,
    }));

    // Calculate totals
    const totalRevenue = salesData.reduce((sum, record) => sum + record.revenue, 0);
    const totalOrders = salesData.reduce((sum, record) => sum + record.orders, 0);
    const totalProductsSold = salesData.reduce((sum, record) => sum + record.productsSold, 0);
    
    // Calculate previous period totals
    const previousRevenue = previousSalesData.reduce((sum, record) => sum + record.revenue, 0);
    const previousOrders = previousSalesData.reduce((sum, record) => sum + record.orders, 0);
    const previousProductsSold = previousSalesData.reduce((sum, record) => sum + record.productsSold, 0);
    
    // Calculate changes
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 100;
    const ordersChange = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders) * 100 
      : 100;
    const productsSoldChange = previousProductsSold > 0 
      ? ((totalProductsSold - previousProductsSold) / previousProductsSold) * 100 
      : 100;

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { start, end },
        totalRevenue,
        totalOrders,
        totalProductsSold,
        revenueChange,
        ordersChange,
        productsSoldChange,
        campaignPerformance,
        bestSellingProducts: productsWithConversion,
        salesData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get dashboard summary (for main dashboard view)
exports.getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const startOfThisMonth = startOfMonth(today);
    const endOfThisMonth = endOfMonth(today);
    
    // Today's data
    const todayOrders = await Order.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const todayOrderCount = todayOrders.length;
    
    // This month's data
    const monthOrders = await Order.find({
      createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth },
    });
    
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const monthOrderCount = monthOrders.length;
    
    // Inventory summary
    const inventorySummary = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          lowStock: { $sum: { $cond: [{ $lt: ["$stock", 10] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
        },
      },
    ]);
    
    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .select('user orderStatus totalAmount createdAt');
    
    // Top selling products
    const topProducts = await Product.find()
      .sort({ sold: -1 })
      .limit(5)
      .select('name price sold stock');
    
    // Visitor data (if available)
    const todayVisitors = await VisitorAnalytics.findOne({
      date: { $gte: startOfToday, $lte: endOfToday },
    });
    
    const monthVisitors = await VisitorAnalytics.aggregate([
      {
        $match: {
          date: { $gte: startOfThisMonth, $lte: endOfThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: "$totalVisits" },
          uniqueVisitors: { $sum: "$uniqueVisitors" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        today: {
          revenue: todayRevenue,
          orders: todayOrderCount,
          visitors: todayVisitors ? todayVisitors.uniqueVisitors : 0,
        },
        month: {
          revenue: monthRevenue,
          orders: monthOrderCount,
          visitors: monthVisitors.length > 0 ? monthVisitors[0].uniqueVisitors : 0,
        },
        inventory: inventorySummary.length > 0 ? inventorySummary[0] : {
          totalProducts: 0,
          totalStock: 0,
          lowStock: 0,
          outOfStock: 0,
        },
        recentOrders,
        topProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}; 