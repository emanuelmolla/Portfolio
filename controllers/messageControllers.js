const Message = require("../models/Message");
const sendMessage = async (req, res) => {
  try {
    const { email, name, message } = req.body;

    const newMessage = await Message.create({
      message: message.trim(),
      email: email.trim(),
      name: name.trim(),
    });

    return res.status(200).json(newMessage);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Unable to send messages", error: err.message });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().lean();
    const sorted = messages.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return res.status(200).json({ messages: sorted });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Unable to fetch messages", error: err.message });
  }
};
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Message.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Unable to delete message", error: err.message });
  }
};
module.exports = { getAllMessages, sendMessage, deleteMessage };
