import User from "../models/users.js";
import Chat from "../models/chatSchema.js";

//This function receives a chat message from the frontend, stores it in MongoDB, and then returns the saved message.
export const sendMessage = async (req, res, next) => {
  try {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const newMessage = new Chat({ senderId, receiverId, message });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Chat.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getChatPartners = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Step 1: Find all messages involving this user We search the Chat collection for all chats where the user is either the sender or receiver.
    const chats = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 }) // sort newest first
      .lean();

    // Step 2: Create a map to store last message per partner
    const partnerMap = new Map();

    //For each message, we figure out who the partner is. if the logged-in user sent the message → partner is the receiver. If the logged-in user received the message →
    chats.forEach((chat) => {
      const partnerId = chat.senderId.toString() === userId ? chat.receiverId.toString() : chat.senderId.toString();

      // store only the latest message per partner
      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, chat);
      }
    });

    // Step 3: Fetch partner user details
    const partnerIds = Array.from(partnerMap.keys());
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select("firstName lastName profilePic proffession")
      .lean();

    // Step 4: Combine user info with last message
    const result = partners.map((partner) => ({
      ...partner,
      lastMessage: partnerMap.get(partner._id.toString())?.message || "",
      lastMessageTime: partnerMap.get(partner._id.toString())?.createdAt || "",
    }));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getRecentChats = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    // Find all messages sent to the admin
    const chats = await Chat.find({ receiverId: adminId })
      .sort({ createdAt: -1 })
      .populate("senderId", "firstName lastName email");

    const recentChatsMap = new Map();

    for (const chat of chats) {
      if (!chat.senderId || !chat.senderId._id) continue; // Skip invalid sender
      const senderId = chat.senderId._id.toString();
      if (!recentChatsMap.has(senderId)) {
        recentChatsMap.set(senderId, chat);
      }
    }

    const recentChats = Array.from(recentChatsMap.values());
    return res.status(200).json({
      success: true,
      message: "Recent chats fetched successfully",
      data: recentChats,
    });
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
