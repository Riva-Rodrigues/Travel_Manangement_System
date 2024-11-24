import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaClock,
  FaMapMarkerAlt,
  FaShare,
  FaHotel,
  FaBicycle,
  FaUtensils,
  FaBusAlt,
} from "react-icons/fa";
import Rating from "@mui/material/Rating";
import { useSelector } from "react-redux";
import RatingCard from "./RatingCard";

const Package = () => {
  SwiperCore.use([Navigation]);
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState({
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
    packageRating: 0,
    packageTotalRatings: 0,
    packageImages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ratingsData, setRatingsData] = useState({
    rating: 0,
    review: "",
    packageId: params?.id,
    userRef: currentUser?._id,
    username: currentUser?.username,
    userProfileImg: currentUser?.avatar,
  });
  const [packageRatings, setPackageRatings] = useState([]);
  const [ratingGiven, setRatingGiven] = useState(false);

  const getPackageData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/package/get-package-data/${params?.id}`);
      const data = await res.json();
      if (data?.success) {
        setPackageData({
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
          packageRating: data?.packageData?.packageRating,
          packageTotalRatings: data?.packageData?.packageTotalRatings,
          packageImages: data?.packageData?.packageImages,
        });
        setLoading(false);
      } else {
        setError(data?.message || "Something went wrong!");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const giveRating = async () => {
    checkRatingGiven();
    if (ratingGiven) {
      alert("You already submittd your rating!");
      return;
    }
    if (ratingsData.rating === 0 && ratingsData.review === "") {
      alert("Atleast 1 field is required!");
      return;
    }
    if (
      ratingsData.rating === 0 &&
      ratingsData.review === "" &&
      !ratingsData.userRef
    ) {
      alert("All fields are required!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/rating/give-rating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingsData),
      });
      const data = await res.json();
      if (data?.success) {
        setLoading(false);
        alert(data?.message);
        getPackageData();
        getRatings();
        checkRatingGiven();
      } else {
        setLoading(false);
        alert(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getRatings = async () => {
    try {
      const res = await fetch(`/api/rating/get-ratings/${params.id}/4`);
      const data = await res.json();
      if (data) {
        setPackageRatings(data);
      } else {
        setPackageRatings("No ratings yet!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkRatingGiven = async () => {
    try {
      const res = await fetch(
        `/api/rating/rating-given/${currentUser?._id}/${params?.id}`
      );
      const data = await res.json();
      setRatingGiven(data?.given);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      getPackageData();
      getRatings();
    }
    if (currentUser) {
      checkRatingGiven();
    }
  }, [params.id, currentUser]);

  return (
    <div className="w-full">
      {loading && (
        <p className="text-center font-semibold" id="loading">
          Loading...
        </p>
      )}
      {error && (
        <div className="flex flex-col w-full items-center gap-2">
          <p className="text-center text-red-700">Something went wrong!</p>
          <Link
            className="bg-slate-600 text-white p-3 py-2 rounded-lg w-min"
            to="/"
          >
            Back
          </Link>
        </div>
      )}
      {packageData && !loading && !error && (
        <div className="w-full">
          <Swiper navigation>
            {packageData?.packageImages.map((imageUrl, i) => (
              <SwiperSlide key={i}>
                <div
                  className="h-[400px]"
                  style={{
                    background: `url(${imageUrl}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* copy button */}
          <div className="absolute top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}
          {/* back button */}
          <div className="absolute top-[13%] left-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaArrowLeft
              className="text-slate-500"
              onClick={() => {
                navigate("/");
              }}
            />
          </div>
          <div className="w-full flex flex-col p-5 gap-2">
            
            <div className="w-full flex items-center justify-between bg-white rounded-lg">
            {/* Package Name */}
                <p className="text-4xl font-bold text-gray-800 capitalize">
                  {packageData?.packageName}
                </p>
                
                {/* Book Button */}
                {/* <button
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      navigate(`/booking/${params?.id}`);
                    } else {
                      navigate("/login");
                    }
                  }}
                  className="bg-green-600 text-white text-lg px-6 py-2 rounded-lg shadow hover:bg-green-700 transition duration-200"
                >
                  Book Now
                </button> */}
              </div>

            
            {/* price */}
            <p className="flex gap-1 text-2xl font-semibold my-3">
              {packageData?.packageOffer ? (
                <>
                  <span className="line-through text-gray-700">
                    ${packageData?.packagePrice}
                  </span>{" "}
                  -<span>${packageData?.packageDiscountPrice}</span>
                  <span className="text-lg ml-2 bg-green-700 p-1 rounded text-white">
                    {Math.floor(
                      ((+packageData?.packagePrice -
                        +packageData?.packageDiscountPrice) /
                        +packageData?.packagePrice) *
                        100
                    )}
                    % Off
                  </span>
                </>
              ) : (
                <span>${packageData?.packagePrice}</span>
              )}
            </p>
            {/* price */}
            {/* destination */}
            <p className="text-green-700 flex items-center gap-1 text-lg capitalize">
              <FaMapMarkerAlt />
              {packageData?.packageDestination}
            </p>
            {/* destination */}
            {/* days & nights */}
            {(+packageData?.packageDays > 0 ||
              +packageData?.packageNights > 0) && (
              <p className="flex items-center gap-2">
                <FaClock />
                {+packageData?.packageDays > 0 &&
                  (+packageData?.packageDays > 1
                    ? packageData?.packageDays + " Days"
                    : packageData?.packageDays + " Day")}
                {+packageData?.packageDays > 0 &&
                  +packageData?.packageNights > 0 &&
                  " - "}
                {+packageData?.packageNights > 0 &&
                  (+packageData?.packageNights > 1
                    ? packageData?.packageNights + " Nights"
                    : packageData?.packageNights + " Night")}
              </p>
            )}
            {/* days & nights */}
            {/* rating */}
            {packageData?.packageTotalRatings > 0 && (
              <div className="flex">
                <Rating
                  value={packageData?.packageRating || 0}
                  readOnly
                  precision={0.1}
                />
                <p>({packageData?.packageTotalRatings})</p>
              </div>
            )}
            {/* rating */}
            {/* Description */}
            <div className="w-full flex flex-col mt-2">
              {/* <h4 className="text-xl">Description:</h4> */}
              <p className="break-all flex flex-col font-medium">
                {packageData?.packageDescription.length > 280 ? (
                  <>
                    <span id="desc">
                      {packageData?.packageDescription.substring(0, 150)}...
                    </span>
                    <button
                      id="moreBtn"
                      onClick={() => {
                        document.getElementById("desc").innerText =
                          packageData?.packageDescription;
                        document.getElementById("moreBtn").style.display =
                          "none";
                        document.getElementById("lessBtn").style.display =
                          "flex";
                      }}
                      className="w-max font-semibold flex items-center gap-2 text-gray-600 hover:underline"
                    >
                      More <FaArrowDown />
                    </button>
                    <button
                      id="lessBtn"
                      onClick={() => {
                        document.getElementById("desc").innerText =
                          packageData?.packageDescription;
                        document.getElementById("desc").innerText =
                          packageData?.packageDescription.substring(0, 150) +
                          "...";
                        document.getElementById("lessBtn").style.display =
                          "none";
                        document.getElementById("moreBtn").style.display =
                          "flex";
                      }}
                      className="w-max font-semibold ml-2 hidden items-center gap-2 text-gray-600 hover:underline"
                    >
                      Less <FaArrowUp />
                    </button>
                  </>
                ) : (
                  <>{packageData?.packageDescription}</>
                )}
              </p>
            </div>
            <div className="flex flex-col lg:flex-row justify-between gap-8 rounded-lg">
              {/* Left Section: Details */}
              <div className="w-full lg:w-1/2 space-y-6">
                {/* Accommodation */}
                <div className="bg-white pt-5 rounded-lg p-2 flex items-center gap-4">
                  <FaHotel className="text-3xl text-green-600" />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">Accommodation:</h4>
                    <p className="text-gray-600">{packageData?.packageAccommodation}</p>
                  </div>
                </div>
                {/* Activities */}
                <div className="bg-white rounded-lg p-2 flex items-center gap-4 ">
                  <FaBicycle className="text-3xl text-blue-600" />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">Activities:</h4>
                    <p className="text-gray-600">{packageData?.packageActivities}</p>
                  </div>
                </div>
                {/* Meals */}
                <div className="bg-white rounded-lg p-2 flex items-center gap-4 ">
                  <FaUtensils className="text-3xl text-yellow-600" />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">Meals:</h4>
                    <p className="text-gray-600">{packageData?.packageMeals}</p>
                  </div>
                </div>
                {/* Transportation */}
                <div className="bg-white rounded-lg p-2 flex items-center gap-4">
                  <FaBusAlt className="text-3xl text-purple-600" />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">Transportation:</h4>
                    <p className="text-gray-600">{packageData?.packageTransportation}</p>
                  </div>
                </div>
              </div>


              {/* Right Section: Ratings/Reviews */}
              <div className="w-full lg:w-1/3 space-y-6 flex flex-col justify-center mt-8">
              <button
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      navigate(`/booking/${params?.id}`);
                    } else {
                      navigate("/login");
                    }
                  }}
                  className="w-full bg-green-600  text-white text-lg py-2 rounded-lg shadow hover:bg-green-700 transition duration-200"
                >
                  Book Now
                </button>
                {packageRatings && (
                  <div className="bg-white  rounded-lg">
                    <h4 className="text-xl font-semibold text-gray-800">Ratings/Reviews:</h4>
                    {/* Review Form */}
                    <div
                      className={`w-full mt-4 space-y-4 ${
                        !currentUser || ratingGiven ? "hidden" : "block"
                      }`}
                    >
                      <Rating
                        name="simple-controlled"
                        className="w-max mx-auto"
                        value={ratingsData?.rating}
                        onChange={(e, newValue) => {
                          setRatingsData({ ...ratingsData, rating: newValue });
                        }}
                      />
                      <textarea
                        className="w-full resize-none p-3 border rounded-lg border-gray-300 focus:ring focus:ring-green-200"
                        rows={3}
                        placeholder="Write your review here..."
                        value={ratingsData?.review}
                        onChange={(e) => {
                          setRatingsData({ ...ratingsData, review: e.target.value });
                        }}
                      ></textarea>
                      <button
                        disabled={
                          (ratingsData.rating === 0 && ratingsData.review === "") || loading
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          giveRating();
                        }}
                        className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-70"
                      >
                        {loading ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                    {/* Existing Reviews */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <RatingCard packageRatings={packageRatings} />
                      {packageData.packageTotalRatings > 4 && (
                        <button
                          onClick={() => navigate(`/package/ratings/${params?.id}`)}
                          className="flex items-center justify-center gap-2 p-2 text-gray-700 border rounded-lg hover:bg-gray-200 transition"
                        >
                          View All Reviews <FaArrowRight />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {/* Login to Rate */}
                {!currentUser && (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Login to Rate Package
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
        
      )}
    </div>
  );
};

export default Package;
