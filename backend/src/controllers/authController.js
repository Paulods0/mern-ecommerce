const { hashPassword, comparePassword } = require("../helpers/authHelper")
const UserModel = require("../models/UserModel")
const User = require("../models/UserModel")
const jwt = require("jsonwebtoken")
const let initialNum = 0

const registerController = async (req, res) => {
  const { name, password, email, phone, address, answer } = req.body
  //hash the password
  const hashedPassword = hashPassword(password)
  try {
    //validations
    if (!name) {
      return res.status(400).send({
        success: false,
        error: "Missing required field.",
        message: "The name field is required!",
      })
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        error: "Missing required field.",
        message: "The email field is required!",
      })
    }
    if (!address) {
      return res.status(400).send({
        success: false,
        error: "Missing required field.",
        message: "The address field is required!",
      })
    }
    if (!answer) {
      return res.status(400).send({
        success: false,
        error: "Missing required field.",
        message: "The answer field is required!",
      })
    }
    if (!phone) {
      return res.status(400).send({
        success: false,
        error: "Missing required field.",
        message: "The phone field is required!",
      })
    }
    //if the user's email is already registed
    const existingUserEmail = await User.findOne({ email })
    if (existingUserEmail) {
      return res.status(409).send({
        success: false,
        error: "Conflict!",
        message: "Already registed, please login!",
      })
    }
    //register user
    const user = await new User({
      name,
      email,
      password: hashedPassword,
      phone,
      answer,
      address,
    }).save()

    res.status(200).json({
      message: "Successfully registered!",
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong!!",
      success: false,
    })
  }
}

const loginController = async (req, res) => {
  const { email, password } = req.body
  try {
    if (!email || !password) {
      return res.status(500).json({
        success: false,
        error: "User not found",
        message: "Invalid email or password!",
      })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "Email is not registed" })
    }
    const isSamePassword = comparePassword(password, user.password)
    if (!isSamePassword) {
      return res.status(401).json({
        success: false,
        error: "Authentication failed!",
        message: "Password incorrect!",
      })
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })
    res.status(200).json({
      success: true,
      message: "Success!!",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        answer: user.answer,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error,
    })
  }
}

const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body
    if (!email) {
      res.status(400).send({ success: false, message: "Email is required" })
    }
    if (!answer) {
      res.status(400).send({ success: false, message: "Answer is required" })
    }
    if (!newPassword) {
      res.status(400).send({
        success: false,
        message: "New password is required",
      })
    }
    //Check
    const user = await User.findOne({ email, answer })
    //validation
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Wrong Email or Answer",
      })
    }
    //hash password
    const hashedPassword = hashPassword(newPassword)
    await User.findByIdAndUpdate(user._id, { password: hashedPassword })
    res.status(200).send({
      succsess: true,
      message: "Password reset successfully!",
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    })
  }
}
//not equal - $gt greater than  -
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({ name: { $ne: "admin" } }).sort({
      createdAt: -1,
    })

    if (!users) {
      return res.status(500).send({
        success: false,
        message: "Couldn't find the users",
      })
    }
    res.status(200).send({
      success: true,
      message: "All users",
      users,
    })
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "Error while fetching the users",
      error,
    })
  }
}

const updateUserController = async (req, res) => {
  try {
    const { email, name, address, password, phone } = req.body
    const user = await UserModel.findById(req.user._id)
    if (password && password.length < 6) {
      return res.json({ error: "Password is required and 6 characters long" })
    }
    const hashedPassword = password ? hashPassword(password) : undefined
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    )
    res
      .status(200)
      .send({ success: true, message: "Successfuly updated", updatedUser })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      success: false,
      message: "Error while updating user info",
      error,
    })
  }
}
//test controller
const testController = async (req, res) => {
  console.log("Protected route")
  res.send("Protected route")
}
module.exports = {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  getAllUsers,
  updateUserController,
}
