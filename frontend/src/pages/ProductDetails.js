import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import { Person, LocationOn, SwapHoriz, CardGiftcard as Gift } from '@mui/icons-material';
import { getProductById } from '../redux/slices/productSlice';
import { createExchange } from '../redux/slices/exchangeSlice';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct: product, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [exchangeType, setExchangeType] = useState('exchange');
  const [exchangeItem, setExchangeItem] = useState(null);
  const [openExchangeDialog, setOpenExchangeDialog] = useState(false);

  useEffect(() => {
    dispatch(getProductById(id));
  }, [dispatch, id]);

  const handleExchangeTypeChange = (event) => {
    setExchangeType(event.target.value);
  };

  const handleExchangeRequest = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setOpenExchangeDialog(true);
  };

  const handleSubmitRequest = async () => {
    const exchangeData = {
      productId: id,
      message,
      type: exchangeType,
      exchangeItemDetails: exchangeType === 'exchange' ? exchangeItem : null,
    };

    const result = await dispatch(createExchange(exchangeData));
    if (!result.error) {
      setOpenExchangeDialog(false);
      setMessage('');
      setExchangeItem(null);
      navigate(`/exchange/${result.payload._id}`);
    }
  };

  const getImageUrl = (imagePath) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${process.env.REACT_APP_API_URL.replace('/api', '')}/${imagePath}`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container>
        <Typography>Product not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {product.images.map((image, index) => (
              <Paper
                key={index}
                sx={{
                  flex: 1,
                  height: 400,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(image)}
                  alt={`Product ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {product.title}
            </Typography>

            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Chip
                label={product.category}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={product.condition}
                color="secondary"
                variant="outlined"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn color="action" />
              <Typography>{product.location}</Typography>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={product.user?.avatar}>
                <Person />
              </Avatar>
              <Typography>{product.user?.name}</Typography>
            </Box>

            {user?._id !== product.user?._id && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<SwapHoriz />}
                  onClick={handleExchangeRequest}
                  sx={{ mb: 2 }}
                >
                  Request Exchange/Donation
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Exchange/Donation Request Dialog */}
      <Dialog 
        open={openExchangeDialog} 
        onClose={() => setOpenExchangeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Exchange/Donation</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Choose Request Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={exchangeType === 'exchange' ? 'contained' : 'outlined'}
                onClick={() => setExchangeType('exchange')}
                startIcon={<SwapHoriz />}
              >
                Exchange
              </Button>
              <Button
                variant={exchangeType === 'donation' ? 'contained' : 'outlined'}
                onClick={() => setExchangeType('donation')}
                startIcon={<Gift />}
              >
                Request Donation
              </Button>
            </Box>
          </Box>

          {exchangeType === 'exchange' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Exchange Item Details
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Describe your item for exchange"
                value={exchangeItem}
                onChange={(e) => setExchangeItem(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          <TextField
            autoFocus
            margin="dense"
            label={exchangeType === 'exchange' ? "Message to Owner" : "Why do you need this item?"}
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              exchangeType === 'exchange'
                ? "Introduce yourself and explain why you'd like to exchange items..."
                : "Explain why you need this item and how it would help you..."
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExchangeDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitRequest} 
            variant="contained"
            disabled={!message || (exchangeType === 'exchange' && !exchangeItem)}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetails; 