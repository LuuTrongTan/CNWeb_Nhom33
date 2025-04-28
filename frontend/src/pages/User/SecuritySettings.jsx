import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { updatePassword, setupTwoFactor, enableTwoFactor, disableTwoFactor } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';

const SecuritySettings = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [is2faEnabled, setIs2faEnabled] = useState(false);

  // Check if 2FA is already enabled
  useEffect(() => {
    if (currentUser && currentUser.twoFactorAuth) {
      setIs2faEnabled(currentUser.twoFactorAuth.enabled);
    }
  }, [currentUser]);

  // Password validation schema
  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .required('New password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  // 2FA verification code validation schema
  const verificationCodeSchema = Yup.object({
    verificationCode: Yup.string()
      .required('Verification code is required')
      .matches(/^[0-9]{6}$/, 'Code must be 6 digits')
  });

  // Password change form
  const passwordForm = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        await updatePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        });
        toast.success('Password updated successfully');
        resetForm();
      } catch (error) {
        console.error('Password update error:', error);
        toast.error(error.message || 'Failed to update password');
      } finally {
        setIsLoading(false);
      }
    }
  });

  // 2FA verification form
  const verificationForm = useFormik({
    initialValues: {
      verificationCode: ''
    },
    validationSchema: verificationCodeSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        await enableTwoFactor(values.verificationCode);
        toast.success('Two-factor authentication enabled successfully');
        setIs2faEnabled(true);
        setTwoFactorSetup(null);
        resetForm();
      } catch (error) {
        console.error('2FA enable error:', error);
        toast.error(error.message || 'Failed to enable two-factor authentication');
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Handle setup 2FA
  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const response = await setupTwoFactor();
      setTwoFactorSetup(response);
    } catch (error) {
      console.error('2FA setup error:', error);
      toast.error(error.message || 'Failed to set up two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disable 2FA
  const handleDisable2FA = async () => {
    if (window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      setIsLoading(true);
      try {
        await disableTwoFactor();
        toast.success('Two-factor authentication disabled successfully');
        setIs2faEnabled(false);
      } catch (error) {
        console.error('2FA disable error:', error);
        toast.error(error.message || 'Failed to disable two-factor authentication');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>

      {/* Security Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === '2fa'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('2fa')}
          >
            Two-Factor Authentication
          </button>
        </nav>
      </div>

      {/* Change Password */}
      {activeTab === 'password' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  className={`form-control ${
                    passwordForm.touched.currentPassword && passwordForm.errors.currentPassword
                      ? 'border-red-500'
                      : ''
                  }`}
                  {...passwordForm.getFieldProps('currentPassword')}
                />
                {passwordForm.touched.currentPassword && passwordForm.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordForm.errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className={`form-control ${
                    passwordForm.touched.newPassword && passwordForm.errors.newPassword
                      ? 'border-red-500'
                      : ''
                  }`}
                  {...passwordForm.getFieldProps('newPassword')}
                />
                {passwordForm.touched.newPassword && passwordForm.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordForm.errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-control ${
                    passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword
                      ? 'border-red-500'
                      : ''
                  }`}
                  {...passwordForm.getFieldProps('confirmPassword')}
                />
                {passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordForm.errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Two-Factor Authentication */}
      {activeTab === '2fa' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-600 mt-1">
                Add an extra layer of security to your account by requiring a verification code.
              </p>
            </div>
            {is2faEnabled ? (
              <div className="mt-4 md:mt-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                  Enabled
                </span>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDisable2FA}
                  disabled={isLoading}
                >
                  {isLoading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            ) : (
              <div className="mt-4 md:mt-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                  Disabled
                </span>
                {!twoFactorSetup && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSetup2FA}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Setting up...' : 'Enable 2FA'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2FA Setup Instructions */}
          {twoFactorSetup && !is2faEnabled && (
            <div className="p-4 border rounded-lg bg-gray-50 mb-6">
              <h3 className="text-lg font-medium mb-4">Set up Two-Factor Authentication</h3>

              <ol className="list-decimal list-inside space-y-4 mb-6">
                <li>
                  <span className="font-medium">Download an authenticator app</span>
                  <p className="text-sm text-gray-600 mt-1 ml-5">
                    Download and install an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy.
                  </p>
                </li>
                <li>
                  <span className="font-medium">Scan the QR code below</span>
                  <div className="mt-2 ml-5 p-4 bg-white inline-block border">
                    <img src={twoFactorSetup.qrCode} alt="2FA QR Code" className="max-w-xs" />
                  </div>
                </li>
                <li>
                  <span className="font-medium">Enter the verification code</span>
                  <p className="text-sm text-gray-600 mt-1 ml-5">
                    Enter the 6-digit code from your authenticator app to verify and enable 2FA.
                  </p>
                </li>
              </ol>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Secret key: </span>
                  {twoFactorSetup.secret}
                </p>
                <p className="text-xs text-gray-500">
                  If you can't scan the QR code, you can manually enter this secret key in your authenticator app.
                </p>
              </div>

              {/* Verification form */}
              <form onSubmit={verificationForm.handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="verificationCode" className="form-label">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    maxLength={6}
                    className={`form-control w-full md:w-1/3 ${
                      verificationForm.touched.verificationCode && verificationForm.errors.verificationCode
                        ? 'border-red-500'
                        : ''
                    }`}
                    placeholder="Enter 6-digit code"
                    {...verificationForm.getFieldProps('verificationCode')}
                  />
                  {verificationForm.touched.verificationCode && verificationForm.errors.verificationCode && (
                    <p className="mt-1 text-sm text-red-500">
                      {verificationForm.errors.verificationCode}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setTwoFactorSetup(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Info cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-md font-medium text-blue-800 mb-2">
                What is two-factor authentication?
              </h3>
              <p className="text-sm text-blue-700">
                Two-factor authentication adds an additional layer of security to your account by requiring a verification code in addition to your password when you sign in.
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-md font-medium text-yellow-800 mb-2">
                Keep your recovery codes safe
              </h3>
              <p className="text-sm text-yellow-700">
                If you lose access to your authenticator app, you'll need recovery codes to regain access to your account. Store them in a secure location.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings; 