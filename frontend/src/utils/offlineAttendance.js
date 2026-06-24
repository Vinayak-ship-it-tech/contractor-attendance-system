import API from "../api";

function dataURLToFile(dataUrl, filename) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }

  return new File([array], filename, { type: mime });
}

export function saveOfflineAttendance(data) {
  if (!data.work_site) {
    alert("Please select work site");
    return;
  }

  const oldData =
    JSON.parse(localStorage.getItem("offline_attendance")) || [];

  const alreadyExists = oldData.some(
    (item) =>
      item.work_site === data.work_site &&
      item.date === data.date &&
      item.time === data.time
  );

  if (alreadyExists) {
    alert("This attendance is already saved offline.");
    return;
  }

  oldData.push({
    ...data,
    offline_id: Date.now(),
    synced: false,
  });

  localStorage.setItem("offline_attendance", JSON.stringify(oldData));
  window.dispatchEvent(new Event("offlineAttendanceUpdated"));
}

export async function syncOfflineAttendance() {
  const offlineData =
    JSON.parse(localStorage.getItem("offline_attendance")) || [];

  const remaining = [];

  for (const item of offlineData) {
    try {
      if (item.type === "group_photo" && item.group_photo_base64) {
        const formData = new FormData();

        formData.append(
          "group_photo",
          dataURLToFile(
            item.group_photo_base64,
            item.file_name || `offline_${item.offline_id}.jpg`
          )
        );

        formData.append("work_site", item.work_site);
        formData.append("location", item.location || "");
        formData.append("latitude", item.latitude || "");
        formData.append("longitude", item.longitude || "");

        await API.post("upload-group-photo/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await API.post("offline-attendance/", item);
      }
    } catch (error) {
      console.error("Sync failed:", error);
      remaining.push(item);
    }
  }

  localStorage.setItem("offline_attendance", JSON.stringify(remaining));
  window.dispatchEvent(new Event("offlineAttendanceUpdated"));
}

export function getOfflineAttendanceCount() {
  const data =
    JSON.parse(localStorage.getItem("offline_attendance")) || [];

  return data.length;
}

export function getOfflineAttendance() {
  return JSON.parse(localStorage.getItem("offline_attendance")) || [];
}

export function clearOfflineAttendance() {
  localStorage.removeItem("offline_attendance");
  window.dispatchEvent(new Event("offlineAttendanceUpdated"));
}

export function deleteOfflineAttendance(offlineId) {
  const data =
    JSON.parse(localStorage.getItem("offline_attendance")) || [];

  const updated = data.filter((item) => item.offline_id !== offlineId);

  localStorage.setItem("offline_attendance", JSON.stringify(updated));
  window.dispatchEvent(new Event("offlineAttendanceUpdated"));
}