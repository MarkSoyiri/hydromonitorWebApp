export const isObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);

export const extractList = (data) => {
  if (Array.isArray(data)) return data;
  if (isObject(data)) {
    return Object.entries(data).map(([id, val]) => ({
      ...(isObject(val) ? val : {}),
      id,
    }));
  }
  return [];
};

export const extractData = (response) => {
  const apiData = response?.data;
  if (!apiData) return null;
  return apiData.data ?? null;
};

export const isSuccess = (response) => {
  return response?.data?.success === true;
};
