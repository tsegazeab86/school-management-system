import { useState } from "react";

function getInitials(firstName, lastName, fullName) {
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("");

  if (initials) {
    return initials.toUpperCase();
  }

  return (fullName || "ST")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StudentAvatar({ student, size = "md" }) {
  const [failedPhoto, setFailedPhoto] = useState("");
  const photo = student?.photo || "";
  const initials = getInitials(
    student?.firstName,
    student?.lastName,
    student?.fullName
  );

  const className = `admin-students-avatar admin-students-avatar-${size}`;

  if (photo && failedPhoto !== photo) {
    return (
      <span className={className}>
        <img
          src={photo}
          alt={student.fullName || "Student"}
          onError={() => setFailedPhoto(photo)}
        />
      </span>
    );
  }

  return (
    <span className={`${className} admin-students-avatar-fallback`}>
      {initials}
    </span>
  );
}

export default StudentAvatar;
