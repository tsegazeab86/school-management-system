export function formatTeacherDate(value) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(
    String(value).includes("T") ? value : `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTeacherCurrency(value) {
  const number = Number(value);

  if (value === null || value === undefined || value === "" || !Number.isFinite(number)) {
    return "Not provided";
  }

  return `ETB ${number.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function formatTeacherExperience(value) {
  const number = Number(value);

  if (value === null || value === undefined || value === "" || !Number.isFinite(number)) {
    return "Not provided";
  }

  return `${number} year${number === 1 ? "" : "s"}`;
}

export function formatTeacherList(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return "Not provided";
  }

  return value.join(", ");
}

export function getTeacherStatusClass(status) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();

  if (normalized === "on leave") {
    return "is-on-leave";
  }

  if (normalized === "inactive") {
    return "is-inactive";
  }

  return "is-active";
}
