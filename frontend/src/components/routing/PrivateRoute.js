import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute; 