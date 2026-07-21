import api from "../api";



export const getAllTenders = (params = {}) =>
  api.get("tenders/", { params });

export const getTenders = (params = {}) =>
  api.get("tenders/", { params });

export const getDashboard = () =>
  api.get("tenders/dashboard/");

export const getNotifications = () =>
  api.get("tenders/notifications/");

export const getUnreadCount = () =>
  api.get("tenders/notifications/unread-count/");

export const markNotificationRead = (id) =>
  api.post(`tenders/notifications/${id}/read/`);

export const getOrganizations = () =>
  api.get("tenders/organizations/");

export const getDepartments = () =>
  api.get("tenders/departments/");

export const getRecommendedTenders = () =>
  api.get("tenders/recommended/");