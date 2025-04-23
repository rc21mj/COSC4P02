import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer 
} from 'recharts';
import {
  Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, MenuItem, Select,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebaseConfig';
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Dummy data for scheduled posts
const dummyScheduledPosts = [
  { id: 1, platform: 'LinkedIn', frequency: 'daily', content: 'Sample post 1' },
  { id: 2, platform: 'Twitter', frequency: 'weekly', content: 'Sample post 2' },
  { id: 3, platform: 'Instagram', frequency: 'monthly', content: 'Sample post 3' },
];

// Dummy data for engagement over time
const dummyEngagementData = [
  { date: '2024-04-01', likes: 45, comments: 12 },
  { date: '2024-04-02', likes: 52, comments: 15 },
  { date: '2024-04-03', likes: 68, comments: 22 },
  { date: '2024-04-04', likes: 75, comments: 25 },
];

// Dummy data for total engagement
const dummyTotalEngagement = {
  totalLikes: 240,
  totalComments: 74,
  totalShares: 32,
  engagementRate: '3.2%'
};

export default function Dashboard() {
  const [formData, setFormData] = useState({
    userid: "guest",
    // ... other fields
  });
  
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setFormData((prevData) => ({
        ...prevData,
        userid: user ? user.uid : "guest",
      }));
    });
  
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);
  const [scheduledPosts, setScheduledPosts] = useState(dummyScheduledPosts);
  const [engagementData, setEngagementData] = useState(dummyEngagementData);
  const [totalEngagement, setTotalEngagement] = useState(dummyTotalEngagement);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Example function to fetch real data
  useEffect(() => {
    if (formData.userid === "guest") return; // Skip until we have a real user
  
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/dashboard-data?uid=${formData.userid}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setScheduledPosts(data.scheduledPosts);
        //setEngagementData(data.engagementData);
        //setTotalEngagement(data.totalEngagement);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
  
    fetchData();
  }, [formData.userid]);

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditDialogOpen(true);
  };

  const handleDelete = (postId) => {
    setScheduledPosts(posts => posts.filter(post => post.id !== postId));
  };

  const handleFrequencyChange = () => {
    setEditDialogOpen(false);
    // Add actual update logic here
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Scheduled Posts Section */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardContent>
          <h2>Scheduled Posts</h2>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Post ID</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduledPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.id}</TableCell>
                    <TableCell>{post.content}</TableCell>
                    <TableCell>{post.frequency}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(post)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(post.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Engagement Chart */}
        <Card>
          <CardContent>
            <h2>Post Engagement Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="likes" stroke="#8884d8" />
                <Line type="monotone" dataKey="comments" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total Engagement Stats */}
        <Card>
          <CardContent>
            <h2>Total Engagement</h2>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Likes</TableCell>
                    <TableCell>{totalEngagement.totalLikes}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Comments</TableCell>
                    <TableCell>{totalEngagement.totalComments}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Shares</TableCell>
                    <TableCell>{totalEngagement.totalShares}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Engagement Rate</TableCell>
                    <TableCell>{totalEngagement.engagementRate}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>

      {/* Edit Frequency Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Post Frequency</DialogTitle>
        <DialogContent>
          <Select
            value={editingPost?.frequency || ''}
            onChange={(e) => setEditingPost({...editingPost, frequency: e.target.value})}
            fullWidth
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleFrequencyChange} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}