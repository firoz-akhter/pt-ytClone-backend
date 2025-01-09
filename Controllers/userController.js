import { user } from "../Model/userModel.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfig } from "../config/CloudinaryConfig.js";
import getDataUri from "../utils/dataUri.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  EmailLinkPage,
  ResetPasswordPage,
  ResetSuccesfullyPage,
} from "../utils/HtmlPage.js";
import { transporter } from "../utils/NodeMailer.js";
import { Cart } from "../Model/cartModel.js";
export const register_User = async (req, res, next) => {
  try {
    const { name, email, password, contact_number, gender, role } = req.body;
    const file = req.file;

    if (!name || !email || !password || !contact_number) {
      return res.status(400).json({
        success: false,
        message: "Required All Fields",
      });
    }

    // Check if user already exists
    const ExistingUser = await user.findOne({ email });
    if (ExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }

    // Handle file upload to Cloudinary
    let uploadResult;
    if (file) {
      // Configure Cloudinary
      cloudinaryConfig();

      // File data parsing
      const fileData = getDataUri(file);

      // Upload file to Cloudinary
      uploadResult = await cloudinary.uploader.upload(fileData.content, {
        public_id: `profile_photo_${name + Math.floor(Math.random() * 50)}`,
        resource_type: "auto",
      });
    }

    const HashedPassword = await bcrypt.hash(password, 10);

    const newUser = await user.create({
      name,
      email,
      password: HashedPassword,
      contact_number,
      role,
      gender,
      profilePhoto: uploadResult
        ? {
            public_id: uploadResult.public_id,
            url: uploadResult.url,
            secure_url: uploadResult.secure_url,
          }
        : null,
    });
    
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
    next(error);
  }
};

export const Login_user = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Enter your Email" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Enter your password" });
    }

    // Check if user  exists or not
    const ExistingUser = await user.findOne({ email });
    if (!ExistingUser) {
      return res.status(404).json({
        success: false,
        message: "incorract Email or password",
      });
    }

    // Checking Valid Password Or not

    const CompairPassword = await bcrypt.compare(
      password,
      ExistingUser.password
    );
    if (!CompairPassword) {
      return res.status(400).json({
        success: false,
        message: "incorract Email or password",
      });
    }

    const tokenData = {
      userId: ExistingUser._id,
    };

    const token = await jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        _id: ExistingUser._id,
        username: ExistingUser.username,
        fullname: ExistingUser.fullname,
        profilePhoto: ExistingUser.profilePhoto,
        token:token,
        success: true,
      });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "User Logout successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    if (!req.id) {
      return res
        .status(404)
        .json({ message: "Unable to fetch data", success: false });
    }
    const userId = await req.id;
    const userDetails = await user.findById(userId).select("-password");
    if (!userDetails) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const UserprofilePhoto = userDetails.profilePhoto.url;
    userDetails.profilePhoto = { url: UserprofilePhoto };

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    //Adding cart into userDetails;
    userDetails.cart = cart;

    return res.status(200).json(userDetails);
  } catch (err) {
    next(err);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    if (!req.id) {
      return res
        .status(404)
        .json({ message: "Unable to fetch data", success: false });
    }
    const { name, contact_number, address } = req.body;

    const updateDetails = {
      name,
      contact_number,
      address,
    };
    const userId = await req.id;
    const userDetails = await user.findById(userId).select("-password");

    if (!userDetails) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Update user details
    userDetails.name = name || userDetails.name;
    userDetails.contact_number = contact_number || userDetails.contact_number;
    userDetails.address = address || userDetails.address;

    // Save the updated user details
    await userDetails.save();

    // Return the updated user details (or a success message)
    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: userDetails,
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    if (!req.id) {
      return res
        .status(404)
        .json({ message: "Unable to fetch data", success: false });
    }
    const { oldPassword, password } = req.body;
    const userId = await req.id;
    const userDetails = await user.findById(userId).select("password");
    if (!userDetails) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );

    if (isPasswordMatch) {
      const HashPassword = await bcrypt.hash(password, 10);
      userDetails.password = HashPassword;

      await userDetails.save();

      res.status(200).json("Password Changed Sucessfully");
    }
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(404).json({
        message: "Enter your Email",
        success: false,
      });
    }

    // Find user by email
    const userDetails = await user.findOne({ email }).select("-password");
    if (!userDetails) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Generate a Password Reset Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now

    // Save the token and expiration to the user's tokens array

    userDetails.tokens = [];

    userDetails.tokens.push({
      token: resetToken,
      expires_at: tokenExpiration,
    });

    // Save the user document
    await userDetails.save();

    // Create the reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;

    // Send the email
    const transport = transporter();
    const emailLinkHtml = EmailLinkPage(resetUrl);
    transport.sendMail(
      {
        from: process.env.EMAIL_USER,
        to: userDetails.email,
        subject: "Password Reset Request",
        html: emailLinkHtml,
      },
      (error, info) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Error sending email", success: false, error });
        }

        res.status(200).json({
          message: `Password reset email sent to ${userDetails.email}`,
          success: true,
        });
      }
    );
  } catch (error) {
    next(error);
  }
};

export const resetPasswordLink = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find the user with the corresponding token and check if it's valid
    const userDetails = await user.findOne({
      "tokens.token": token,
      "tokens.expires_at": { $gt: new Date() }, // Ensure the token hasn't expired
    });

    if (!userDetails) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token", success: false });
    }

    const ResetPasswordHtml = ResetPasswordPage(token);

    res.send(ResetPasswordHtml);
  } catch (error) {
    next(error);
  }
};
// Handle password reset submission
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find the user and validate the token
    const userDetails = await user.findOne({
      "tokens.token": token,
      "tokens.expires_at": { $gt: new Date() },
    });

    if (!userDetails) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token", success: false });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    userDetails.password = hashedPassword;

    //remove the used token
    userDetails.tokens = userDetails.tokens.filter((t) => t.token !== token);

    await userDetails.save();

    res.status(200).send(ResetSuccesfullyPage);
  } catch (err) {
    next(err);
  }
};
export const deleteAccount = async (req, res, next) => {
  if (!req.id) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const userId = req.id;

    // Find the user in the database
    const FetchUser = await user.findById(userId);

    if (!FetchUser) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Delete the user from the database (permanent deletion)
    await user.findByIdAndDelete(userId);

    // Return a success response
    return res
      .status(200)
      .json({ message: "Account deleted successfully", success: true });
  } catch (error) {
    next(error);
  }
};
