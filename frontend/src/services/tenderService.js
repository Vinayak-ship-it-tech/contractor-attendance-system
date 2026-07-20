import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/tenders/",
});

export const getAllTenders = (params = {}) => {
    return API.get("", { params });
};

export const getDashboard = () => API.get("dashboard/");
export const getNotifications = () => API.get("notifications/");
export const getUnreadCount = () =>
    API.get("notifications/unread-count/");
export const markNotificationRead = (id) =>
    API.post(`notifications/${id}/read/`);