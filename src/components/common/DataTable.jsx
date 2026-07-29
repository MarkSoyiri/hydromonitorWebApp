import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Typography, Box, LinearProgress, Skeleton,
  useMediaQuery, useTheme, Card, CardContent,
} from '@mui/material';
import { motion } from 'framer-motion';
import { EmptyState } from './EmptyState';

function MobileCardView({ columns, rows, onRowClick, loading }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
        {[...Array(5)].map((_, i) => (
          <Card key={i} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  {columns.slice(0, 2).map((col) => (
                    <Box key={col.key || col.field} sx={{ mb: 0.5 }}>
                      <Skeleton variant="text" width={col.width || 80} height={16} />
                    </Box>
                  ))}
                </Box>
                <Skeleton variant="rounded" width={60} height={28} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (rows.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
      {rows.map((row, index) => {
        const firstCol = columns[0];
        const secondCol = columns[1];
        const statusCol = columns.find((c) =>
          c.key === 'status' || c.field === 'status' || c.key === 'role' || c.field === 'role'
        );

        return (
          <motion.div
            key={row.id || row._id || row.uid || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card
              onClick={() => onRowClick?.(row)}
              sx={{
                borderRadius: 3,
                cursor: onRowClick ? 'pointer' : 'default',
                '&:active': onRowClick ? { transform: 'scale(0.98)' } : undefined,
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {firstCol && (
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3, mb: 0.25 }}>
                        {firstCol.render
                          ? firstCol.render(row, index)
                          : row[firstCol.field || firstCol.key] ?? '—'}
                      </Typography>
                    )}
                    {secondCol && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {secondCol.render
                          ? secondCol.render(row, index)
                          : row[secondCol.field || secondCol.key] ?? '—'}
                      </Typography>
                    )}
                  </Box>
                  {statusCol && (
                    <Box sx={{ flexShrink: 0, ml: 1 }}>
                      {statusCol.render
                        ? statusCol.render(row, index)
                        : row[statusCol.field || statusCol.key] ?? null}
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {columns.slice(2).filter((c) => c.key !== statusCol?.key && c.field !== statusCol?.field).map((col) => (
                    <Box key={col.key || col.field} sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', display: 'block' }}>
                        {col.label}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {col.render
                          ? col.render(row, index)
                          : row[col.field || col.key] ?? '—'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </Box>
  );
}

export function DataTable({
  columns,
  rows,
  loading,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  emptyTitle,
  emptyDescription,
  emptyAction,
  stickyHeader,
  mobileCardView = true,
}) {
  const displayRows = rows || [];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (mobileCardView && isMobile) {
    if (displayRows.length === 0 && !loading) {
      return (
        <Paper sx={{ overflow: 'hidden' }}>
          <EmptyState
            title={emptyTitle || 'No data found'}
            description={emptyDescription}
            action={emptyAction}
          />
        </Paper>
      );
    }

    return (
      <>
        {loading && displayRows.length > 0 && <LinearProgress sx={{ mb: 1 }} />}
        <MobileCardView
          columns={columns}
          rows={displayRows}
          onRowClick={onRowClick}
          loading={loading && displayRows.length === 0}
        />
        {totalCount !== undefined && (
          <TablePagination
            component="div"
            count={totalCount || displayRows.length}
            page={page || 0}
            rowsPerPage={rowsPerPage || 25}
            onPageChange={(_, p) => onPageChange?.(p)}
            onRowsPerPageChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ '.MuiTablePagination-toolbar': { flexWrap: 'wrap' } }}
          />
        )}
      </>
    );
  }

  const cellSx = isMobile ? { py: 0.75, px: 1 } : {};

  if (loading && displayRows.length === 0) {
    return (
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <LinearProgress />
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {(columns || []).map((col) => (
                <TableCell key={col.key || col.field} style={col.style} sx={cellSx}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {(columns || []).map((col) => (
                  <TableCell key={col.key || col.field} sx={cellSx}>
                    <Skeleton variant="text" width={col.width || 100} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (displayRows.length === 0) {
    return (
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <EmptyState
          title={emptyTitle || 'No data found'}
          description={emptyDescription}
          action={emptyAction}
        />
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      {loading && <LinearProgress />}
      <Table stickyHeader={stickyHeader} size={isMobile ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key || col.field}
                align={col.align || 'left'}
                sx={{
                  ...cellSx,
                  width: col.width,
                  minWidth: col.minWidth,
                  ...col.style,
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayRows.map((row, index) => (
            <TableRow
              key={row.id || row._id || row.index || index}
              hover
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col) => (
                <TableCell key={col.key || col.field} align={col.align || 'left'} sx={cellSx}>
                  {col.render
                    ? col.render(row, index)
                    : row[col.field || col.key] ?? '—'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalCount !== undefined && (
        <TablePagination
          component="div"
          count={totalCount || displayRows.length}
          page={page || 0}
          rowsPerPage={rowsPerPage || 25}
          onPageChange={(_, p) => onPageChange?.(p)}
          onRowsPerPageChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </TableContainer>
  );
}
