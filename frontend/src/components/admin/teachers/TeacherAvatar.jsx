import { useState } from "react";

function getInitials(teacher) {
  const initials = [teacher?.firstName, teacher?.lastName]
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("");

  if (initials) {
    return initials.toUpperCase();
  }

  return (teacher?.fullName || "TR")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TeacherAvatar({ teacher, size = "md" }) {
  const [failedImage, setFailedImage] = useState("");
  const profileImage = teacher?.profileImage || "";
  const className = `teacher-avatar teacher-avatar-${size}`;

  if (profileImage && failedImage !== profileImage) {
    return (
      <span className={className}>
        <img
          src={profileImage}
          alt={teacher?.fullName || "Teacher"}
          onError={() => setFailedImage(profileImage)}
        />
      </span>
    );
  }

  return (
    <span
      className={`${className} teacher-avatar-fallback`}
      aria-hidden="true"
    >
      {getInitials(teacher)}
    </span>
  );
}

export default TeacherAvatar;
