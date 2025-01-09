import jwt from "jsonwebtoken";
import { user } from "../Model/userModel.js";

// Middleware to check if the user is authenticated
export const isAuthenticated = async (req, res, next) => {
  try {
    // Extract the token from cookies
    const token = req.cookies.token;

    // Check if the token exists
    if (!token) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify the token
    const decode = await jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach user ID to the request object
    req.id = decode.userId;

    next();
  } catch (error) {
    console.log("Authentication Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to check if the user is an admin
export const isAdmin = async (req, res, next) => {
  try {
    // Extract the token from cookies
    const token = req.cookies.token;

    // Check if the token exists
    if (!token) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify the token
    const decode = await jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.id = decode.userId;

    // Fetch user details
    const userDetails = await user.findById(decode.userId);

    if (!userDetails) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Check if the user is an admin
    if (userDetails.role !== "admin") {
      return res.status(401).json({ message: "Access denied, user not authenticated" });
    }

    next();
  } catch (error) {
    console.log("Admin Authentication Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
