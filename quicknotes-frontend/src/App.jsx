import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/notes'; 

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false); 
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);

  
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setNotes(data);
      setError('');
    } catch (err) {
      setError(`Failed to fetch notes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      setError('Please fill in both title and content');
      return;
    }
    setSubmitLoading(true);
    try {
      let res;
      if (editingId) {
        // Update
        res = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        // Create
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      setForm({ title: '', content: '' });
      setEditingId(null);
      setError('');
      await fetchNotes();
    } catch (err) {
      setError(`Failed to save note: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Edit note
  const handleEdit = (note) => {
    setForm({ title: note.title, content: note.content });
    setEditingId(note._id);
    setError('');
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      setError('');
      await fetchNotes();
    } catch (err) {
      setError(`Failed to delete note: ${err.message}`);
    }
  };


  const handleCancel = () => {
    setForm({ title: '', content: '' });
    setEditingId(null);
    setError('');
  };

  return (
    <div className="container">
      <h1>QuickNotes</h1>
      <form onSubmit={handleSubmit} className="note-form">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
          disabled={submitLoading} 
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Content"
          required
          disabled={submitLoading}
        />
        <button type="submit" disabled={submitLoading}>
          {submitLoading ? 'Saving...' : editingId ? 'Update' : 'Add'} Note
        </button>
        {editingId && (
          <button type="button" onClick={handleCancel} disabled={submitLoading}>
            Cancel
          </button>
        )}
      </form>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div>Loading notes...</div>
      ) : (
        <div className="notes-list">
          {notes.length === 0 ? (
            <div>No notes found.</div>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="note-card">
                <h2>{note.title}</h2>
                <p>{note.content}</p>
                <small>
                  {new Date(note.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </small>
                <div className="note-actions">
                  <button onClick={() => handleEdit(note)} disabled={submitLoading}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(note._id)} disabled={submitLoading}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;