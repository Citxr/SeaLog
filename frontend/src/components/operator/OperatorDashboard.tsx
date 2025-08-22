import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  DirectionsBoat,
  Route as RouteIcon,
  Assessment,
} from '@mui/icons-material';

export default function OperatorDashboard() {
  const stats = [
    {
      title: 'Активные суда',
      value: '12',
      icon: <DirectionsBoat sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Активные маршруты',
      value: '8',
      icon: <RouteIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Отчеты за сегодня',
      value: '15',
      icon: <Assessment sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управления оператора
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
          Последние действия
        </Typography>
        <Typography color="textSecondary">
          Здесь будет отображаться лента последних действий в системе
        </Typography>
      </Paper>
    </Box>
  );
} 