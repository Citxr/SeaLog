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
  Chip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { captain } from '../../services/api';

interface Report {
  id: number;
  fish_type: string;
  weight: number;
  location: string;
  notes: string | null;
  status: string;
  created_at: string;
  route_id: number | null;
}

interface Route {
  id: number;
  code: string;
}

const fishTypes = [
  { value: 'треска', label: 'Треска' },
  { value: 'лосось', label: 'Лосось' },
  { value: 'сельдь', label: 'Сельдь' },
  { value: 'другое', label: 'Другое' },
];

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    fish_type: '',
    weight: '',
    location: '',
    notes: '',
    route_id: '',
  });

  useEffect(() => {
    loadReports();
    loadRoutes();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await captain.getReports();
      setReports(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке отчетов');
    } finally {
      setLoading(false);
    }
  };

  const loadRoutes = async () => {
    try {
      const data = await captain.getRoutes();
      setRoutes(data);
    } catch (err) {
      setError('Ошибка при загрузке маршрутов');
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewReport({
      fish_type: '',
      weight: '',
      location: '',
      notes: '',
      route_id: '',
    });
  };

  const handleSave = async () => {
    try {
      await captain.createReport({
        ...newReport,
        weight: Number(newReport.weight),
        route_id: newReport.route_id ? Number(newReport.route_id) : null,
      });
      await loadReports();
      handleClose();
    } catch (err) {
      setError('Ошибка при создании отчета');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'новый':
        return 'info';
      case 'подтвержден':
        return 'success';
      case 'отклонен':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'новый':
        return 'Новый';
      case 'подтвержден':
        return 'Подтвержден';
      case 'отклонен':
        return 'Отклонен';
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
        <Typography variant="h4">Отчеты</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Создать отчет
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
              <TableCell>Дата</TableCell>
              <TableCell>Тип рыбы</TableCell>
              <TableCell>Вес (тонн)</TableCell>
              <TableCell>Местоположение</TableCell>
              <TableCell>Примечания</TableCell>
              <TableCell>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                <TableCell>{report.fish_type}</TableCell>
                <TableCell>{report.weight}</TableCell>
                <TableCell>{report.location}</TableCell>
                <TableCell>{report.notes || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(report.status)}
                    color={getStatusColor(report.status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новый отчет</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Маршрут</InputLabel>
            <Select
              value={newReport.route_id}
              onChange={(e) => setNewReport({ ...newReport, route_id: e.target.value })}
              label="Маршрут"
            >
              <MenuItem value="">Без маршрута</MenuItem>
              {routes.map((route) => (
                <MenuItem key={route.id} value={route.id}>
                  {route.code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            select
            label="Тип рыбы"
            fullWidth
            value={newReport.fish_type}
            onChange={(e) => setNewReport({ ...newReport, fish_type: e.target.value })}
          >
            {fishTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Вес (тонн)"
            type="number"
            fullWidth
            value={newReport.weight}
            onChange={(e) => setNewReport({ ...newReport, weight: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Местоположение"
            fullWidth
            value={newReport.location}
            onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Примечания"
            fullWidth
            multiline
            rows={4}
            value={newReport.notes}
            onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
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