import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Tab,
  Tabs,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { Person, SwapHoriz, Star, Edit, PhotoCamera } from '@mui/icons-material';
import ProductCard from '../components/products/ProductCard';
import { getUserProducts } from '../redux/slices/productSlice';
import { getUserExchanges } from '../redux/slices/exchangeSlice';
import { updateProfile } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.products);
  const { exchanges } = useSelector((state) => state.exchanges);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    avatar: null
  });

  const pendingExchanges = exchanges.filter(ex => ex.status === 'Pending');
  const otherExchanges = exchanges.filter(ex => ex.status !== 'Pending');

  useEffect(() => {
    dispatch(getUserProducts());
    dispatch(getUserExchanges());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setProfileData({
      name: user.name,
      location: user.location,
      avatar: null
    });
    setEditDialogOpen(true);
  };

  const handleAvatarChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setProfileData(prev => ({
        ...prev,
        avatar: event.target.files[0]
      }));
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('location', profileData.location);
    if (profileData.avatar) {
      formData.append('avatar', profileData.avatar);
    }

    const result = await dispatch(updateProfile(formData));
    if (!result.error) {
      setEditDialogOpen(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user?.avatar}
                sx={{ width: 100, height: 100 }}
              >
                <Person sx={{ width: 60, height: 60 }} />
              </Avatar>
              <IconButton
                color="primary"
                onClick={handleEditProfile}
                sx={{ position: 'absolute', bottom: -10, right: -10 }}
              >
                <Edit />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {user?.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="body1" color="text.secondary">
                {user?.location}
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SwapHoriz color="action" />
                <Typography>{user?.exchangeCount || 0} Exchanges</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star color="action" />
                <Typography>{(user?.rating || 0).toFixed(1)} Rating</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={3}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="My Products" />
          <Tab 
            label={`Exchange Requests (${pendingExchanges.length})`} 
            sx={{ 
              color: pendingExchanges.length > 0 ? 'primary.main' : 'inherit',
              fontWeight: pendingExchanges.length > 0 ? 'bold' : 'normal',
            }}
          />
          <Tab label="Exchange History" />
        </Tabs>

        {/* My Products Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {products.length > 0 ? (
              products.map((product) => (
                <Grid item key={product._id} xs={12} sm={6} md={4}>
                  <ProductCard product={product} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography align="center">No products listed yet</Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Pending Exchanges Tab */}
        <TabPanel value={tabValue} index={1}>
          {pendingExchanges.length > 0 ? (
            pendingExchanges.map((exchange) => (
              <Paper key={exchange._id} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Box
                      component="img"
                      src={exchange.product.images[0]}
                      alt={exchange.product.title}
                      sx={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6">{exchange.product.title}</Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Request Type: {exchange.type === 'exchange' ? 'Exchange' : 'Donation'}
                    </Typography>
                    {exchange.type === 'exchange' && (
                      <Typography variant="body2" gutterBottom>
                        Offered Item: {exchange.exchangeItemDetails}
                      </Typography>
                    )}
                    <Typography variant="body2" gutterBottom>
                      Message: {exchange.message}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/exchange/${exchange._id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))
          ) : (
            <Typography align="center" sx={{ py: 3 }}>
              No pending exchange requests
            </Typography>
          )}
        </TabPanel>

        {/* Exchange History Tab */}
        <TabPanel value={tabValue} index={2}>
          {otherExchanges.length > 0 ? (
            otherExchanges.map((exchange) => (
              <Paper key={exchange._id} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Box
                      component="img"
                      src={exchange.product.images[0]}
                      alt={exchange.product.title}
                      sx={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6">{exchange.product.title}</Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Status: {exchange.status}
                    </Typography>
                    {exchange.meetupLocation && (
                      <Typography variant="body2">
                        Meetup Location: {exchange.meetupLocation}
                      </Typography>
                    )}
                    {exchange.meetupTime && (
                      <Typography variant="body2">
                        Meetup Time: {new Date(exchange.meetupTime).toLocaleString()}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            ))
          ) : (
            <Typography align="center">No exchange history</Typography>
          )}
        </TabPanel>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <Avatar
                  src={profileData.avatar ? URL.createObjectURL(profileData.avatar) : user?.avatar}
                  sx={{ width: 100, height: 100, margin: 'auto', cursor: 'pointer' }}
                >
                  <PhotoCamera />
                </Avatar>
              </label>
            </Box>
            <TextField
              label="Name"
              fullWidth
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Location"
              fullWidth
              value={profileData.location}
              onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 