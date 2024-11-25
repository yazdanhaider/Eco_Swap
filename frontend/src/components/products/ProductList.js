import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Box,
  Pagination,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { getProducts } from '../../redux/slices/productSlice';
import ProductCard from './ProductCard';

const categories = ['All', 'Electronics', 'Furniture', 'Clothing', 'Books', 'Others'];
const conditions = ['All', 'New', 'Like New', 'Good', 'Fair', 'Poor'];

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, isLoading, totalPages, currentPage } = useSelector(
    (state) => state.products
  );
  const [filters, setFilters] = useState({
    category: 'All',
    condition: 'All',
    page: 1,
  });

  useEffect(() => {
    const queryFilters = {
      ...(filters.category !== 'All' && { category: filters.category }),
      ...(filters.condition !== 'All' && { condition: filters.condition }),
      page: filters.page,
    };
    dispatch(getProducts(queryFilters));
  }, [dispatch, filters]);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
      page: 1,
    });
  };

  const handlePageChange = (event, value) => {
    setFilters({
      ...filters,
      page: value,
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Products
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Category"
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Condition"
          name="condition"
          value={filters.condition}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          {conditions.map((condition) => (
            <MenuItem key={condition} value={condition}>
              {condition}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product._id} xs={12} sm={6} md={4}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      {products.length === 0 && (
        <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
          No products found
        </Typography>
      )}

      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default ProductList; 