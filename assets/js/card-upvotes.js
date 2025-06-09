import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAv-M8IC5eC2Gp73wcKdgkqSLng_ze37i0",
  authDomain: "fundedstartups-61ab9.firebaseapp.com",
  databaseURL: "https://fundedstartups-61ab9-default-rtdb.firebaseio.com",
  projectId: "fundedstartups-61ab9",
  storageBucket: "fundedstartups-61ab9.firebasestorage.app",
  messagingSenderId: "763075463662",
  appId: "1:763075463662:web:1402044bfb3d91e06126ff",
  measurementId: "G-D8C6PVJ21F"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Cookie helpers
function hasUpvoted(id) {
  return document.cookie.includes(`upvote_${id}=1`);
}
function addUpvoteToCookie(id) {
  document.cookie = `upvote_${id}=1; path=/; max-age=31536000`; // 1 year
}

// Initialize all upvote buttons
function initStartupCardUpvotes() {
  const buttons = document.querySelectorAll(".upvote-button");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    const id = button.getAttribute("data-startup-id");
    const countEl = document.querySelector(`.upvote-count[data-startup-id="${id}"]`);
    const upvoteRef = ref(db, `upvotes/${id}/count`);

    // Load current upvote count
    onValue(upvoteRef, (snapshot) => {
      const count = snapshot.val() || 0;
      if (countEl) countEl.textContent = count;
      button.disabled = hasUpvoted(id);
    });

    // Handle upvote click
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (hasUpvoted(id)) return;

      runTransaction(upvoteRef, (current) => (current || 0) + 1)
        .then(() => {
          addUpvoteToCookie(id);
          button.disabled = true;
        })
        .catch((err) => {
          console.error("Upvote failed:", err);
        });
    });
  });
}

document.addEventListener("DOMContentLoaded", initStartupCardUpvotes);
