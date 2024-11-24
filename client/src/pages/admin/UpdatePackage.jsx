import React, { useEffect, useState } from "react";
import { app } from "../../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useNavigate, useParams } from "react-router";

const UpdatePackage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "",
    packageTransportation: "",
    packageMeals: "",
    packageActivities: "",
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageImages: [],
  });
  const [images, setImages] = useState([]);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUploadPercent, setImageUploadPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getPackageData = async () => {
    try {
      const res = await fetch(`/api/package/get-package-data/${params?.id}`);
      const data = await res.json();
      if (data?.success) {
        // console.log(data);
        setFormData({
          packageName: data?.packageData?.packageName,
          packageDescription: data?.packageData?.packageDescription,
          packageDestination: data?.packageData?.packageDestination,
          packageDays: data?.packageData?.packageDays,
          packageNights: data?.packageData?.packageNights,
          packageAccommodation: data?.packageData?.packageAccommodation,
          packageTransportation: data?.packageData?.packageTransportation,
          packageMeals: data?.packageData?.packageMeals,
          packageActivities: data?.packageData?.packageActivities,
          packagePrice: data?.packageData?.packagePrice,
          packageDiscountPrice: data?.packageData?.packageDiscountPrice,
          packageOffer: data?.packageData?.packageOffer,
          packageImages: data?.packageData?.packageImages,
        });
      } else {
        alert(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (params.id) getPackageData();
  }, [params.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (e.target.type === "checkbox") {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    }
  };

  const handleImageSubmit = () => {
    if (
      images.length > 0 &&
      images.length + formData.packageImages.length < 6
    ) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < images.length; i++) {
        promises.push(storeImage(images[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            packageImages: formData.packageImages.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2mb max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 5 images per package");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadPercent(Math.floor(progress));
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleDeleteImage = (index) => {
    setFormData({
      ...formData,
      packageImages: formData.packageImages.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.packageImages.length === 0) {
      alert("You must upload atleast 1 image");
      return;
    }
    if (
      formData.packageName === "" ||
      formData.packageDescription === "" ||
      formData.packageDestination === "" ||
      formData.packageAccommodation === "" ||
      formData.packageTransportation === "" ||
      formData.packageMeals === "" ||
      formData.packageActivities === "" ||
      formData.packagePrice === 0
    ) {
      alert("All fields are required!");
      return;
    }
    if (formData.packagePrice < 0) {
      alert("Price should be greater than 500!");
      return;
    }
    if (formData.packageDiscountPrice >= formData.packagePrice) {
      alert("Regular Price should be greater than Discount Price!");
      return;
    }
    if (formData.packageOffer === false) {
      setFormData({ ...formData, packageDiscountPrice: 0 });
    }
    try {
      setLoading(true);
      setError(false);

      const res = await fetch(`/api/package/update-package/${params?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data?.success === false) {
        setError(data?.message);
        setLoading(false);
      }
      setLoading(false);
      setError(false);
      alert(data?.message);
      // getPackageData();
      // setImages([]);
      navigate(`/package/${params?.id}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full p-4 sm:p-8">
  <div className="bg-slate-100 rounded-lg shadow-lg p-6 sm:p-8">
    <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
      Update Package
    </h2>
    <div className="w-full flex">
    <form onSubmit={handleSubmit} className="space-y-6 w-[70%] pr-10 ">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="packageName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
          <label
            htmlFor="packageDestination"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
          <label
            htmlFor="packageDays"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
          <label
            htmlFor="packageNights"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
          <label
            htmlFor="packagePrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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

        {formData.packageOffer && (
          <div>
            <label
              htmlFor="packageDiscountPrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
        )}

        <div>
          <label
            htmlFor="packageAccommodation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
          <label
            htmlFor="packageTransportation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Transportation
          </label>
          <select
            id="packageTransportation"
            name="packageTransportation"
            value={formData.packageTransportation}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="Flight">Flight</option>
            <option value="Train">Train</option>
            <option value="Boat">Boat</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="packageMeals"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Meals
        </label>
        <textarea
          id="packageMeals"
          name="packageMeals"
          value={formData.packageMeals}
          onChange={handleChange}
          required
          rows="2"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="packageActivities"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Activities
        </label>
        <textarea
          id="packageActivities"
          name="packageActivities"
          value={formData.packageActivities}
          onChange={handleChange}
          required
          rows="2"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="packageDescription"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
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
        <label
          htmlFor="packageOffer"
          className="text-sm font-medium text-gray-700"
        >
          Special Offer
        </label>
        
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
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {loading ? 'Updating...' : 'Update Package'}
        </button>
      </div>
    </form>
    <div className="shadow-md rounded-xl p-3 h-max flex flex-col gap-2 bg-white">
           <div className="flex flex-col w-full">
             <label htmlFor="packageImages">
               Images:
             <span className="text-red-700 text-sm">
                 (images size should be less than 2mb and max 5 images)
               </span>
             </label>
             <input
               type="file"
               className="border border-black rounded"
              id="packageImages"
              multiple
               onChange={(e) => setImages(e.target.files)}
             />
           </div>
           {formData?.packageImages?.length > 0 && (
             <div className="p-3 w-full flex flex-col justify-center">
               {formData.packageImages.map((image, i) => {
                 return (
                   <div
                    key={i}
                     className="shadow-xl rounded-lg p-1 flex flex-wrap my-2 justify-between"
                   >
                     <img src={image} alt="" className="h-20 w-20 rounded" />
                     <button
                       onClick={() => handleDeleteImage(i)}
                       className="p-2 text-red-500 hover:cursor-pointer hover:underline"
                     >
                       Delete
                     </button>
                   </div>
                 );
               })}
             </div>
           )}
           <button
            disabled={uploading || loading || images.length === 0}
            className="bg-blue-700 p-3 rounded text-white hover:opacity-95 disabled:opacity-80 w-full"
            type="button"
            onClick={handleImageSubmit}
             >
             {uploading
               ? `Uploading...(${imageUploadPercent}%)`
               : loading
               ? "Loading..."
               : "Upload Images"}
           </button>
         </div>

    </div>

  </div>
</div>

    
  );
};

export default UpdatePackage;
