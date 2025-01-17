import React, { useState, useEffect } from "react";
import styles from "./styles/StudentHome.module.css";
import StudentWeeklyCalendar from "./StudentWeeklyCalendar";
import StudentSideBar from "./component/StudentSideBar";

function StudentHome() {
  const [schedule, setSchedule] = useState([
    { id: 1, day: "Monday", time: "1:00 PM", title: "CSE 1325 Tutoring" },
    {
      id: 2,
      day: "Wednesday",
      time: "3:00 PM",
      title: "Coding Assignment Help",
    },
  ]);

  useEffect(() => {
    // Fetch schedule from MongoDB here
    // Example:
    // axios.get('/api/schedule').then(response => setSchedule(response.data));
  }, []);

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <StudentSideBar></StudentSideBar>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <h1 className={styles.heading}>Dashboard</h1>

        {/* Schedule Section */}
        <section>
          <h2>This Week's Schedule</h2>
          <StudentWeeklyCalendar schedule={schedule} />
        </section>

        {/* Notifications Section */}
        <section className={styles.notifications}>
          <h2>Notifications</h2>
          <p>No new notifications</p>
        </section>
      </div>
    </div>
  );
}

export default StudentHome;
