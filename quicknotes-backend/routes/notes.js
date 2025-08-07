const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Middleware for input validation
const validateNoteInput = (req, res, next) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  next();
};

// Create a new note
router.post('/', validateNoteInput, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newNote = new Note({ title, content });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: `Error creating note: ${err.message}` });
  }
});

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: `Error fetching notes: ${err.message}` });
  }
});

// Update a note
router.put('/:id', validateNoteInput, async (req, res) => {
  const { title, content } = req.body;
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: `Error updating note: ${err.message}` });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: `Error deleting note: ${err.message}` });
  }
});

// Smart Search Route
router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  try {
    const notes = await Note.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: `Error searching notes: ${err.message}` });
  }
});

module.exports = router;