import { Box, Card, CardContent, Typography } from '@mui/material';
import { PageHeader, EmptyState } from '@/components/common';
import { NotificationsOutlined } from '@mui/icons-material';

export function NotificationsPage() {
  return (
    <Box>
      <PageHeader title="Notifications" subtitle="All system notifications" />
      <Card>
        <CardContent>
          <EmptyState
            icon={<NotificationsOutlined sx={{ fontSize: 64 }} />}
            title="No notifications"
            description="You're all caught up!"
          />
        </CardContent>
      </Card>
    </Box>
  );
}
