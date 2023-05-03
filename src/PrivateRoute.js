import { useContext } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export const PrivateRoute = ({ element, ...rest }) => {
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <Route
            {...rest}
            element={isAuthenticated ? element : <Navigate to="/login" />}
        />
    );
};