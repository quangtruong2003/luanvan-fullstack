import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Button, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { Menu as MenuIcon, Home as HomeIcon, Dashboard as DashboardIcon, Person as PersonIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  
  // Danh sách menu chính
  const menuItems = [
    { text: 'Trang chủ', icon: <HomeIcon />, path: '/' },
    { text: 'Bảng điều khiển', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Tài khoản', icon: <PersonIcon />, path: '/profile' },
  ];

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Luận Văn Tốt Nghiệp
          </Typography>
          <Button color="inherit" component={Link} to="/login">
            Đăng nhập
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuItems.map((item, index) => (
              <ListItem 
                button 
                key={item.text}
                component={Link}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Đăng xuất" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main content */}
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="body1" align="center">
            © {new Date().getFullYear()} - Luận Văn Tốt Nghiệp
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;