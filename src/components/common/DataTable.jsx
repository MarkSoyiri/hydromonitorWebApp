import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Typography, Box, LinearProgress, Skeleton,
} from '@mui/material';
import { EmptyState } from './EmptyState';

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
}) {
  const displayRows = rows || [];

  if (loading && displayRows.length === 0) {
    return (
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <LinearProgress />
        <Table>
          <TableHead>
            <TableRow>
              {(columns || []).map((col) => (
                <TableCell key={col.key || col.field} style={col.style}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {(columns || []).map((col) => (
                  <TableCell key={col.key || col.field}>
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
      <Table stickyHeader={stickyHeader}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key || col.field}
                align={col.align || 'left'}
                style={{
                  ...col.style,
                  width: col.width,
                  minWidth: col.minWidth,
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
              key={row.id || row._id || row.uid || row.deviceId || row.roomId || row.buildingId || index}
              hover
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col) => (
                <TableCell key={col.key || col.field} align={col.align || 'left'}>
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
