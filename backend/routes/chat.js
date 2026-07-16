const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'UserId param not sent with request' });
    }

    let isChat = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
        { isGroupChat: false }
      ]
    })
      .populate('users', '-password')
      .populate('latestMessage');

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'username avatar email'
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      const chatData = {
        users: [req.user._id, userId]
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
      res.status(200).json(fullChat);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/group', protect, async (req, res) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }

    let users = JSON.parse(req.body.users);
    if (users.length < 2) {
      return res.status(400).json({ message: 'A group chat requires at least 3 users' });
    }

    users.push(req.user);

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/rename', protect, async (req, res) => {
  try {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      res.status(404).json({ message: 'Chat not found' });
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/groupadd', protect, async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can add users' });
    }

    const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.json(added);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/groupremove', protect, async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString() && userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can remove users' });
    }

    const removed = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.json(removed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('latestMessage')
      .populate('groupAdmin', '-password')
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: 'username avatar email'
    });

    res.status(200).send(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
