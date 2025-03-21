import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from '../../styles/StudentSchedule.module.css';
import StudentSidebar from '../../components/Sidebar/StudentSidebar';

// Get configuration from environment variables
const PROTOCOL = process.env.REACT_APP_PROTOCOL || 'https';
const BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST || 'localhost';
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || '4000';

// Construct the backend URL dynamically
const BACKEND_URL = `${PROTOCOL}://${BACKEND_HOST}:${BACKEND_PORT}`;

function StudentSchedule() {
  const [tutors, setTutors] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTutor, setSelectedTutor] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [specialRequest, setSpecialRequest] = useState('');
  const [userData, setUserData] = useState(null);

  // Initial fetch of user session data
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/session`, {
          withCredentials: true
        });
        
        if (response.data && response.data.user) {
          setUserData(response.data.user);
        } else {
          setError('No user session found. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        setError('Failed to authenticate user. Please log in again.');
      } finally {
        setSessionLoading(false);
      }
    };
    
    fetchUserSession();
  }, []);

  // Define fetchUpcomingSessions as a useCallback function
  const fetchUpcomingSessions = useCallback(async () => {
    if (!userData || !userData.id) return;
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/sessions/student/${userData.id}`, {
        withCredentials: true
      });
      setUpcomingSessions(response.data);
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
    }
  }, [userData]);

  // Define fetchAvailableTimeSlots as a useCallback function
  const fetchAvailableTimeSlots = useCallback(async () => {
    if (!selectedDate || !selectedTutor) return;
    
    try {
      setError('');
      const response = await axios.get(
        `${BACKEND_URL}/api/sessions/availability/${selectedTutor}/${selectedDate}`,
        { withCredentials: true }
      );
      
      if (Array.isArray(response.data)) {
        if (response.data.length > 0) {
          setAvailableTimeSlots(response.data);
        } else {
          setAvailableTimeSlots([]);
          setError('No availability for selected date');
        }
        setSelectedTime('');
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to fetch available time slots');
      setAvailableTimeSlots([]);
      setSelectedTime('');
    }
  }, [selectedDate, selectedTutor]);

  // Initial data fetch once session is loaded
  useEffect(() => {
    if (userData && userData.id) {
      const fetchTutors = async () => {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/users/tutors`, {
            withCredentials: true
          });
          setTutors(response.data);
          setLoading(false);
        } catch (error) {
          setError('Error loading tutors');
          setLoading(false);
        }
      };

      fetchTutors();
      fetchUpcomingSessions();
    }
  }, [userData, fetchUpcomingSessions]);

  // Fetch time slots whenever date or tutor changes
  useEffect(() => {
    fetchAvailableTimeSlots();
  }, [fetchAvailableTimeSlots]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedTime('');
  };

  const handleTutorChange = (e) => {
    const newTutor = e.target.value;
    setSelectedTutor(newTutor);
    setSelectedTime('');
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');

    if (!userData || !userData.id) {
      setError('User session expired. Please log in again.');
      return;
    }

    try {
      const localDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      const response = await axios.post(`${BACKEND_URL}/api/sessions`, {
        tutorId: selectedTutor,
        studentId: userData.id, // Use session data instead of localStorage
        sessionTime: localDateTime.toISOString(),
        duration: 60,
        specialRequest
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setSuccessMessage('Session booked successfully!');
        fetchUpcomingSessions();
        // Reset form
        setSelectedDate('');
        setSelectedTutor('');
        setSelectedTime('');
        setSpecialRequest('');
        setAvailableTimeSlots([]);
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error booking session:', error);
      setError(error.response?.data?.message || 'Error booking session');
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (sessionLoading || loading) {
    return (
      <div className={styles.container}>
        <StudentSidebar selected="Schedule" />
        <div className={styles.mainContent}>
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.container}>
        <StudentSidebar selected="Schedule" />
        <div className={styles.mainContent}>
          <div className={styles.error}>
            Session expired or not found. Please log in again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <StudentSidebar selected="Schedule" />
      <div className={styles.mainContent}>
        <div className={styles.scheduleContainer}>
          <h1 className={styles.heading}>Schedule a Session</h1>
          
          {error && <div className={styles.error}>{error}</div>}
          {successMessage && <div className={styles.success}>{successMessage}</div>}

          <div className={styles.bookingGrid}>
            <div className={styles.bookingForm}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>New Booking</h2>
                <form onSubmit={handleBooking} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="tutor">Select Tutor</label>
                    <select
                      id="tutor"
                      value={selectedTutor}
                      onChange={handleTutorChange}
                      required
                      className={styles.formSelect}
                    >
                      <option value="">Select a tutor</option>
                      {tutors.map((tutor) => (
                        <option key={tutor._id} value={tutor._id}>
                          {tutor.firstName} {tutor.lastName} 
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="date">Select Date</label>
                    <input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className={styles.formInput}
                    />
                  </div>

                  {selectedDate && selectedTutor && (
                    <div className={styles.formGroup}>
                      <label htmlFor="time">Select Time</label>
                      <select
                        id="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        required
                        className={styles.formSelect}
                      >
                        <option value="">Select time</option>
                        {availableTimeSlots.map((slot, index) => (
                          <option key={index} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="specialRequest">Special Requests</label>
                    <textarea
                      id="specialRequest"
                      placeholder="Any special requests or notes for the tutor?"
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      className={styles.formTextarea}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTutor || !selectedTime}
                    className={styles.submitButton}
                  >
                    Book Session
                  </button>
                </form>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className={styles.upcomingSessions}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Upcoming Sessions</h2>
                <div className={styles.sessionsGrid}>
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session) => (
                      <div key={session._id} className={styles.sessionCard}>
                        <p className={styles.tutorName}>
                          {session.tutorID.firstName} {session.tutorID.lastName}
                        </p>
                        <p className={styles.sessionTime}>
                          {formatDateTime(session.sessionTime)}
                        </p>
                        <p className={styles.sessionDuration}>
                          Duration: {session.duration} minutes
                        </p>
                        <p className={styles.sessionStatus}>
                          Status: {session.status}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noSessions}>No upcoming sessions</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentSchedule;