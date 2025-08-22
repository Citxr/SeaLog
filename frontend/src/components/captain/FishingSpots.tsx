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
import { captain } from '../../services/api';

interface FishingSpot {
  id: number;
  name: string;
  coordinates: string;
  depth: number;
  fish_type: string;
  arrival_time: string | null;
  departure_time: string | null;
}

const fishTypes = [
  { value: 'треска', label: 'Треска' },
  { value: 'лосось', label: 'Лосось' },
  { value: 'сельдь', label: 'Сельдь' },
  { value: 'другое', label: 'Другое' },
];

export default function FishingSpots() {
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [newSpot, setNewSpot] = useState({
    name: '',
    coordinates: '',
    depth: '',
    fish_type: '',
    arrival_time: '',
    departure_time: '',
  });

  useEffect(() => {
    loadSpots();
  }, []);

  const loadSpots = async () => {
    try {
      setLoading(true);
      const data = await captain.getFishingSpots();
      setSpots(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке точек лова');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewSpot({
      name: '',
      coordinates: '',
      depth: '',
      fish_type: '',
      arrival_time: '',
      departure_time: '',
    });
  };

  const handleSave = async () => {
    // Проверяем формат координат (пример: "55.7558, 37.6173")
    const coordinatesRegex = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
    if (!coordinatesRegex.test(newSpot.coordinates)) {
      setError('Координаты должны быть в формате "широта, долгота" (например: "55.7558, 37.6173")');
      return;
    }

    try {
      await captain.createFishingSpot({
        ...newSpot,
        depth: Number(newSpot.depth),
        arrival_time: newSpot.arrival_time ? new Date(newSpot.arrival_time).toISOString() : null,
        departure_time: newSpot.departure_time ? new Date(newSpot.departure_time).toISOString() : null,
      });
      await loadSpots();
      handleClose();
    } catch (err) {
      setError('Ошибка при создании точки лова');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту точку лова?')) {
      try {
        await captain.deleteFishingSpot(id);
        await loadSpots();
      } catch (err) {
        setError('Ошибка при удалении точки лова');
      }
    }
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Точки лова</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Добавить точку лова
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
              <TableCell>Координаты</TableCell>
              <TableCell>Глубина (м)</TableCell>
              <TableCell>Тип рыбы</TableCell>
              <TableCell>Время прибытия</TableCell>
              <TableCell>Время отбытия</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {spots.map((spot) => (
              <TableRow key={spot.id}>
                <TableCell>{spot.name}</TableCell>
                <TableCell>{spot.coordinates}</TableCell>
                <TableCell>{spot.depth}</TableCell>
                <TableCell>{spot.fish_type}</TableCell>
                <TableCell>{spot.arrival_time ? new Date(spot.arrival_time).toLocaleString() : '-'}</TableCell>
                <TableCell>{spot.departure_time ? new Date(spot.departure_time).toLocaleString() : '-'}</TableCell>
                <TableCell>
                  <Button size="small" sx={{ mr: 1 }}>
                    Редактировать
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(spot.id)}
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
        <DialogTitle>Добавить новую точку лова</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Название"
            fullWidth
            value={newSpot.name}
            onChange={(e) => setNewSpot({ ...newSpot, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Координаты"
            fullWidth
            value={newSpot.coordinates}
            onChange={(e) => setNewSpot({ ...newSpot, coordinates: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Глубина (м)"
            type="number"
            fullWidth
            value={newSpot.depth}
            onChange={(e) => setNewSpot({ ...newSpot, depth: e.target.value })}
          />
          <TextField
            margin="dense"
            select
            label="Тип рыбы"
            fullWidth
            value={newSpot.fish_type}
            onChange={(e) => setNewSpot({ ...newSpot, fish_type: e.target.value })}
          >
            {fishTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Время прибытия"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newSpot.arrival_time}
            onChange={(e) => setNewSpot({ ...newSpot, arrival_time: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Время отбытия"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newSpot.departure_time}
            onChange={(e) => setNewSpot({ ...newSpot, departure_time: e.target.value })}
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