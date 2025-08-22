import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Попытка входа...');
      const response = await auth.login(username, password);
      console.log('Получен ответ:', response);

      const token = response.access_token;
      console.log('Токен:', token);
      
      localStorage.setItem('token', token);
      
      // Получаем информацию о пользователе
      console.log('Запрашиваем информацию о пользователе...');
      const userInfo = await auth.getCurrentUser();
      console.log('Информация о пользователе:', userInfo);
      
      await login(token, userInfo.role, userInfo.id);
      
      // Перенаправляем в зависимости от роли
      if (userInfo.role === 'operator') {
        navigate('/app/operator');
      } else if (userInfo.role === 'captain') {
        navigate('/app/captain');
      } else {
        setError('Неизвестная роль пользователя');
      }
    } catch (err) {
      console.error('Ошибка авторизации:', err);
      setError('Неверное имя пользователя или пароль');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Вход в систему
          </Typography>
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ mt: 1, width: '100%' }}
            noValidate
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Почта"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Войти
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/register" variant="body2">
                {"Нет аккаунта? Зарегистрироваться"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 