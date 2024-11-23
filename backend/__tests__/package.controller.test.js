import { createPackage, getPackages, getPackageData, updatePackage, deletePackage } from "../controllers/package.controller.js";
import Package from "../models/package.model.js";
const { uploadOnCloudinary } = require("../utils/cloudinary"); // Adjust the path based on your folder structure

jest.mock("../utils/cloudinary", () => ({
  uploadOnCloudinary: jest.fn(), // Mock the function
}));

// Mocking mongoose and the Package model
jest.mock("../models/package.model.js");
jest.mock("mongoose");

describe("Package Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPackage", () => {
    it("should return an error if required fields are missing", async () => {
      const req = {
        body: {
          packageName: "",
          packageDescription: "",
        },
        files: [], // Empty array to simulate missing images
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      await createPackage(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "All fields and at least one image are required!",
      });
    });
  
    it("should return an error if packageName is too short", async () => {
      const req = {
        body: {
          packageName: "A", // Too short
          packageDescription: "Valid Description",
        },
        files: [{ path: "test-image.jpg" }], // Mock file
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      await createPackage(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Package name must be at least 3 characters long!",
      });
    });
  
    it("should create a new package and return success", async () => {
      const req = {
        body: {
          packageName: "Test Package",
          packageDescription: "Test Description",
          packageDestination: "Test Destination",
          packageDays: 5,
          packageNights: 4,
          packageAccommodation: "Hotel",
          packageTransportation: "Bus",
          packageMeals: "All Meals",
          packageActivities: "Sightseeing",
          packagePrice: 1000,
          packageDiscountPrice: 800,
          packageOffer: true,
        },
        files: [
          { path: "image1.jpg" },
          { path: "image2.jpg" },
        ],
      };
    
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    
      // Mock the Cloudinary upload function
      const mockImageUrls = ["http://cloudinary.com/image1.jpg", "http://cloudinary.com/image2.jpg"];
      jest.mocked(uploadOnCloudinary).mockResolvedValueOnce({ url: mockImageUrls[0] });
      jest.mocked(uploadOnCloudinary).mockResolvedValueOnce({ url: mockImageUrls[1] });
    
      // Mock Package.create
      const mockCreatedPackage = {
        ...req.body,
        packageImages: mockImageUrls,
      };
      Package.create = jest.fn().mockResolvedValue(mockCreatedPackage);
    
      await createPackage(req, res);
    
      expect(Package.create).toHaveBeenCalledWith(expect.objectContaining({
        packageName: "Test Package",
        packageDescription: "Test Description",
        packageImages: mockImageUrls,
        packagePrice: 1000,
      }));
    
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Package created successfully!",
        package: mockCreatedPackage,
      });
    });
    
  
    it("should return an error if invalid packagePrice is provided", async () => {
      const req = {
        body: {
          packageName: "Test Package",
          packageDescription: "Test Description",
          packagePrice: -1000, // Invalid price
        },
        files: [{ path: "test-image.jpg" }], // Mock file
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      await createPackage(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Invalid price or discount price!",
      });
    });
  });
  

  describe("getPackages", () => {
    it("should return a list of packages", async () => {
      const req = {
        query: {
          searchTerm: "",
          limit: 5,
          startIndex: 0,
          offer: undefined,
          sort: "createdAt",
          order: "desc",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      const mockPackages = [
        { packageName: "Package 1", packagePrice: 1000 },
        { packageName: "Package 2", packagePrice: 2000 },
      ];

      Package.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockPackages),
      });

      await getPackages(req, res);

      expect(Package.find).toHaveBeenCalledWith({
        $or: [
          { packageName: { $regex: "", $options: "i" } },
          { packageDestination: { $regex: "", $options: "i" } },
        ],
        packageOffer: { $in: [false, true] },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        packages: mockPackages,
      });
    });

    it("should handle pagination correctly", async () => {
      const req = {
        query: {
          searchTerm: "",
          limit: 2,
          startIndex: 0,
          offer: undefined,
          sort: "createdAt",
          order: "desc",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      const mockPackages = [
        { packageName: "Package 1", packagePrice: 1000 },
        { packageName: "Package 2", packagePrice: 2000 },
      ];

      Package.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockPackages),
      });

      await getPackages(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        packages: mockPackages,
      });
    });
  });

  describe("getPackageData", () => {
    it("should return package data if found", async () => {
      const req = { params: { id: "123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      const mockPackage = { id: "123", packageName: "Test Package" };

      Package.findById.mockResolvedValue(mockPackage);

      await getPackageData(req, res);

      expect(Package.findById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        packageData: mockPackage,
      });
    });

    it("should return 404 if package not found", async () => {
      const req = { params: { id: "123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      Package.findById.mockResolvedValue(null);

      await getPackageData(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Package not found!",
      });
    });
  });

  describe("updatePackage", () => {
    it("should update a package if found", async () => {
      const req = {
        params: { id: "123" },
        body: { packageName: "Updated Package" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      const mockPackage = { id: "123", packageName: "Original Package" };

      Package.findById.mockResolvedValue(mockPackage);
      Package.findByIdAndUpdate.mockResolvedValue({
        id: "123",
        packageName: "Updated Package",
      });

      await updatePackage(req, res);

      expect(Package.findById).toHaveBeenCalledWith("123");
      expect(Package.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        req.body,
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Package updated successfully!",
        updatedPackage: { id: "123", packageName: "Updated Package" },
      });
    });

    it("should return error if update fails", async () => {
      const req = {
        params: { id: "123" },
        body: { packageName: "Updated Package" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      Package.findById.mockResolvedValue(null);

      await updatePackage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Package not found!",
      });
    });
  });

  describe("deletePackage", () => {
    it("should delete a package if found", async () => {
      const req = { params: { id: "123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      Package.findByIdAndDelete.mockResolvedValue(true);

      await deletePackage(req, res);

      expect(Package.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Package Deleted!",
      });
    });

    // it("should return an error if package to delete is not found", async () => {
    //   const req = { params: { id: "123" } };
    //   const res = {
    //     status: jest.fn().mockReturnThis(),
    //     send: jest.fn(),
    //   };

    //   Package.findByIdAndDelete.mockResolvedValue(null);

    //   await deletePackage(req, res);

    //   expect(res.status).toHaveBeenCalledWith(404);
    //   expect(res.send).toHaveBeenCalledWith({
    //     success: false,
    //     message: "Package not found!",
    //   });
    // });
  });
});