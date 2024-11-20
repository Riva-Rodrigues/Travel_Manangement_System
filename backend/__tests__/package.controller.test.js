import { createPackage, getPackages, getPackageData, updatePackage, deletePackage } from "../controllers/package.controller.js";
import Package from "../models/package.model.js";

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
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await createPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required!",
      });
    });

    it("should return an error if packageName is too short", async () => {
      const req = {
        body: {
          packageName: "A",  // Too short
          packageDescription: "Valid Description",
        },
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
          packageImages: ["image1.jpg", "image2.jpg"],
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      Package.create.mockResolvedValue(req.body);

      await createPackage(req, res);

      expect(Package.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Package created successfully",
      });
    });

    it("should return an error if invalid packagePrice is provided", async () => {
      const req = {
        body: {
          packageName: "Test Package",
          packageDescription: "Test Description",
          packagePrice: -1000, // Invalid price
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await createPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Invalid price provided!",
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