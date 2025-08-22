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

interface Ship {
  id: number;
  name: string;
  type: 'траулер' | 'морозный' | 'флагман';
  displacement: number;
  build_date: string;
  user_id: number;
}

export default function ShipsList() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [newShip, setNewShip] = useState({
    name: '',
    type: 'траулер' as const,
    displacement: 0,
    build_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadShips();
  }, []);

  const loadShips = async () => {
    try {
      setLoading(true);
      const data = await operator.getShips();
      setShips(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке судов');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewShip({
      name: '',
      type: 'траулер' as const,
      displacement: 0,
      build_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSave = async () => {
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(newShip.build_date)) {
      setError('Дата должна быть в формате ГГГГ-ММ-ДД');
      return;
    }

    const userId = Number(localStorage.getItem('userId'));
    console.log('userId from localStorage:', userId);
    if (!userId) {
      setError('Ошибка: пользователь не авторизован');
      return;
    }

    try {
      const shipData = {
        ...newShip,
        user_id: userId,
      };

      console.log('Отправляем данные судна:', shipData);
      const response = await operator.createShip(shipData);
      console.log('Ответ сервера:', response);
      
      setShips([...ships, response]);
      setNewShip({
        name: '',
        type: 'траулер' as const,
        displacement: 0,
        build_date: new Date().toISOString().split('T')[0],
      });
      setOpen(false);
    } catch (err) {
      console.error('Ошибка при создании судна:', err);
      setError('Ошибка при создании судна');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это судно?')) {
      try {
        await operator.deleteShip(id);
        await loadShips();
      } catch (err) {
        setError('Ошибка при удалении судна');
      }
    }
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Судна</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Добавить судно
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
              <TableCell>Название</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Водоизмещение (тонн)</TableCell>
              <TableCell>Дата постройки</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ships.map((ship) => (
              <TableRow key={ship.id}>
                <TableCell>{ship.name}</TableCell>
                <TableCell>{ship.type}</TableCell>
                <TableCell>{ship.displacement}</TableCell>
                <TableCell>{ship.build_date}</TableCell>
                <TableCell>
                  <Button size="small" sx={{ mr: 1 }}>
                    Редактировать
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(ship.id)}
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
        <DialogTitle>Добавить новое судно</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название судна"
            fullWidth
            value={newShip.name}
            onChange={(e) => setNewShip({ ...newShip, name: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="Тип судна"
            fullWidth
            value={newShip.type}
            onChange={(e) => setNewShip({ ...newShip, type: e.target.value as any })}
          >
            <MenuItem value="траулер">Траулер</MenuItem>
            <MenuItem value="морозный">Морозный</MenuItem>
            <MenuItem value="флагман">Флагман</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Водоизмещение (тонн)"
            type="number"
            fullWidth
            value={newShip.displacement}
            onChange={(e) => setNewShip({ ...newShip, displacement: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Дата постройки"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newShip.build_date}
            onChange={(e) => setNewShip({ ...newShip, build_date: e.target.value })}
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
