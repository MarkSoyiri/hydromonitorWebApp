import { useState, useEffect, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { MeetingRoom } from '@mui/icons-material';
import { roomService } from '@/services';
import { extractList } from '@/utils/response';

export function RoomSelector({
  buildingId = '',
  value = '',
  onChange,
  label = 'Room',
  required = false,
  disabled = false,
  error = false,
  helperText = '',
}) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!buildingId) {
      setRooms([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    roomService
      .getAll(buildingId)
      .then(({ data }) => {
        if (!cancelled && data?.success) {
          const allRooms = extractList(data.data);
          const available = allRooms.filter(
            (r) =>
              (r.status === 'VACANT' || r.status === 'ACTIVE') &&
              (!r.tenantId || r.tenantId === '')
          );
          setRooms(available);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [buildingId]);

  const selected = useMemo(
    () => rooms.find((r) => r.roomId === value) || null,
    [rooms, value]
  );

  const handleChange = (_, newValue) => {
    const id = newValue ? newValue.roomId : '';
    onChange?.(id, newValue);
  };

  const isDisabled = disabled || !buildingId;

  return (
    <Autocomplete
      options={rooms}
      getOptionLabel={(option) => {
        const num = option.roomNumber || option.roomId;
        const floor = option.floor != null ? ` (Floor ${option.floor})` : '';
        return `${num}${floor}`;
      }}
      isOptionEqualToValue={(option, val) => option.roomId === val?.roomId}
      value={selected}
      onChange={handleChange}
      loading={loading}
      disabled={isDisabled}
      renderOption={(props, option) => (
        <li {...props} key={option.roomId}>
          {option.roomNumber || option.roomId}
          {option.floor != null ? ` — Floor ${option.floor}` : ''}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={required ? `${label} *` : label}
          placeholder={
            !buildingId
              ? 'Select a building first'
              : loading
              ? 'Loading rooms...'
              : 'Search rooms...'
          }
          error={error}
          helperText={
            helperText ||
            (!buildingId
              ? 'Select a building to see available rooms'
              : rooms.length === 0 && !loading
              ? 'No available rooms in this building'
              : '')
          }
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <MeetingRoom sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      fullWidth
    />
  );
}
