import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Stack, TextField,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { PictureAsPdf, Description, TableChart, Download } from '@mui/icons-material';
import { PageHeader } from '@/components/common';
import dayjs from 'dayjs';

const reportTypes = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const reportCategories = [
  { value: 'buildings', label: 'Buildings' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'tenants', label: 'Tenants' },
  { value: 'devices', label: 'Devices' },
  { value: 'leaks', label: 'Leaks' },
  { value: 'billing', label: 'Billing' },
];

export function ReportsPage() {
  const [reportType, setReportType] = useState('monthly');
  const [category, setCategory] = useState('buildings');

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Generate and export system reports" />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Generate Report</Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select value={reportType} label="Report Type" onChange={(e) => setReportType(e.target.value)}>
                    {reportTypes.map((rt) => (
                      <MenuItem key={rt.value} value={rt.value}>{rt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                    {reportCategories.map((rc) => (
                      <MenuItem key={rc.value} value={rc.value}>{rc.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Date" type="date" defaultValue={dayjs().format('YYYY-MM-DD')} fullWidth
                  InputLabelProps={{ shrink: true }} />
                <Button variant="contained" startIcon={<Download />} fullWidth>
                  Generate Report
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {[

              { title: 'Monthly Consumption Report', desc: 'Water usage by building', icon: <TableChart />, color: 'primary' },
              { title: 'Revenue Summary', desc: 'Billing and payment overview', icon: <Description />, color: 'success' },
              { title: 'Device Health Report', desc: 'Online/offline status, alerts, faults', icon: <PictureAsPdf />, color: 'info' },
              { title: 'Leak Analysis', desc: 'Leak events by severity and location', icon: <PictureAsPdf />, color: 'error' },
              { title: 'Tenant Usage Report', desc: 'Individual tenant consumption', icon: <TableChart />, color: 'warning' },
              { title: 'System Audit Log', desc: 'All administrative actions', icon: <Description />, color: 'text.secondary' },
            ].map((report, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: `${report.color}.main`, opacity: 0.7 }}>{report.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">{report.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{report.desc}</Typography>
                    </Box>
                    <Button size="small" startIcon={<Download />}>Export</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
