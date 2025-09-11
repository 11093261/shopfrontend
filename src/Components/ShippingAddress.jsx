
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { createOrUpdateShipping, clearSaveError } from '../Components/OrderShipping';
const ShippingAdddress = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { saveLoading, saveError, selectedShipping } = useSelector((state) => state.shipping);
  console.log(selectedShipping)
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [error, setError] = useState('');
  useEffect(() => {
    if (selectedShipping) {
      Object.keys(selectedShipping).forEach(key => {
        setValue(key, selectedShipping[key]);
      });
    }
  }, [selectedShipping, setValue]);
  useEffect(() => {
    dispatch(clearSaveError());
  }, [dispatch]);

  const onsubmit = async (formData) => {
    try {
      setError('');
      
      const shippingData = {
        shippingAddress: {
          fullName: formData.fullName,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          phone: formData.phone
        },
      };
      console.log(createOrUpdateShipping)
      console.log(dispatch(createOrUpdateShipping(shippingData)))
      const result = await dispatch(createOrUpdateShipping(shippingData));
      if (createOrUpdateShipping.fulfilled.match(result)){
        navigate('/order');
        reset()
      } else if (createOrUpdateShipping.rejected.match(result)) {
        setError(result.payload || 'Failed to save shipping information');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Shipping Information</h1>
      {(error || saveError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error || saveError}
        </div>
      )}
      <form onSubmit={handleSubmit(onsubmit)} className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              {...register("fullName", { required: "Full name is required" })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName.message}</span>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2" htmlFor="street">
              Street Address
            </label>
            <input
              id="street"
              type="text"
              {...register("street", { required: "Street address is required" })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.street && <span className="text-red-500 text-sm">{errors.street.message}</span>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="city">
              City
            </label>
            <input
              type="text"
              id="city"
              {...register("city", { required: "City is required" })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="state">
              State
            </label>
            <input
              type="text"
              id="state"
              {...register("state", { required: "State is required" })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.state && <span className="text-red-500 text-sm">{errors.state.message}</span>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="zip">
              ZIP Code
            </label>
            <input
              type="text"
              id="zip"
              {...register("zip", { required: "ZIP code is required" })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.zip && <span className="text-red-500 text-sm">{errors.zip.message}</span>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone", { required: "Phone number is required" })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate('/order')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Order
          </button>
          <button
            type="submit"
            disabled={saveLoading}
            className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ${saveLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saveLoading ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingAdddress