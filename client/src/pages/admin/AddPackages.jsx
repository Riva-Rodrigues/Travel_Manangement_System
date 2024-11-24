
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreatePackageForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    packageName: '',
    packageDescription: '',
    packageDestination: '',
    packageDays: '',
    packageNights: '',
    packageAccommodation: '',
    packageTransportation: '',
    packageMeals: '',
    packageActivities: '',
    packagePrice: '',
    packageDiscountPrice: '',
    packageOffer: false,
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append images
      images.forEach(image => {
        formDataToSend.append('packageImages', image);
      });

      const response = await axios.post('http://localhost:8000/api/package/create-package', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.data.success) {
	alert('Package created successfully!');
        navigate('/profile/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-8">
      <div className="bg-slate-100 rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Create New Package
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="packageName" className="block text-sm font-medium text-gray-700 mb-1">
                Package Name
              </label>
              <input
                type="text"
                id="packageName"
                name="packageName"
                value={formData.packageName}
                onChange={handleChange}
                required
                minLength={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="packageDestination" className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                id="packageDestination"
                name="packageDestination"
                value={formData.packageDestination}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="packageDays" className="block text-sm font-medium text-gray-700 mb-1">
                Days
              </label>
              <input
                type="number"
                id="packageDays"
                name="packageDays"
                value={formData.packageDays}
                onChange={handleChange}
                required
                min="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="packageNights" className="block text-sm font-medium text-gray-700 mb-1">
                Nights
              </label>
              <input
                type="number"
                id="packageNights"
                name="packageNights"
                value={formData.packageNights}
                onChange={handleChange}
                required
                min="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="packagePrice" className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                id="packagePrice"
                name="packagePrice"
                value={formData.packagePrice}
                onChange={handleChange}
                required
                min="0"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="packageDiscountPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price
              </label>
              <input
                type="number"
                id="packageDiscountPrice"
                name="packageDiscountPrice"
                value={formData.packageDiscountPrice}
                onChange={handleChange}
                required
                min="0"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="packageAccommodation" className="block text-sm font-medium text-gray-700 mb-1">
                Accommodation
              </label>
              <input
                type="text"
                id="packageAccommodation"
                name="packageAccommodation"
                value={formData.packageAccommodation}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="packageTransportation" className="block text-sm font-medium text-gray-700 mb-1">
                Transportation
              </label>
              <input
                type="text"
                id="packageTransportation"
                name="packageTransportation"
                value={formData.packageTransportation}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="packageMeals" className="block text-sm font-medium text-gray-700 mb-1">
              Meals
            </label>
            <input
              type="text"
              id="packageMeals"
              name="packageMeals"
              value={formData.packageMeals}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="packageActivities" className="block text-sm font-medium text-gray-700 mb-1">
              Activities
            </label>
            <input
              type="text"
              id="packageActivities"
              name="packageActivities"
              value={formData.packageActivities}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="packageDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="packageDescription"
              name="packageDescription"
              value={formData.packageDescription}
              onChange={handleChange}
              required
              rows="4"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="packageOffer"
              name="packageOffer"
              checked={formData.packageOffer}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="packageOffer" className="text-sm font-medium text-gray-700">
              Special Offer
            </label>
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Package Images
            </label>
            <input
              type="file"
              id="images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/profile/admin')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {loading ? 'Creating...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePackageForm;
