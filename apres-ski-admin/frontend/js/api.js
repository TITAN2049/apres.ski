const API_BASE = "http://localhost:5000/api";

export const fetchUsers = async (token) => {
    return await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());
};

export const fetchStates = async (token) => {
    return await fetch(`${API_BASE}/states`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());
};

export const fetchTowns = async (token, stateId = null) => {
    const url = stateId ? `${API_BASE}/towns?state_id=${stateId}` : `${API_BASE}/towns`;
    return await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());
};

export const fetchBusinesses = async (token, townId = null, classification = null) => {
    const params = new URLSearchParams();
    if (townId) params.append("town_id", townId);
    if (classification) params.append("classification", classification);
    return await fetch(`${API_BASE}/businesses?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());
};

export const fetchEvents = async (token, townId = null, calendarTypeId = null) => {
    const params = new URLSearchParams();
    if (townId) params.append("town_id", townId);
    if (calendarTypeId) params.append("calendar_type_id", calendarTypeId);
    return await fetch(`${API_BASE}/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());
};
