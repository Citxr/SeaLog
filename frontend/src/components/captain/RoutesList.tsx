import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { captain } from '../../services/api';

interface Route {
  id: number;
  name: string;
  startPoint: string;
  endPoint: string;
  status: 'active' | 'completed' | 'planned';
  distance: number;
  estimatedTime: string;
}

export default function RoutesList() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await captain.getRoutes();
      setRoutes(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке маршрутов');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoute = async (id: number) => {
    try {
      await captain.startRoute(id);
      await loadRoutes();
    } catch (err) {
      setError('Ошибка при запуске маршрута');
    }
  };

  const handleCompleteRoute = async (id: number) => {
    try {
      await captain.completeRoute(id);
      await loadRoutes();
    } catch (err) {
      setError('Ошибка при завершении маршрута');
    }
  };

  const getStatusColor = (status: Route['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'planned':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Route['status']) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'completed':
        return 'Завершен';
      case 'planned':
        return 'Запланирован';
      default:
        return status;
    }
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Маршруты
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Код рейса</TableCell>
              <TableCell>Начальная точка</TableCell>
              <TableCell>Конечная точка</TableCell>
              <TableCell>Расстояние (км)</TableCell>
              <TableCell>Время в пути</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell>31</TableCell>
                <TableCell>Маково</TableCell>
                <TableCell>Атырау</TableCell>
                <TableCell>271</TableCell>
                <TableCell>1 день 2 часа</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(route.status)}
                    color={getStatusColor(route.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" sx={{ mr: 1 }}>
                    Просмотр
                  </Button>
                  {route.status === 'planned' && (
                    <Button
                      size="small"
                      color="success"
                      onClick={() => handleStartRoute(route.id)}
                    >
                      Начать
                    </Button>
                  )}
                  {route.status === 'active' && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleCompleteRoute(route.id)}
                    >
                      Завершить
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 