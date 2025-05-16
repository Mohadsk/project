import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import MDEditor from '@uiw/react-md-editor';
import { debounce } from 'lodash';

export default function BlogEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [blogId, setBlogId] = useState(null);
  const [saved, setSaved] = useState(false);

  // Keep stable debounce function
  const debouncedSave = useRef(
    debounce(async (data) => {
      try {
        const res = await axios.post('http://localhost:5000/api/blogs/save-draft', data);
        if (res.data && res.data._id) {
          setBlogId(res.data._id);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 5000)
  ).current;

  // Memoized autoSave function that calls debounce with current data
  const autoSave = useCallback(() => {
    debouncedSave({
      id: blogId,
      title,
      content,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    });
  }, [blogId, title, content, tags, debouncedSave]);

  useEffect(() => {
    if (title || content || tags) {
      autoSave();
    }
    return () => {
      debouncedSave.cancel();
    };
  }, [title, content, tags, autoSave, debouncedSave]);

  const publishBlog = async () => {
    try {
      await axios.post('http://localhost:5000/api/blogs/publish', {
        id: blogId,
        title,
        content,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      });
      alert('Blog published!');
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish blog. Try again.');
    }
  };

  return (
    <div style={{ padding: '20px' }} data-color-mode="light">
      <h2>Write a Blog</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '1.1rem' }}
      />
      <MDEditor value={content} onChange={setContent} height={400} />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)"
        style={{ width: '100%', padding: '8px', marginTop: '10px', fontSize: '1rem' }}
      />
      <button
        onClick={publishBlog}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Publish
      </button>
      {saved && <p style={{ color: 'green', marginTop: '10px' }}>Auto-saved!</p>}
    </div>
  );
}
