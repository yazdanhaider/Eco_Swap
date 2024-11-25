import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import {
  SwapHoriz,
  EcoRounded,
  LocationOn,
  GroupAdd,
} from '../utils/icons';
import ProductList from '../components/products/ProductList';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SwapHoriz fontSize="large" color="primary" />,
      title: 'Easy Exchange',
      description: 'Simple and secure way to exchange items with others',
    },
    {
      icon: <EcoRounded fontSize="large" color="primary" />,
      title: 'Sustainable Living',
      description: 'Reduce waste and promote environmental consciousness',
    },
    {
      icon: <LocationOn fontSize="large" color="primary" />,
      title: 'Local Community',
      description: 'Connect with people in your area for convenient exchanges',
    },
    {
      icon: <GroupAdd fontSize="large" color="primary" />,
      title: 'Growing Network',
      description: 'Join a community of environmentally conscious individuals',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Exchange Items,
                <br />
                Save the Planet
              </Typography>
              <Typography variant="h5" paragraph>
                Join our sustainable community and give your unused items a second life
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/products/new')}
                sx={{ mr: 2 }}
              >
                List an Item
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => navigate('/products')}
              >
                Browse Items
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  bgcolor: 'transparent',
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Recent Products Section */}
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom>
          Recent Items
        </Typography>
        <ProductList />
      </Container>
    </Box>
  );
};

export default Home; 