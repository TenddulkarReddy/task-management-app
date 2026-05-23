const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const task = await Task.create({ title, description, status, dueDate, UserId: req.user.id });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { UserId: req.user.id } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const task = await Task.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.update({ title, description, status, dueDate });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
