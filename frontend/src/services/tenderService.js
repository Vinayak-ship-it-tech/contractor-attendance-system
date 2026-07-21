import api from "../api";

export const getAllTenders = (params = {}) => {
    return api.get("", { params });
};

export const getDashboard = () => api.get("dashboard/");
export const getNotifications = () => api.get("notifications/");
export const getUnreadCount = () =>
    api.get("notifications/unread-count/");
export const markNotificationRead = (id) =>
    api.post(`notifications/${id}/read/`);

export const getOrganizations = () =>
    api.get("organizations/");

export const getDepartments = () =>
    api.get("departments/");

export const getTenders = (params = {}) => {
  return api.get("tenders/", { params });
};

export const getRecommendedTenders = () =>
  api.get("tenders/recommended/");