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
  TextField,
  MenuItem,
} from '@mui/material';
import { operator } from '../../services/api';

interface Report {
  id: number;
  fish_type: string;
  weight: number;
  location: string;
  notes: string | null;
  status: string;
  created_at: string;
  user: {
    full_name: string;
  };
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await operator.getReports();
      setReports(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке отчетов');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await operator.approveReport(id);
      await loadReports();
    } catch (err) {
      setError('Ошибка при подтверждении отчета');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await operator.rejectReport(id);
      await loadReports();
    } catch (err) {
      setError('Ошибка при отклонении отчета');
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

  const filteredReports = statusFilter
    ? reports.filter(report => report.status === statusFilter)
    : reports;

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Отчеты
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          select
          label="Фильтр по статусу"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Все статусы</MenuItem>
          <MenuItem value="новый">Новые</MenuItem>
          <MenuItem value="подтвержден">Подтвержденные</MenuItem>
          <MenuItem value="отклонен">Отклоненные</MenuItem>
        </TextField>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Капитан</TableCell>
              <TableCell>Тип рыбы</TableCell>
              <TableCell>Вес (тонн)</TableCell>
              <TableCell>Местоположение</TableCell>
              <TableCell>Примечания</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                <TableCell>{report.user.full_name}</TableCell>
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
                <TableCell>
                  {report.status === 'новый' && (
                    <>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleApprove(report.id)}
                        sx={{ mr: 1 }}
                      >
                        Подтвердить
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleReject(report.id)}
                      >
                        Отклонить
                      </Button>
                    </>
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