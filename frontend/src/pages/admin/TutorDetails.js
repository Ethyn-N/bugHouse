import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "../../styles/TutorDetails.module.css";
import AdminSideBar from "../../components/Sidebar/AdminSidebar";
import { useSidebar } from "../../components/Sidebar/SidebarContext";

// Get configuration from environment variables
const PROTOCOL = process.env.REACT_APP_PROTOCOL || 'https';
const BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST || 'localhost';
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || '4000';

// Construct the backend URL dynamically
const BACKEND_URL = `${PROTOCOL}://${BACKEND_HOST}:${BACKEND_PORT}`;

// Inline default avatar as base64 to avoid HTTP requests
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCBmaWxsPSIjZTllOWU5IiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9Ijk2IiByPSI0MCIgZmlsbD0iIzU5NjI3NCIvPjxwYXRoIGZpbGw9IiM1OTYyNzQiIGQ9Ik0yMTYsMTk2Yy0wLjQtMzcuOC0zMi43LTY4LTcyLTY4aC0zMmMtMzkuMywwLTcxLjYsMzAuMi03Miw2OEgyMTZ6Ii8+PC9zdmc+";

function TutorDetails() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isCollapsed } = useSidebar();
  
  // Debug logs for troubleshooting
  useEffect(() => {
    console.log("TutorDetails component mounted with tutorId:", tutorId);
  }, [tutorId]);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        setLoading(true);
        console.log("Starting to fetch data for tutorId:", tutorId);
        
        // 1. Fetch tutor basic information
        console.log("Fetching user data...");
        const tutorResponse = await axios.get(`${BACKEND_URL}/api/users/${tutorId}`);
        console.log("User data received:", tutorResponse.data);
        setTutor(tutorResponse.data);
        
        // 2. Fetch tutor profile (corrected to use query parameter if that's your API format)
        console.log("Fetching profile data...");
        try {
          // Try both formats to see which one works
          let profileData = null;
          try {
            const profileResponse = await axios.get(`${BACKEND_URL}/api/profile/${tutorId}`);
            profileData = profileResponse.data;
          } catch (pathError) {
            console.log("Path parameter approach failed, trying query parameter");
            const profileResponse = await axios.get(`${BACKEND_URL}/api/profile?userId=${tutorId}`);
            profileData = profileResponse.data;
          }
          
          console.log("Profile data received:", profileData);
          setProfile(profileData);
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
          console.log("Continuing without profile data");
        }
        
        // 3. Fetch all sessions for this tutor
        console.log("Fetching sessions data...");
        const sessionsResponse = await axios.get(`${BACKEND_URL}/api/sessions?tutorID=${tutorId}`);
        console.log("Sessions data received:", sessionsResponse.data);
        const tutorSessions = sessionsResponse.data || [];
        
        // Sort sessions by date (newest first)
        tutorSessions.sort((a, b) => new Date(b.sessionTime) - new Date(a.sessionTime));
        
        // Get unique students from sessions
        const studentIds = [...new Set(tutorSessions.map(session => session.studentID))];
        console.log("Unique student IDs:", studentIds);
        
        // Fetch student information
        console.log("Fetching student data...");
        const studentData = [];
        const studentMap = {};
        
        for (const studentId of studentIds) {
          try {
            console.log("Fetching student with ID:", studentId);
            const studentResponse = await axios.get(`${BACKEND_URL}/api/users/${studentId}`);
            const student = studentResponse.data;
            studentData.push(student);
            studentMap[studentId] = student;
          } catch (error) {
            console.error(`Error fetching student ${studentId}:`, error);
          }
        }
        
        console.log("Student data received:", studentData);
        setStudents(studentData);
        
        // Add student names to sessions
        const sessionsWithStudentNames = tutorSessions.map(session => {
          const student = studentMap[session.studentID];
          return {
            ...session,
            studentName: student 
              ? `${student.firstName} ${student.lastName}`
              : "Unknown Student"
          };
        });
        
        setSessions(sessionsWithStudentNames);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tutor details:", error);
        setError(`Failed to load tutor details: ${error.message}`);
        setLoading(false);
      }
    };
    
    if (tutorId) {
      fetchTutorData();
    }
  }, [tutorId]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <AdminSideBar selected="analytics" />
        <div className={styles.mainContent} style={{ marginLeft: isCollapsed ? "100px" : "290px" , transition: "margin-left 0.5s ease"}}>
          <div className={styles.loadingContainer}>
            <p>Loading tutor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <AdminSideBar selected="analytics" />
        <div className={styles.mainContent} style={{ marginLeft: isCollapsed ? "100px" : "290px" , transition: "margin-left 0.5s ease"}}>
          <div className={styles.errorContainer}>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className={styles.container}>
        <AdminSideBar selected="analytics" />
        <div className={styles.mainContent} style={{ marginLeft: isCollapsed ? "100px" : "290px" , transition: "margin-left 0.5s ease"}}>
          <div className={styles.errorContainer}>
            <p>Tutor not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AdminSideBar selected="analytics" />
      <div className={styles.mainContent} style={{ marginLeft: isCollapsed ? "100px" : "290px" , transition: "margin-left 0.5s ease"}}>
        <div className={styles.headerContainer}>
          <h1 className={styles.heading}>Tutor Details</h1>
          <button 
            className={styles.backButton}
            onClick={() => window.history.back()}
          >
            Back to Analytics
          </button>
        </div>
        
        {/* Tutor Profile Section */}
        <div className={styles.profileSection}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarContainer}>
              {/* Debug the profile picture source */}
              {console.log("Profile picture source:", profile?.profilePicture || DEFAULT_AVATAR)}
              <img 
                src={profile?.profilePicture || DEFAULT_AVATAR} 
                alt={`${tutor.firstName} ${tutor.lastName}`} 
                className={styles.avatar}
                onError={(e) => {
                  console.error("Error loading profile image");
                  e.target.onerror = null;
                  e.target.src = DEFAULT_AVATAR;
                }}
              />
            </div>
            <div className={styles.tutorInfo}>
              <h2 className={styles.tutorName}>{tutor.firstName} {tutor.lastName}</h2>
              <div className={styles.ratingContainer}>
                <span className={styles.ratingValue}>{tutor.rating || 0}</span>
                <div className={styles.starRating}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      className={`${styles.star} ${
                        star <= Math.round(tutor.rating || 0) 
                          ? styles.filled 
                          : styles.empty
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className={styles.tutorDetail}><strong>Email:</strong> {tutor.email}</p>
              <p className={styles.tutorDetail}><strong>Phone:</strong> {tutor.phone}</p>
              {profile && (
                <>
                  <p className={styles.tutorDetail}><strong>Major:</strong> {profile.major}</p>
                  <p className={styles.tutorDetail}><strong>Year:</strong> {profile.currentYear}</p>
                </>
              )}
            </div>
          </div>

          {profile && profile.bio && (
            <div className={styles.bioSection}>
              <h3>About</h3>
              <p>{profile.bio}</p>
            </div>
          )}
          
          {/* Session Statistics */}
          <div className={styles.statsContainer}>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>{sessions.length}</span>
              <span className={styles.statLabel}>Total Sessions</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>{students.length}</span>
              <span className={styles.statLabel}>Students Tutored</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>
                {sessions.filter(s => s.status === 'Completed').length}
              </span>
              <span className={styles.statLabel}>Completed Sessions</span>
            </div>
          </div>
        </div>
        
        {/* Students Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Students Tutored</h2>
          {students.length === 0 ? (
            <p>No students yet.</p>
          ) : (
            <div className={styles.studentList}>
              {students.map(student => (
                <div key={student._id} className={styles.studentCard}>
                  <div className={styles.studentAvatar}>
                    {student.firstName?.charAt(0) || '?'}{student.lastName?.charAt(0) || '?'}
                  </div>
                  <div className={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Sessions Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Session History</h2>
          {sessions.length === 0 ? (
            <p>No sessions yet.</p>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.sessionsTable}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <tr key={session._id}>
                      <td>{session.studentName || "Unknown Student"}</td>
                      <td>{formatDate(session.sessionTime)}</td>
                      <td>{formatTime(session.sessionTime)}</td>
                      <td>{session.duration} minutes</td>
                      <td>
                        <span className={`${styles.status} ${styles[session.status.toLowerCase()]}`}>
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TutorDetails;