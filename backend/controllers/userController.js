const User = require("../models/userSchema");
const Comment = require("../models/commentSchema");
const bcrypt = require("bcrypt");
const {
  generateJWT,
  verifyJWT,
  verifyResetToken,
  generateResetToken,
} = require("../utils/generateToken");
const transporter = require("../utils/transporter");
const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 5 });

const admin = require("firebase-admin");
const { getAuth, UserRecord } = require("firebase-admin/auth");
const {
  deleteImageFromCloudinary,
  uploadImage,
} = require("../utils/uploadImage");
const {
  FIREBASE_TYPE,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  FIREBASE_CLIENT_X509_CERT_URL,
  FIREBASE_UNIVERSE_DOMAIN,
  EMAIL_USER,
  FRONTEND_URL,
} = require("../config/dotenv.config");
const Blog = require("../models/blogSchema");

admin.initializeApp({
  credential: admin.credential.cert({
    type: FIREBASE_TYPE,
    project_id: FIREBASE_PROJECT_ID,
    private_key_id: FIREBASE_PRIVATE_KEY_ID,
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: FIREBASE_CLIENT_EMAIL,
    client_id: FIREBASE_CLIENT_ID,
    auth_uri: FIREBASE_AUTH_URI,
    token_uri: FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: FIREBASE_UNIVERSE_DOMAIN,
  }),
});

