import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchProducts, getAllCategories } from '../api/product.api';
import { toast } from 'react-toastify';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  Button,
} from '@mui/material';
import { Search, Sort, FilterList } from '@mui/icons-material';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get('category') || ''
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          searchProducts(query, {
            page,
            limit,
            sort: sortBy,
            category: categoryFilter,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
          }),
          getAllCategories(),
        ]);
        setProducts(productsData.products);
        setTotalPages(Math.ceil(productsData.total / limit));
        setCategories(categoriesData);
      } catch (error) {
        toast.error(error.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, page, sortBy, categoryFilter, priceRange]);

  const handlePageChange = (event, value) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: value });
  };

  const handleSortChange = (event) => {
    const newSort = event.target.value;
    setSortBy(newSort);
    setSearchParams({ ...Object.fromEntries(searchParams), sort: newSort });
  };

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setCategoryFilter(newCategory);
    setSearchParams({ ...Object.fromEntries(searchParams), category: newCategory });
  };

  const handlePriceChange = (type, value) => {
    const newPriceRange = { ...priceRange, [type]: value };
    setPriceRange(newPriceRange);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      minPrice: newPriceRange.min,
      maxPrice: newPriceRange.max,
    });
  };

  const clearFilters = () => {
    setSortBy('newest');
    setCategoryFilter('');
    setPriceRange({ min: '', max: '' });
    setSearchParams({ q: query });
  };

  if (loading) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Kết quả tìm kiếm cho "{query}"
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                label="Sắp xếp"
                startAdornment={
                  <InputAdornment position="start">
                    <Sort />
                  </InputAdornment>
                }
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
                <MenuItem value="price-asc">Giá tăng dần</MenuItem>
                <MenuItem value="price-desc">Giá giảm dần</MenuItem>
                <MenuItem value="name-asc">Tên A-Z</MenuItem>
                <MenuItem value="name-desc">Tên Z-A</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={categoryFilter}
                onChange={handleCategoryChange}
                label="Danh mục"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                }
              >
                <MenuItem value="">Tất cả</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Giá tối thiểu"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">đ</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Giá tối đa"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">đ</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        </Box>
      </Box>

      {/* Active Filters */}
      <Box sx={{ mb: 3 }}>
        {sortBy !== 'newest' && (
          <Chip
            label={`Sắp xếp: ${
              {
                'price-asc': 'Giá tăng dần',
                'price-desc': 'Giá giảm dần',
                'name-asc': 'Tên A-Z',
                'name-desc': 'Tên Z-A',
              }[sortBy]
            }`}
            onDelete={() => setSortBy('newest')}
            sx={{ mr: 1, mb: 1 }}
          />
        )}
        {categoryFilter && (
          <Chip
            label={`Danh mục: ${
              categories.find((cat) => cat._id === categoryFilter)?.name
            }`}
            onDelete={() => setCategoryFilter('')}
            sx={{ mr: 1, mb: 1 }}
          />
        )}
        {priceRange.min && (
          <Chip
            label={`Giá từ: ${priceRange.min}đ`}
            onDelete={() => handlePriceChange('min', '')}
            sx={{ mr: 1, mb: 1 }}
          />
        )}
        {priceRange.max && (
          <Chip
            label={`Giá đến: ${priceRange.max}đ`}
            onDelete={() => handlePriceChange('max', '')}
            sx={{ mr: 1, mb: 1 }}
          />
        )}
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.images[0]}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" noWrap>
                  {product.name}
                </Typography>
                <Typography variant="h6" color="primary">
                  {product.price.toLocaleString('vi-VN')}đ
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Đã bán: {product.sold}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default SearchPage; 