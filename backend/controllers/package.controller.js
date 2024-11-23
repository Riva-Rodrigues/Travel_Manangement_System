import Package from "../models/package.model.js";
import braintree from "braintree";
import dotenv from "dotenv";
import Booking from "../models/booking.model.js";
dotenv.config();
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import fs from 'fs'; 

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//create package
export const createPackage = async (req, res) => {
  console.log(req.body);
console.log(req.files);

  const {
    packageName,
    packageDescription,
    packagePrice,
    packageDestination,
    packageDays,
    packageNights,
    packageAccommodation,
    packageTransportation,
    packageMeals,
    packageActivities,
    packageDiscountPrice,
    packageOffer,
  } = req.body;

  console.log(packageName,
    packageDescription,
    packageDestination,
    packageDays,
    packageNights,
    packageAccommodation,
    packageTransportation,
    packageMeals,
    packageActivities,
    packagePrice,
    packageDiscountPrice,
    packageOffer)

  // Validation
  if (!packageName || !packageDescription || !req.files || req.files.length === 0) {
    return res.status(400).send({
      success: false,
      message: "All fields and at least one image are required!",
    });
  }

  if (packageName.length < 3) {
    return res.status(400).send({
      success: false,
      message: "Package name must be at least 3 characters long!",
    });
  }

  if (packagePrice <= 0 || packageDiscountPrice < 0 || packagePrice < packageDiscountPrice) {
    return res.status(400).send({
      success: false,
      message: "Invalid price or discount price!",
    });
  }

  if (packageDays <= 0 || packageNights <= 0) {
    return res.status(400).send({
      success: false,
      message: "Provide valid days and nights!",
    });
  }

  try {
    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const localFilePath = file.path;
        const uploadResponse = await uploadOnCloudinary(localFilePath);
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return uploadResponse.url;
      })
    );

    // Create a new package
    const newPackage = await Package.create({
      packageName,
      packageDescription,
      packageDestination,
      packageDays,
      packageNights,
      packageAccommodation,
      packageTransportation,
      packageMeals,
      packageActivities,
      packagePrice,
      packageDiscountPrice,
      packageOffer,
      packageImages: imageUrls,
    });

    res.status(201).send({
      success: true,
      message: "Package created successfully!",
      package: newPackage,
    });
  } catch (error) {
    console.error("Error creating package:", error);
    res.status(500).send({
      success: false,
      message: "Error creating package.",
    });
  }
};



export const getPackages = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let offer = req.query.offer;
    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    const sort = req.query.sort || "createdAt";

    const order = req.query.order || "desc";

    const packages = await Package.find({
      $or: [
        { packageName: { $regex: searchTerm, $options: "i" } },
        { packageDestination: { $regex: searchTerm, $options: "i" } },
      ],
      packageOffer: offer,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);
    if (packages) {
      return res.status(200).send({
        success: true,
        packages,
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "No Packages yet",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//get package data
export const getPackageData = async (req, res) => {
  try {
    const packageData = await Package.findById(req?.params?.id);
    if (!packageData) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }
    return res.status(200).send({
      success: true,
      packageData,
    });
  } catch (error) {
    console.log(error);
  }
};

//update package
export const updatePackage = async (req, res) => {
  try {
    const findPackage = await Package.findById(req.params.id);
    if (!findPackage)
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Package updated successfully!",
      updatedPackage,
    });
  } catch (error) {
    console.log(error);
  }
};

//delete package
export const deletePackage = async (req, res) => {
  try {
    const deletePackage = await Package.findByIdAndDelete(req?.params?.id);
    return res.status(200).send({
      success: true,
      message: "Package Deleted!",
    });
  } catch (error) {
    cnsole.log(error);
  }
};

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
