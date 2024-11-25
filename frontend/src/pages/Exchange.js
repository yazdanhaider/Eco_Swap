import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Rating,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Person, LocationOn, SwapHoriz, AccessTime } from '@mui/icons-material';
import { getExchangeById, updateExchangeStatus, submitFeedback } from '../redux/slices/exchangeSlice';
import { format } from 'date-fns';

const steps = ['Request Sent', 'Request Accepted', 'Meetup Arranged', 'Exchange Completed'];

const Exchange = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentExchange: exchange, isLoading } = useSelector((state) => state.exchanges);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [meetupDialog, setMeetupDialog] = useState(false);
  const [meetupDetails, setMeetupDetails] = useState({ location: '', time: '' });

  useEffect(() => {
    dispatch(getExchangeById(id));
  }, [dispatch, id]);

  const getActiveStep = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Accepted': return 1;
      case 'Arranged': return 2;
      case 'Completed': return 3;
      case 'Rejected': return -1;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Accepted': return 'info';
      case 'Arranged': return 'primary';
      case 'Completed': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'Arranged') {
      setMeetupDialog(true);
    } else {
      await dispatch(updateExchangeStatus({
        id,
        statusData: { status: newStatus }
      }));
    }
  };

  const handleMeetupSubmit = async () => {
    await dispatch(updateExchangeStatus({
      id,
      statusData: {
        status: 'Arranged',
        meetupLocation: meetupDetails.location,
        meetupTime: meetupDetails.time
      }
    }));
    setMeetupDialog(false);
  };

  const handleSubmitFeedback = async () => {
    if (feedback.rating === 0) {
      return;
    }
    await dispatch(submitFeedback({
      id,
      feedbackData: feedback
    }));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${process.env.REACT_APP_API_URL.replace('/api', '')}/${imagePath}`;
  };

  if (isLoading || !exchange) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isOwner = user?._id === exchange.owner._id;
  const otherParty = isOwner ? exchange.requester : exchange.owner;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Exchange Status */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {exchange.type === 'exchange' ? 'Exchange Request' : 'Donation Request'}
          </Typography>
          <Chip
            label={exchange.status}
            color={getStatusColor(exchange.status)}
            variant="outlined"
            sx={{ fontSize: '1rem', px: 2 }}
          />
        </Box>

        {exchange.status !== 'Rejected' && (
          <Stepper activeStep={getActiveStep(exchange.status)} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* Action Buttons */}
        {isOwner && exchange.status === 'Pending' && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleUpdateStatus('Accepted')}
              sx={{ mr: 2 }}
            >
              Accept Request
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleUpdateStatus('Rejected')}
            >
              Reject Request
            </Button>
          </Box>
        )}

        {isOwner && exchange.status === 'Accepted' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleUpdateStatus('Arranged')}
            fullWidth
          >
            Arrange Meetup
          </Button>
        )}

        {isOwner && exchange.status === 'Arranged' && (
          <Button
            variant="contained"
            color="success"
            onClick={() => handleUpdateStatus('Completed')}
            fullWidth
          >
            Complete {exchange.type === 'exchange' ? 'Exchange' : 'Donation'}
          </Button>
        )}
      </Paper>

      <Grid container spacing={4}>
        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Product Information
            </Typography>
            {exchange.product?.images?.length > 0 ? (
              <Box
                component="img"
                src={getImageUrl(exchange.product.images[0])}
                alt={exchange.product.title}
                sx={{
                  width: '100%',
                  height: 300,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 2,
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <Box
                component="img"
                src="/placeholder-image.jpg"
                alt="Placeholder"
                sx={{
                  width: '100%',
                  height: 300,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 2,
                }}
              />
            )}
            <Typography variant="h6">{exchange.product?.title}</Typography>
            <Typography color="text.secondary" paragraph>
              {exchange.product?.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn color="action" />
              <Typography>{exchange.product?.location}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Exchange Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Exchange Partner
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar src={otherParty.avatar}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6">{otherParty.name}</Typography>
                <Typography color="text.secondary">{otherParty.location}</Typography>
              </Box>
            </Box>

            {exchange.type === 'exchange' && exchange.exchangeItemDetails && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Offered Item
                </Typography>
                <Typography paragraph>
                  {exchange.exchangeItemDetails}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Message
            </Typography>
            <Typography paragraph>
              {exchange.message}
            </Typography>

            {(exchange.status === 'Arranged' || exchange.status === 'Completed') && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Meetup Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="action" />
                    <Typography>
                      Location: {exchange.meetupLocation}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="action" />
                    <Typography>
                      Time: {format(new Date(exchange.meetupTime), 'PPpp')}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Paper>

          {/* Feedback Section */}
          {exchange.status === 'Completed' && !exchange[isOwner ? 'ownerFeedback' : 'requesterFeedback'] && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Leave Feedback
              </Typography>
              <Rating
                value={feedback.rating}
                onChange={(event, newValue) => {
                  setFeedback({ ...feedback, rating: newValue });
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your feedback"
                value={feedback.comment}
                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitFeedback}
                startIcon={<SwapHoriz />}
              >
                Submit Feedback
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Meetup Dialog */}
      <Dialog open={meetupDialog} onClose={() => setMeetupDialog(false)}>
        <DialogTitle>Arrange Meetup</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Meetup Location"
            value={meetupDetails.location}
            onChange={(e) => setMeetupDetails({ ...meetupDetails, location: e.target.value })}
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="Meetup Time"
            value={meetupDetails.time}
            onChange={(e) => setMeetupDetails({ ...meetupDetails, time: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeetupDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleMeetupSubmit}
            variant="contained"
            disabled={!meetupDetails.location || !meetupDetails.time}
          >
            Confirm Meetup
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Exchange; 