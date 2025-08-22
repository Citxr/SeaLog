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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { operator } from '../../services/api';

interface Route {
  id: number;
  code: string;
  departure_time: string;
  return_time: string;
  ship_id: number;
  captain_id: number;
  status: 'active' | 'completed' | 'planned';
}

interface Ship { id: number; name: string; }
interface Captain { id: number; full_name: string; }

export default function RoutesList() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [newRoute, setNewRoute] = useState({
    code: '',
    departure_time: '',
    return_time: '',
    ship_id: '',
    captain_id: '',
  });

  useEffect(() => {
    loadRoutes();
    loadShips();
    loadCaptains();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await operator.getRoutes();
      setRoutes(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке маршрутов');
    } finally {
      setLoading(false);
    }
  };

  const loadShips = async () => {
    try {
      const data = await operator.getShips();
      setShips(data);
    } catch {}
  };

  const loadCaptains = async () => {
    try {
      const data = await operator.getCaptains();
      setCaptains(data);
    } catch {}
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewRoute({
      code: '',
      departure_time: '',
      return_time: '',
      ship_id: '',
      captain_id: '',
    });
  };

  const handleSave = async () => {
    try {
      await operator.createRoute({
        ...newRoute,
        ship_id: Number(newRoute.ship_id),
        captain_id: Number(newRoute.captain_id),
        operator_id: Number(localStorage.getItem('userId')),
        departure_time: newRoute.departure_time ? new Date(newRoute.departure_time).toISOString() : null,
        return_time: newRoute.return_time ? new Date(newRoute.return_time).toISOString() : null,
      });
      await loadRoutes();
      handleClose();
    } catch (err) {
      setError('Ошибка при создании маршрута');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот маршрут?')) {
      try {
        await operator.deleteRoute(id);
        await loadRoutes();
      } catch (err) {
        setError('Ошибка при удалении маршрута');
      }
    }
  };

  const getStatusColor = (status: Route['status']) => {
    switch (status) {
      case 'active':
        return 'success.main';
      case 'completed':
        return 'info.main';
      case 'planned':
        return 'warning.main';
      default:
        return 'text.secondary';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Маршруты</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Добавить маршрут
        </Button>
      </Box>

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
              <TableCell>Судно</TableCell>
              <TableCell>Капитан</TableCell>
              <TableCell>Время выхода</TableCell>
              <TableCell>Время возвращения</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell>{route.code}</TableCell>
                <TableCell>{ships.find(s => s.id === route.ship_id)?.name || route.ship_id}</TableCell>
                <TableCell>{captains.find(c => c.id === route.captain_id)?.full_name || route.captain_id}</TableCell>
                <TableCell>{route.departure_time}</TableCell>
                <TableCell>{route.return_time}</TableCell>
                <TableCell>
                  <Typography sx={{ color: getStatusColor(route.status), fontWeight: 'bold' }}>
                    {getStatusText(route.status)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button size="small" sx={{ mr: 1 }}>
                    Редактировать
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(route.id)}
                  >
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Добавить новый маршрут</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Код рейса"
            fullWidth
            value={newRoute.code}
            onChange={(e) => setNewRoute({ ...newRoute, code: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="Судно"
            fullWidth
            value={newRoute.ship_id}
            onChange={(e) => setNewRoute({ ...newRoute, ship_id: e.target.value })}
          >
            {ships.map((ship) => (
              <MenuItem key={ship.id} value={ship.id}>{ship.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Капитан"
            fullWidth
            value={newRoute.captain_id}
            onChange={(e) => setNewRoute({ ...newRoute, captain_id: e.target.value })}
          >
            {captains.map((captain) => (
              <MenuItem key={captain.id} value={captain.id}>{captain.full_name}</MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Время выхода"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newRoute.departure_time}
            onChange={(e) => setNewRoute({ ...newRoute, departure_time: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Время возвращения"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newRoute.return_time}
            onChange={(e) => setNewRoute({ ...newRoute, return_time: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 