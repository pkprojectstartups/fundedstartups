import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCAA588yxf40QdEJghoEQqfh37AK828MKw",
  authDomain: "vc-comments.firebaseapp.com",
  databaseURL: "https://vc-comments-default-rtdb.firebaseio.com",
  projectId: "vc-comments",
  storageBucket: "vc-comments.appspot.com",
  messagingSenderId: "114746372203",
  appId: "1:114746372203:web:6b08497167b5a6c46dc12e"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Cookie Helpers
function hasUpvoted(id) {
  return document.cookie.includes(`upvote_${id}=1`);
}
function addUpvoteToCookie(id) {
  document.cookie = `upvote_${id}=1; path=/; max-age=31536000`;
}

// Init Upvotes
function initStartupCardUpvotes() {
  const buttons = document.querySelectorAll(".upvote-button");
  console.log("Found", buttons.length, "startup upvote buttons");

  buttons.forEach((button) => {
    const id = button.getAttribute("data-startup-id");
    const countEl = document.querySelector(`.upvote-count[data-startup-id="${id}"]`);
    const upvoteRef = ref(database, `startup_upvotes/${id}/count`);

    onValue(upvoteRef, (snapshot) => {
      const count = snapshot.val() || 0;
      if (countEl) countEl.textContent = count;
      button.disabled = hasUpvoted(id);
    }, (error) => {
      console.error("Firebase read error:", error);
    });

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (hasUpvoted(id)) return;

      runTransaction(upvoteRef, (current) => (current || 0) + 1)
        .then(() => {
          addUpvoteToCookie(id);
          button.disabled = true;
        })
        .catch((error) => {
          console.error("Upvote transaction failed:", error);
        });
    });
  });
}

document.addEventListener("DOMContentLoaded", initStartupCardUpvotes);
