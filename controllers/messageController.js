const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

const sendMessage = async (req, res) => {
      try {
        const { receiverId, subject, body } = req.body;
        //  get user id from req.user
        const senderId = req.user.id;
        const receiver = await Profile.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const message = new Message({
            messageId: uuidv4(),
            sender: senderId,
            receiver: receiverId,
            subject,
            body,
        });

        await message.save();
        // Optionally, send an email notification to the receiver
        const emailHtml = `<p>You have a new message from ${req.user.email}: ${subject}</p>`;
        await sendEmail(receiver.email, 'New Message', emailHtml);

        res.status(201).json({ message: 'Message sent successfully', message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };
  
  const getMessages = async (req, res) => {
    try {
      const userId = req.user.id;
     // Get messages where the user is either the sender or receiver
     const messages = await Message.find({
         $or: [{ sender: userId }, { receiver: userId }],
     }).populate('sender receiver', 'firstName lastName email'); // Populate sender and receiver details

     res.json(messages);
 } catch (error) {
     res.status(500).json({ error: error.message });
 }
  };

  const getMessageById = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findOne({ messageId })
            .populate('sender receiver', 'firstName lastName email');
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
         //  get user id from req.user
         const userId = req.user.id;
         // Only allow the recipient to view the message
         if (message.receiver._id.toString() !== userId.toString()) {
              return res.status(403).json({ message: 'Unauthorized' });
         }
        if (!message.isRead) {
            message.isRead = true;
            await message.save();
        }
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
  
  const deleteMessage = async (req, res) => {
      try {
        const { messageId } = req.params;
        const message = await Message.findOneAndDelete({ messageId });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = {sendMessage, getMessages, deleteMessage, getMessageById };