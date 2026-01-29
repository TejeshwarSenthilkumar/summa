const API_BASE_URL = 'http://localhost:3000/api';

/**
 * PharmaLync API Client
 * Centralized fetch wrapper for backend communication
 */
const apiClient = async (endpoint, options = {}) => {
    const token = localStorage.getItem('access_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
};

export const api = {
    // Auth
    auth: {
        login: (email, password) => apiClient('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
        register: (userData) => apiClient('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),
    },

    // Patients
    patients: {
        getProfile: (id) => apiClient(`/patients/${id}`),
        getAadhaar: (id, consentToken) => apiClient(`/patients/${id}/aadhaar`, {
            headers: { 'X-Consent-Token': consentToken }
        }),
    },

    // Medicines & QR
    medicines: {
        verifyQr: (qrToken) => apiClient('/medicines/verify-qr', {
            method: 'POST',
            body: JSON.stringify({ qrToken }),
        }),
        getQr: (id) => apiClient(`/medicines/${id}/qr`),
    },

    // Prescriptions
    prescriptions: {
        create: (data) => apiClient('/prescriptions', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        verifyQr: (qrToken) => apiClient('/prescriptions/verify-qr', {
            method: 'POST',
            body: JSON.stringify({ qrToken }),
        }),
    },
};