async function createUser(req, res) {
  const { name, password, email } = req.body;
  try {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please enter the name",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter the password",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter the email",
      });
    }

    const checkForExistingUser = await User.findOne({ email });

    if (checkForExistingUser) {
      if (checkForExistingUser.googleAuth) {
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered with google. Please try using Google login.",
        });
      }
      if (checkForExistingUser.verify) {
        return res.status(400).json({
          success: false,
          message: "User already registered with this email",
        });
      } else {
        let verificationToken = await generateJWT({
          email: checkForExistingUser.email,
          id: checkForExistingUser._id,
        });

        const sendingEmail = await transporter.sendMail({
          from: EMAIL_USER,
          to: checkForExistingUser.email,
          subject: "Blogiary Email Verification",
          text: "Please verify your email",
          html: `<h1>Click on the link to verify your email</h1>
                <a href="${FRONTEND_URL}verify-email/${verificationToken}">Verify Email</a>`,
        });

        return res.status(200).json({
          success: true,
          message: "Verification email resent",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const username = email.split("@")[0] + randomUUID();

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
    });

    let verificationToken = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });

    const sendingEmail = await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Blogiary Email Verification",
      text: "Please verify your email",
      html: `<h1>Click on the link to verify your email</h1>
            <a href="${FRONTEND_URL}verify-email/${verificationToken}">Verify Email</a>`,
    });

    return res.status(200).json({
      success: true,
      message: "Please check your Email to verify your account",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function login(req, res) {
  const { password, email } = req.body;
  try {
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter the password",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter the email",
      });
    }

    const checkForExistingUser = await User.findOne({ email }).select(
      "+password",
    );

    if (!checkForExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (checkForExistingUser.googleAuth) {
      return res.status(400).json({
        success: false,
        message:
          "This email is already registered with google. Please try using Google login.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      checkForExistingUser.password,
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    if (!checkForExistingUser.verify) {
      let verificationToken = await generateJWT({
        email: checkForExistingUser.email,
        id: checkForExistingUser._id,
      });

      const sendingEmail = await transporter.sendMail({
        from: EMAIL_USER,
        to: checkForExistingUser.email,
        subject: "Blogiary Email Verification",
        text: "Please verify your email",
        html: `<h1>Click on the link to verify your email</h1>
              <a href="${FRONTEND_URL}verify-email/${verificationToken}">Verify Email</a>`,
      });
      return res.status(403).json({
        success: false,
        message: "User not verified",
      });
    }

    let token = await generateJWT({
      email: checkForExistingUser.email,
      id: checkForExistingUser._id,
    });

    return res.status(200).json({
      success: true,
      message: "Logged In successfully",
      user: {
        id: checkForExistingUser._id,
        name: checkForExistingUser.name,
        email: checkForExistingUser.email,
        profilePic: checkForExistingUser.profilePic,
        username: checkForExistingUser.username,
        bio: checkForExistingUser.bio,
        showLikedBlogs: checkForExistingUser.showLikedBlogs,
        showSavedBlogs: checkForExistingUser.showSavedBlogs,
        token,
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function googleAuth(req, res) {
  try {
    const { accessToken } = req.body;

    const response = await getAuth().verifyIdToken(accessToken);

    const { name, email } = response;

    let user = await User.findOne({ email });
    if (user) {
      if (user.googleAuth) {
        let token = await generateJWT({
          email: user.email,
          id: user._id,
        });

        return res.status(200).json({
          success: true,
          message: "Logged In successfully",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            username: user.username,
            bio: user.bio,
            showLikedBlogs: user.showLikedBlogs,
            showSavedBlogs: user.showSavedBlogs,
            token,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered without google. Please try using your email and password to login.",
        });
      }
    }

    const username = email.split("@")[0] + randomUUID();

    let newUser = await User.create({
      name,
      email,
      googleAuth: true,
      verify: true,
      username,
    });

    let token = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });

    return res.status(200).json({
      success: true,
      message: "Registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic,
        username: newUser.username,
        bio: newUser.bio,
        showLikedBlogs: newUser.showLikedBlogs,
        showSavedBlogs: newUser.showSavedBlogs,
        token,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: error.message,
    });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.find({});

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
    });
  }
}

async function getUserById(req, res) {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .populate("blogs following likeBlogs saveBlogs")
      .populate({
        path: "followers following",
        select: "name username profilePic",
      })
      .select("-password -verify -__v -email -googleAuth");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function updateUser(req, res) {
  try {
    const id = req.params.id;

    const { name, username, bio } = req.body;
    const profilePic = req.file;

    const user = await User.findById(id);

    if (!req.body.profilePic) {
      if (user.profilePicId) {
        await deleteImageFromCloudinary(user.profilePicId);
      }
      user.profilePic = null;
      user.profilePicId = null;
    }

    if (profilePic) {
      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${profilePic.buffer.toString("base64")}`,
      );
      user.profilePic = secure_url;
      user.profilePicId = public_id;
    }

    if (user.username !== username) {
      const findUser = await User.findOne({ username });
      if (findUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
    }
    user.username = username;
    user.name = name;
    user.bio = bio;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        name: user.name,
        username: user.username,
        profilePic: user.profilePic,
        profilePicId: user.profilePicId,
        bio: user.bio,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Please try again",
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const deletedUser = await User.findById(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userBlogs = await Blog.find({ creator: id });

    for (const blog of userBlogs) {
      if (blog.imageId) {
        await deleteImageFromCloudinary(blog.imageId);
      }

      if (blog.content?.blocks?.length) {
        for (const block of blog.content.blocks) {
          if (block.type === "image" && block.data?.file?.imageId) {
            await deleteImageFromCloudinary(block.data.file.imageId);
          }
        }
      }

      await Comment.deleteMany({ blog: blog._id });

      await User.updateMany(
        {
          $or: [{ likeBlogs: blog._id }, { saveBlogs: blog._id }],
        },
        {
          $pull: {
            likeBlogs: blog._id,
            saveBlogs: blog._id,
          },
        },
      );
    }

    await Blog.deleteMany({ creator: id });

    await Comment.deleteMany({ user: id });

    await User.updateMany({ followers: id }, { $pull: { followers: id } });

    await User.updateMany({ following: id }, { $pull: { following: id } });

    if (deletedUser.profilePicId) {
      await deleteImageFromCloudinary(deletedUser.profilePicId);
    }

    if (deletedUser.googleAuth) {
      const firebaseUser = await admin.auth().getUserByEmail(deletedUser.email);
      await admin.auth().deleteUser(firebaseUser.uid);
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const { verificationToken } = req.params;

    const verifyToken = await verifyJWT(verificationToken);

    if (!verifyToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token or Email Expired",
      });
    }

    const { id } = verifyToken;
    const user = await User.findByIdAndUpdate(
      id,
      { verify: true },
      { new: true },
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: error.message,
    });
  }
}

async function followUser(req, res) {
  try {
    const id = req.params.id;
    const followerId = req.user;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.followers.includes(followerId)) {
      await User.findByIdAndUpdate(
        followerId,
        { $addToSet: { following: id } },
        { new: true },
      );
      await User.findByIdAndUpdate(
        id,
        { $addToSet: { followers: followerId } },
        { new: true },
      );

      return res.status(200).json({
        success: true,
        message: `Following ${user.name}`,
      });
    } else {
      await User.findByIdAndUpdate(
        followerId,
        { $pull: { following: id } },
        { new: true },
      );
      await User.findByIdAndUpdate(
        id,
        { $pull: { followers: followerId } },
        { new: true },
      );

      return res.status(200).json({
        success: true,
        message: `Unfollowed ${user.name}`,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: error.message,
    });
  }
}

async function changeSavedLikedBlogs(req, res) {
  try {
    const userId = req.user;
    const { showSavedBlogs, showLikedBlogs } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndUpdate(
      userId,
      { showSavedBlogs, showLikedBlogs },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Seetings Updated Successfully",
      showSavedBlogs,
      showLikedBlogs,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: error.message,
    });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.googleAuth === true) {
      return res.status(403).json({
        success: false,
        message: "Google login users cannot change password",
      });
    }

    if (!user.verify) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  }

  if (user.googleAuth) {
    return res.status(400).json({
      success: false,
      message: "Google login users cannot reset password",
    });
  }

  if (!user.verify) {
    return res.status(403).json({
      success: false,
      message: "Email not verified",
    });
  }

  const resetToken = generateResetToken({
    id: user._id,
    email: user.email,
  });

  const resetLink = `${FRONTEND_URL}reset-password/${resetToken}`;

  await transporter.sendMail({
    from: EMAIL_USER,
    to: user.email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>This link will expire in 15 minutes</p>
      <a href="${resetLink}">Reset Password</a>
    `,
  });

  return res.status(200).json({
    success: true,
    message: "Password reset link sent to email",
  });
}

async function resetPassword(req, res) {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });
  }

  let decoded;
  try {
    decoded = verifyResetToken(token);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Reset link expired or invalid",
    });
  }

  const user = await User.findById(decoded.id).select("+password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.googleAuth) {
    return res.status(403).json({
      success: false,
      message: "Google users cannot reset password",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successful. Please login again.",
  });
}

module.exports = {
  createUser,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyEmail,
  googleAuth,
  followUser,
  changeSavedLikedBlogs,
  changePassword,
  forgotPassword,
  resetPassword,
};
