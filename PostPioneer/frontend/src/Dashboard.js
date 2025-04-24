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

// Dummy data for weekly engagement
const dummyWeeklyEngagementData = [
  { week: '2024-04-01', likes: 320, comments: 85 },
  { week: '2024-04-07', likes: 400, comments: 120 },
  { week: '2024-04-014', likes: 450, comments: 150 },
];

// Dummy data for monthly engagement
const dummyMonthlyEngagementData = [
  { month: '2024-03', likes: 1200, comments: 350 },
  { month: '2024-04', likes: 1500, comments: 450 },
  { month: '2024-05', likes: 1700, comments: 500 },
];

// Dummy data for total engagement
const dummyTotalEngagement = {
  totalLikes: 890,
  totalComments: 325,
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
  const [engagementView, setEngagementView] = useState('daily'); // Default to daily view

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

  const getEngagementData = () => {
    switch (engagementView) {
      case 'weekly':
        return dummyWeeklyEngagementData;
      case 'monthly':
        return dummyMonthlyEngagementData;
      default:
        return dummyEngagementData;
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}> {/* Slightly reduced padding */}
      {/* Scheduled Posts Section */}
      <Card style={{ marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}> {/* Reduced height */}
        <CardContent style={{ padding: '1rem' }}> {/* Reduced padding */}
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Scheduled Posts</h2> {/* Slightly smaller font */}
          <TableContainer component={Paper}>
            <Table size="small"> {/* Reduced table size */}
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
                      <IconButton size="small" onClick={() => handleEdit(post)}> {/* Smaller buttons */}
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(post.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}> {/* Reduced gap */}
        {/* Engagement Chart */}
        <Card style={{ maxHeight: '350px' }}> {/* Reduced height */}
          <CardContent style={{ padding: '1rem' }}> {/* Reduced padding */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Post Engagement Over Time</h2> {/* Slightly smaller font */}
              <div>
                <Button 
                  variant={engagementView === 'daily' ? 'contained' : 'outlined'} 
                  onClick={() => setEngagementView('daily')}
                  size="small" /* Smaller buttons */
                  style={{ marginRight: '0.25rem' }} /* Reduced margin */
                >
                  Daily
                </Button>
                <Button 
                  variant={engagementView === 'weekly' ? 'contained' : 'outlined'} 
                  onClick={() => setEngagementView('weekly')}
                  size="small"
                  style={{ marginRight: '0.25rem' }}
                >
                  Weekly
                </Button>
                <Button 
                  variant={engagementView === 'monthly' ? 'contained' : 'outlined'} 
                  onClick={() => setEngagementView('monthly')}
                  size="small"
                >
                  Monthly
                </Button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}> {/* Reduced height */}
              <LineChart data={getEngagementData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={engagementView === 'daily' ? 'date' : engagementView === 'weekly' ? 'week' : 'month'} />
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
        <Card style={{ maxHeight: '350px' }}> {/* Reduced height */}
          <CardContent style={{ padding: '1rem' }}> {/* Reduced padding */}
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Total Engagement</h2> {/* Slightly smaller font */}
            <TableContainer>
              <Table size="small"> {/* Reduced table size */}
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
        <DialogTitle style={{ fontSize: '1.25rem' }}>Edit Post Frequency</DialogTitle> {/* Slightly smaller font */}
        <DialogContent>
          <Select
            value={editingPost?.frequency || ''}
            onChange={(e) => setEditingPost({...editingPost, frequency: e.target.value})}
            fullWidth
            size="small" /* Smaller select input */
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} size="small">Cancel</Button> {/* Smaller buttons */}
          <Button onClick={handleFrequencyChange} color="primary" size="small">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}