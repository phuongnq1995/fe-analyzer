import { authenticatedFetch } from "./authService";

const baseUrl = import.meta.env.VITE_API_URL;
const uploadUrl = `${baseUrl}/csv/upload`

export const uploadCsv = async (file: File, type: 'ad' | 'order', fromDate: string, toDate: string): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fromDate', fromDate);
  formData.append('toDate', toDate);

  const endpoint = type === 'ad' ? `${uploadUrl}/ad` : `${uploadUrl}/order`;

  const response = await authenticatedFetch(endpoint, {
    method: 'POST',
    // Note: Do not set Content-Type header manually when sending FormData,
    // the browser sets it automatically with the correct boundary.
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Upload failed with status ${response.status}`);
  }

  // Attempt to parse JSON, fall back to text if response isn't JSON
  try {
    return await response.json();
  } catch {
    return { message: 'Upload successful' };
  }
};
