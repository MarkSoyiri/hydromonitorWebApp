/**
 * Saves a blob (e.g. a PDF from the backend) to disk. Expects the axios
 * blob response directly.
 */
export function saveBlob(response, fallbackName = 'download') {
  const blob = response?.data;
  if (!blob || !(blob instanceof Blob)) {
    throw new Error('Could not generate the file.');
  }

  const disposition = response?.headers?.['content-disposition'] || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || `${fallbackName}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
