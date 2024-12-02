import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl, videoUrl, documentUrl, audioUrl;
    console.log("req file", JSON.stringify(req.files));

    if (req.files) {
      const file = req.files[0];
      if (file.mimetype.startsWith("image/")) {
        const uploadResponse = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          eager: {
            width: 800, // adjust the width to your desired compression level
            height: 600,
            crop: "pad",
          },
        });
        imageUrl = uploadResponse.secure_url;
      } else if (file.mimetype.startsWith("video/")) {
        const uploadResponse = await cloudinary.uploader.upload(file.path, {
          resource_type: "video",
          eager: {
            width: 800, // adjust the width to your desired compression level
            height: 600,
            crop: "pad",
          },
        });
        videoUrl = uploadResponse.secure_url;
      } else if (file.mimetype.startsWith("audio/")) {
        const uploadResponse = await cloudinary.uploader.upload(file.path, {
          resource_type: "video",
        });
        audioUrl = uploadResponse.secure_url;
      } else if (file.mimetype === "application/pdf") {
        const uploadResponse = await cloudinary.uploader.upload(file.path, {
          resource_type: "raw",
        });
        documentUrl = uploadResponse.secure_url;
      } else {
        const uploadResponse = await cloudinary.uploader.upload(file.path, {
          resource_type: "raw",
        });
        documentUrl = uploadResponse.secure_url;
      }
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
      document: documentUrl,
      audio: audioUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
