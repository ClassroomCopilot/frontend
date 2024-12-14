import { useState } from 'react';
import { Container, Box, Typography, Tabs, Tab, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SUPER_ADMIN_EMAIL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { TimetableUploadSection } from '../components/admin/TimetableUploadSection';
import { logger } from '../../debugConfig';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;
  
  logger.debug('admin-page', '🔍 Super admin check', {
    userEmail: user?.email,
    superAdminEmail: SUPER_ADMIN_EMAIL,
    isMatch: isSuperAdmin
  });

  const handleReturn = () => {
    logger.info('admin-page', '🏠 Returning to user page');
    navigate('/user');
  };

  if (!isSuperAdmin) {
    logger.error('admin-page', '🚫 Unauthorized access attempt', {
      userEmail: user?.email,
      requiredEmail: SUPER_ADMIN_EMAIL
    });
    return (
      <Container>
        <Typography variant="h4" color="error">Unauthorized Access</Typography>
        <Button 
          onClick={handleReturn}
          variant="contained" 
          sx={{ mt: 2 }}
        >
          Return to User Page
        </Button>
      </Container>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Button 
          onClick={handleReturn}
          variant="outlined"
        >
          Return to User Page
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="User Management" />
          <Tab label="Database Management" />
          <Tab label="System Settings" />
          <Tab label="Timetables" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6">User Management</Typography>
          {/* Add user management components here */}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6">Database Management</Typography>
          {/* Add database management components here */}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6">System Settings</Typography>
          {/* Add system settings components here */}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TimetableUploadSection />
        </TabPanel>
      </Paper>
    </Container>
  );
}