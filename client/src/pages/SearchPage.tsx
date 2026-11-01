import { useState } from "react";

import { Link } from "react-router-dom";

import styles from "./SearchPage.module.css";

function SearchPage() {
  
  return (
    <div className={styles.resourcesContainer}>
      <div className={styles.resourcesTitleBox}>
        <h1>Available Resources</h1>
      </div>
    </div>
  );
}

export default SearchPage;
