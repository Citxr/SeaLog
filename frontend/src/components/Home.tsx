import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Container } from '@mui/material';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={4} sx={{ p: 5, width: '100%', textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Добро пожаловать!
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Система управления рыболовным флотом
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mb: 2, width: '80%' }}
            onClick={() => navigate('/login')}
          >
            Войти
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{ width: '80%' }}
            onClick={() => navigate('/register')}
          >
            Зарегистрироваться
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home; 