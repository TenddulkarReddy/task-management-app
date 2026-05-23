import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://task-management-app-8onb.onrender.com';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'Pending' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`, getAuthHeaders());
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (isRegistering) {
        await axios.post(`${API_URL}/auth/register`, authForm);
        alert('Registration successful! Please login.');
        setIsRegistering(false);
      } else {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: authForm.email,
          password: authForm.password
        });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      }
      setAuthForm({ username: '', email: '', password: '' });
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Authentication operation failed.');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return alert('Task title is required.');

    try {
      if (editingTaskId) {
        const res = await axios.put(`${API_URL}/tasks/${editingTaskId}`, taskForm, getAuthHeaders());
        setTasks(tasks.map(t => t.id === editingTaskId ? res.data : t));
        setEditingTaskId(null);
      } else {
        const res = await axios.post(`${API_URL}/tasks`, taskForm, getAuthHeaders());
        setTasks([...tasks, res.data]);
      }
      setTaskForm({ title: '', description: '', status: 'Pending' });
    } catch (err) {
      console.error('Task submit action failed:', err);
      alert('Failed to publish task. Check if server console shows validation errors.');
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setTaskForm({ title: task.title, description: task.description || '', status: task.status });
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task card?')) return;
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, getAuthHeaders());
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setTasks([]);
  };

  // Helper function to safely style status badges using database keys
  const getBadgeClass = (status) => {
    if (!status) return 'pending';
    const lower = status.toLowerCase();
    if (lower.includes('progress')) return 'in-progress';
    if (lower.includes('complete')) return 'completed';
    return 'pending';
  };

  if (!token) {
    return (
      <div className="auth-container">
        <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="subtitle">
          {isRegistering ? 'Sign up to launch your tracker' : 'Sign in to manage your daily duties'}
        </p>
        
        {errorMessage && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center' }}>{errorMessage}</p>}
        
        <form onSubmit={handleAuthSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter workspace handle"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            {isRegistering ? 'Register Workspace' : 'Secure Log In'}
          </button>
        </form>

        <p className="toggle-auth" onClick={() => { setIsRegistering(!isRegistering); setErrorMessage(''); }}>
          {isRegistering ? 'Already have an account? Sign In' : 'Need a production account? Register here'}
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Task Workspace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Organize, execute, and monitor progress metrics</p>
        </div>
        <button onClick={handleLogout} className="btn-danger" style={{ fontWeight: '600' }}>
          Disconnect Session
        </button>
      </header>

      <div className="task-management-layout">
        <div style={{ background: 'var(--background)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>
            {editingTaskId ? 'Modify Selected Task' : 'Create New Board Entry'}
          </h2>
          <form onSubmit={handleTaskSubmit}>
            <div className="form-group">
              <label>Task Header Title</label>
              <input
                type="text"
                placeholder="What needs execution?"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Detailed Descriptions</label>
              <textarea
                placeholder="Outline subtasks or milestones details..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status Classification</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                <option value="Pending">Pending Review</option>
                <option value="In Progress">Active In-Progress</option>
                <option value="Completed">Completed Verified</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
              {editingTaskId ? 'Apply Modified Changes' : 'Publish to Board'}
            </button>
            {editingTaskId && (
              <button 
                type="button" 
                onClick={() => { setEditingTaskId(null); setTaskForm({ title: '', description: '', status: 'Pending' }); }}
                style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '-5px' }}
              >
                Cancel Adjustments
              </button>
            )}
          </form>
        </div>

        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: '700' }}>
            Active Directives ({tasks.length})
          </h2>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: '500' }}>Your action board is completely empty.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Fill out the dashboard generation module to spin up items.</p>
            </div>
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-card-body">
                    <span className={`badge ${getBadgeClass(task.status)}`}>
                      {task.status}
                    </span>
                    <h3 style={{ marginTop: '12px' }}>{task.title}</h3>
                    <p>{task.description || 'No execution descriptions provided for this item node.'}</p>
                  </div>
                  <div className="task-footer">
                    <button 
                      onClick={() => handleEditClick(task)} 
                      style={{ background: 'transparent', color: 'var(--primary)', padding: '0', fontSize: '0.85rem' }}
                    >
                      Modify
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)} 
                      className="btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
