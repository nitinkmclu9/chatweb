const express = require('express');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

const router = express.Router();

router.post('/', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content && !req.files?.length) {
      return res.status(400).json({ message: 'Invalid data passed into request' });
    }

    let newMessage = {
      sender: req.user._id,
      content: content || '',
      chat: chatId
    };

    if (req.files && req.files.length > 0) {
      newMessage.attachments = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size
      }));
    }

    let message = await Message.create(newMessage);
    message = await message.populate('sender', 'username avatar');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'username avatar email'
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:chatId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId, isDeleted: false })
      .populate('sender', 'username avatar email')
      .populate('chat')
      .populate('reactions.user', 'username')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:messageId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.content = content;
    await message.save();
    
    let updatedMessage = await Message.findById(req.params.messageId)
      .populate('sender', 'username avatar email')
      .populate('chat')
      .populate('reactions.user', 'username');

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    message.attachments = [];
    await message.save();
    
    const updatedMessage = await Message.findById(req.params.messageId)
      .populate('sender', 'username avatar email')
      .populate('chat')
      .populate('reactions.user', 'username');

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add reaction
router.post('/:messageId/reactions', protect, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(
        r => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
      );
    } else {
      // Remove any existing reaction from this user (one reaction per user)
      message.reactions = message.reactions.filter(
        r => r.user.toString() !== req.user._id.toString()
      );
      // Add new reaction
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();

    const updatedMessage = await Message.findById(req.params.messageId)
      .populate('sender', 'username avatar email')
      .populate('chat')
      .populate('reactions.user', 'username');

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.post('/:chatId/read', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.users.find(u => u.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Message.updateMany(
      { chat: req.params.chatId, sender: { $ne: req.user._id }, isRead: false },
      { $set: { isRead: true }, $addToSet: { readBy: req.user._id } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
