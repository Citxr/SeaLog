import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  Route as RouteIcon,
  LocationOn,
  Assessment,
} from '@mui/icons-material';

export default function CaptainDashboard() {
  const stats = [
    {
      title: 'Текущий маршрут',
      value: 'Маршрут 1',
      icon: <RouteIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Активные места лова',
      value: '3',
      icon: <LocationOn sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Отчеты за сегодня',
      value: '2',
      icon: <Assessment sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управления капитана
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </Box>
                {stat.icon}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Текущий статус
        </Typography>
        <Typography color="textSecondary">
          Местоположение: Баренцево море
          <br />
          Скорость: 12 узлов
          <br />
          Курс: 45°
          <br />
          Погода: Ясно, ветер 5 м/с
        </Typography>
      </Paper>
    </Box>
  );
} 