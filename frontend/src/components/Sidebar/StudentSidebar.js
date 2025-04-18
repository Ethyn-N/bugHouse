import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/component/SideBar.module.css";
import { handleLogout } from "../../utils/authUtils";
import BaseSidebar from "./BaseSidebar";

const StudentSidebar = ({ selected }) => {
  const navigate = useNavigate();

  return (
    <BaseSidebar >
      <button
        className={selected === "home" ? `${styles.selected}` : ""}
        onClick={() => navigate("/home")}
      >
        Dashboard
      </button>
      <button
        className={selected === "profile" ? `${styles.selected}` : ""}
        onClick={() => navigate("/student-profile")}
      >
        Profile
      </button>
      <button
        className={selected === "find-tutors" ? `${styles.selected}` : ""}
        onClick={() => navigate("/find-tutors")}
      >
        Find Tutors
      </button>
      <button
        className={selected === "my-sessions" ? `${styles.selected}` : ""}
        onClick={() => navigate("/my-sessions")}
      >
        My Sessions
      </button>
      <button
        className={selected === "my-tutors" ? `${styles.selected}` : ""}
        onClick={() => navigate("/my-tutors")}
      >
        My Tutors
      </button>
      <button
        className={selected === "student-schedule" ? `${styles.selected}` : ""}
        onClick={() => navigate("/StudentSchedule")}
      >
        Schedule
      </button>
      <button
        className={selected === "notifications" ? `${styles.selected}` : ""}
        onClick={() => navigate("/notifications")}
      >
        Notifications
      </button>
      <button
        className={selected === "feedback" ? `${styles.selected}` : ""}
        onClick={() => navigate("/feedback")}
      >
        Leave Feedback
      </button>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Log Out
      </button>
    </BaseSidebar>
  );
};

export default StudentSidebar;
