import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../styles/ViewTutors.module.css";
import StudentSidebar from "../../components/Sidebar/StudentSidebar";
import { SearchBar } from "../../components/SearchBar";
import { SearchResultsList } from "../../components/SearchResultsList";
import { SearchResultsTutorProfiles } from "../../components/SearchResultsTutorProfiles";
import { SearchInfo } from "../../components/SearchInfo";
import { useSidebar } from "../../components/Sidebar/SidebarContext";

// Get configuration from environment variables
const PROTOCOL = process.env.REACT_APP_PROTOCOL || "https";
const BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST || "localhost";
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || "4000";

// Construct the backend URL dynamically
const BACKEND_URL = `${PROTOCOL}://${BACKEND_HOST}:${BACKEND_PORT}`;

function ViewTutors() {
  const { isCollapsed } = useSidebar();
  const [allTutors, setAllTutors] = useState([]); //Stores ALL tutor profiles
  const [loading, setLoading] = useState(true); //Allows us to output "loading.."" when somthing is loading
  const [results, setResults] = useState([]); //Will store the filtered tutor user objects (that is used for our search results) we get each time a user enters something in the searchbar
  //const [resultsList, setResultsList] = useState([]) //Will store drop down suggestions below search bar
  const [search, setSearch] = useState(""); //Will store what the user searched and will be used for SearchResultsTutorProfiles.js
  const [clicked, setClicked] = useState(true); //If this is true that means the default case of SearchInfo component will show which is that the title "All Tutors" with no return button on the side is shown
 
  //Fetching ALL tutor profiles (the default case)
  useEffect(() => {
    const fetchAllTutors = async () => {
        try {
          // Fetch all users
          const response = await axios.get(
            `${BACKEND_URL}/api/users/tutors/ALL`
          );
          const tutors = response.data.filter((user) => user.role === "Tutor");

          setResults(tutors);
          setAllTutors(tutors);
          setLoading(false);
          //console.log("Fetched all tutors:", tutors);
        } catch (error) {
          console.error("Error fetching users:", error);
          setLoading(false);
        }
      };
    fetchAllTutors();
  }, []);

  /*if (loading) {
    return <p>Loading...</p>;
  }*/

  if (loading) {
     return (
       <div className={styles.container}>
         <StudentSidebar />
         <div className={styles.mainContent} style={{ marginLeft: isCollapsed ? "80px" : "270px" , transition: "margin-left 0.5s ease"}}>
           <div className={styles.spinnerContainer}>
             <div className={styles.spinner}></div>
             <p>Loading tutors...</p>
           </div>
         </div>
       </div>
     );
  }


  return (
    <div className={styles.container}>
      <StudentSidebar selected="find-tutors"></StudentSidebar>
      <div className={styles.mainContent} style={{ marginLeft: isCollapsed ? "100px" : "290px" , transition: "margin-left 0.5s ease"}}>
        <h1 className={styles.heading}>Our Tutors</h1>
        <div className="App">
          <div className="search-bar-container">
            {/*Creates a searchbar the user can enter inputs in*/}
            <SearchBar allTutors={allTutors} setResults={setResults} /*setResultsList = {setResultsList}*/ setSearch={setSearch} setClicked={setClicked} />{" "}
            {/*<SearchResultsList results = {results} /*resultsList = {resultsList}/>*/}{/*Takes results from user input and lists Tutor profile name suggestions*/}
          </div>
          {/*This component controls the text directly below the searchbar*/}
          <SearchInfo setResults={setResults} allTutors={allTutors} search={search} setClicked={setClicked} clicked={clicked}/>
          {/*Takes results from user input and lists Tutor profile cards*/}
          <SearchResultsTutorProfiles results={results} /*setResults={setResults} allTutors={allTutors} search={search}*/ />{" "}
        </div>
      </div>
    </div>
  );
}

export default ViewTutors;