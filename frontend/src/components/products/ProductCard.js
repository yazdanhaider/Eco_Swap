import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  Chip,
  Box,
} from '@mui/material';
import { LocationOn, SwapHoriz } from '@mui/icons-material';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  // Construct the full image URL
  const getImageUrl = (imagePath) => {
    // If the image path is already a full URL (e.g., from cloudinary), return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, construct the full URL using the backend URL
    return `${process.env.REACT_APP_API_URL.replace('/api', '')}/${imagePath}`;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.images[0] ? getImageUrl(product.images[0]) : '/placeholder-image.jpg'}
        alt={product.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {product.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.description}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={product.category}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={product.condition}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {product.location}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<SwapHoriz />}
          onClick={() => navigate(`/product/${product._id}`)}
          fullWidth
          variant="contained"
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard; 