import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  MenuItem,
} from '@mui/material';
import { CloudUpload } from '../utils/icons';
import { createProduct } from '../redux/slices/productSlice';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  category: Yup.string().required('Category is required'),
  condition: Yup.string().required('Condition is required'),
  location: Yup.string().required('Location is required'),
});

const categories = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Others'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const ProductForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.products);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);

    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      condition: '',
      location: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        
        // Append form fields
        Object.keys(values).forEach(key => {
          formData.append(key, values[key]);
        });
        
        // Append images
        selectedImages.forEach(image => {
          formData.append('images', image);
        });

        const result = await dispatch(createProduct(formData));
        if (!result.error) {
          navigate('/products');
        }
      } catch (error) {
        console.error('Error creating product:', error);
      }
    },
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          List a New Item
        </Typography>

        <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Input
                name="title"
                label="Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12}>
              <Input
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Input
                select
                name="category"
                label="Category"
                value={formik.values.category}
                onChange={formik.handleChange}
                error={formik.touched.category && formik.errors.category}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Input>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Input
                select
                name="condition"
                label="Condition"
                value={formik.values.condition}
                onChange={formik.handleChange}
                error={formik.touched.condition && formik.errors.condition}
              >
                {conditions.map((condition) => (
                  <MenuItem key={condition} value={condition}>
                    {condition}
                  </MenuItem>
                ))}
              </Input>
            </Grid>

            <Grid item xs={12}>
              <Input
                name="location"
                label="Location"
                value={formik.values.location}
                onChange={formik.handleChange}
                error={formik.touched.location && formik.errors.location}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {previewUrls.map((url, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={url}
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                loading={isLoading}
                fullWidth
              >
                List Item
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ProductForm; 