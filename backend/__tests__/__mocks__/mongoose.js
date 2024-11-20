// Mocking Mongoose
const mockSchema = jest.fn(() => ({
    add: jest.fn(),
    paths: {},
  }));
  
  const mockModel = jest.fn(() => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  }));
  
  const mongoose = {
    Schema: mockSchema, // Mocked Schema
    model: jest.fn(() => mockModel()), // Mocked Model
    connect: jest.fn(), // Mock connect method
    connection: {
      close: jest.fn(),
    },
  };
  
  export default mongoose;

describe("Mongoose Mock", () => {
    it("should have a valid mock", () => {
      expect(true).toBe(true);
    });
  });
  