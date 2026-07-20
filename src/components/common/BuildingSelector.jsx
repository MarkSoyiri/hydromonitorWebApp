import { useState, useEffect, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { Business } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { buildingService } from '@/services';
import { extractList } from '@/utils/response';

export function BuildingSelector({
  value = '',
  onChange,
  label = 'Building',
  required = false,
  disabled = false,
  error = false,
  helperText = '',
}) {
  const { isSuperAdmin, assignedBuildings } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) {
      setBuildings(assignedBuildings);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    buildingService
      .getAll()
      .then(({ data }) => {
        if (!cancelled && data?.success) {
          setBuildings(extractList(data.data));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, assignedBuildings]);

  const selected = useMemo(
    () => buildings.find((b) => (b.buildingId || b.id) === value) || null,
    [buildings, value]
  );

  const handleChange = (_, newValue) => {
    const id = newValue ? newValue.buildingId || newValue.id : '';
    onChange?.(id, newValue);
  };

  return (
    <Autocomplete
      options={buildings}
      getOptionLabel={(option) => option.name || option.buildingId || ''}
      isOptionEqualToValue={(option, val) =>
        (option.buildingId || option.id) === (val?.buildingId || val?.id)
      }
      value={selected}
      onChange={handleChange}
      loading={loading}
      disabled={disabled || (buildings.length === 0 && !loading)}
      renderOption={(props, option) => (
        <li {...props} key={option.buildingId || option.id}>
          {option.name || option.buildingId}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={required ? `${label} *` : label}
          placeholder={loading ? 'Loading buildings...' : 'Search buildings...'}
          error={error}
          helperText={
            helperText ||
            (buildings.length === 0 && !loading
              ? 'No buildings assigned'
              : '')
          }
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <Business sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
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
