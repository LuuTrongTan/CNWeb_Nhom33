import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/auth.service';
import { addAddress, updateAddress, deleteAddress } from '../../services/address.service';

const Profile = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Set addresses from current user when component mounts
  useEffect(() => {
    if (currentUser && currentUser.addresses) {
      setAddresses(currentUser.addresses);
    }
  }, [currentUser]);

  // Profile form validation schema
  const profileValidationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    phone: Yup.string().nullable(),
    bio: Yup.string().nullable()
  });

  // Address form validation schema
  const addressValidationSchema = Yup.object({
    street: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('Zip code is required'),
    country: Yup.string().required('Country is required'),
    isDefault: Yup.boolean()
  });

  // Profile form
  const profileForm = useFormik({
    initialValues: {
      name: currentUser?.name || '',
      phone: currentUser?.profile?.phone || '',
      bio: currentUser?.profile?.bio || ''
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await updateUserProfile(values);
        toast.success('Profile updated successfully');
      } catch (error) {
        console.error('Update profile error:', error);
        toast.error(error.message || 'Failed to update profile');
      } finally {
        setIsLoading(false);
      }
    }
  });

  // New address form
  const addressForm = useFormik({
    initialValues: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    },
    validationSchema: addressValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        if (editingAddressId) {
          // Update existing address
          const response = await updateAddress(editingAddressId, values);
          setAddresses(response.addresses);
          toast.success('Address updated successfully');
          setEditingAddressId(null);
        } else {
          // Add new address
          const response = await addAddress(values);
          setAddresses(response.addresses);
          toast.success('Address added successfully');
        }
        resetForm();
        setIsAddingAddress(false);
      } catch (error) {
        console.error('Address form error:', error);
        toast.error(error.message || 'Failed to save address');
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Handle edit address
  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    addressForm.setValues({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault || false
    });
    setIsAddingAddress(true);
  };

  // Handle delete address
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setIsLoading(true);
      try {
        const response = await deleteAddress(addressId);
        setAddresses(response.addresses);
        toast.success('Address deleted successfully');
      } catch (error) {
        console.error('Delete address error:', error);
        toast.error(error.message || 'Failed to delete address');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Cancel address form
  const handleCancelAddress = () => {
    addressForm.resetForm();
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {/* Profile Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Personal Information
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'addresses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('addresses')}
          >
            Addresses
          </button>
        </nav>
      </div>

      {/* Personal Information */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <form onSubmit={profileForm.handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${
                    profileForm.touched.name && profileForm.errors.name
                      ? 'border-red-500'
                      : ''
                  }`}
                  {...profileForm.getFieldProps('name')}
                />
                {profileForm.touched.name && profileForm.errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {profileForm.errors.name}
                  </p>
                )}
              </div>

              {/* Email (read only) */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={currentUser?.email || ''}
                  className="form-control bg-gray-50"
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">
                  Your email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  {...profileForm.getFieldProps('phone')}
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="form-label">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  className="form-control"
                  placeholder="Tell us a little about yourself"
                  {...profileForm.getFieldProps('bio')}
                ></textarea>
              </div>

              {/* Submit button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Addresses */}
      {activeTab === 'addresses' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Shipping Addresses</h2>
            {!isAddingAddress && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsAddingAddress(true)}
              >
                Add New Address
              </button>
            )}
          </div>

          {/* Address Form */}
          {isAddingAddress && (
            <div className="mb-8 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-4">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <form onSubmit={addressForm.handleSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Street */}
                  <div className="md:col-span-2">
                    <label htmlFor="street" className="form-label">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      className={`form-control ${
                        addressForm.touched.street && addressForm.errors.street
                          ? 'border-red-500'
                          : ''
                      }`}
                      {...addressForm.getFieldProps('street')}
                    />
                    {addressForm.touched.street && addressForm.errors.street && (
                      <p className="mt-1 text-sm text-red-500">
                        {addressForm.errors.street}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className={`form-control ${
                        addressForm.touched.city && addressForm.errors.city
                          ? 'border-red-500'
                          : ''
                      }`}
                      {...addressForm.getFieldProps('city')}
                    />
                    {addressForm.touched.city && addressForm.errors.city && (
                      <p className="mt-1 text-sm text-red-500">
                        {addressForm.errors.city}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="state" className="form-label">
                      State/Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className={`form-control ${
                        addressForm.touched.state && addressForm.errors.state
                          ? 'border-red-500'
                          : ''
                      }`}
                      {...addressForm.getFieldProps('state')}
                    />
                    {addressForm.touched.state && addressForm.errors.state && (
                      <p className="mt-1 text-sm text-red-500">
                        {addressForm.errors.state}
                      </p>
                    )}
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label htmlFor="zipCode" className="form-label">
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      className={`form-control ${
                        addressForm.touched.zipCode && addressForm.errors.zipCode
                          ? 'border-red-500'
                          : ''
                      }`}
                      {...addressForm.getFieldProps('zipCode')}
                    />
                    {addressForm.touched.zipCode && addressForm.errors.zipCode && (
                      <p className="mt-1 text-sm text-red-500">
                        {addressForm.errors.zipCode}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="form-label">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      className={`form-control ${
                        addressForm.touched.country && addressForm.errors.country
                          ? 'border-red-500'
                          : ''
                      }`}
                      {...addressForm.getFieldProps('country')}
                    />
                    {addressForm.touched.country && addressForm.errors.country && (
                      <p className="mt-1 text-sm text-red-500">
                        {addressForm.errors.country}
                      </p>
                    )}
                  </div>

                  {/* Default Address Checkbox */}
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="isDefault"
                        name="isDefault"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={addressForm.values.isDefault}
                        onChange={addressForm.handleChange}
                      />
                      <label
                        htmlFor="isDefault"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Set as default shipping address
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelAddress}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses List */}
          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between"
                >
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <span className="font-medium">{`${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`}</span>
                      {address.isDefault && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() => handleEditAddress(address)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      onClick={() => handleDeleteAddress(address._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't added any addresses yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile; 