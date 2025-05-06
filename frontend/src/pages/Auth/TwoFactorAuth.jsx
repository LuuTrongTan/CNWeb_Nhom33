import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

const TwoFactorAuth = () => {
  const { verify2FA } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Get userId from location state
  const userId = location.state?.userId;

  // If no userId, redirect to login
  if (!userId) {
    navigate('/login');
    return null;
  }

  // Form validation schema
  const validationSchema = Yup.object({
    token: Yup.string()
      .required('Verification code is required')
      .matches(/^[0-9]{6}$/, 'Code must be 6 digits')
  });

  // Formik form handler
  const formik = useFormik({
    initialValues: {
      token: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);

      try {
        // Verify 2FA token
        await verify2FA(userId, values.token);
      } catch (error) {
        console.error('2FA verification error:', error);
        setError(error.message || 'Invalid verification code');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h1>
          <p className="mt-2 text-gray-600">
            Enter the verification code from your authenticator app
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div>
            <label htmlFor="token" className="form-label">
              Verification Code
            </label>
            <input
              id="token"
              name="token"
              type="text"
              autoComplete="one-time-code"
              className={`form-control ${
                formik.touched.token && formik.errors.token ? 'border-red-500' : ''
              }`}
              placeholder="Enter 6-digit code"
              maxLength={6}
              {...formik.getFieldProps('token')}
            />
            {formik.touched.token && formik.errors.token && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.token}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth; 