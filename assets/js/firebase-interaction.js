import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getDatabase, ref, push, onValue, runTransaction
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAv-M8IC5eC2Gp73wcKdgkqSLng_ze37i0",
  authDomain: "fundedstartups-61ab9.firebaseapp.com",
  databaseURL: "https://fundedstartups-61ab9-default-rtdb.firebaseio.com",
  projectId: "fundedstartups-61ab9",
  storageBucket: "fundedstartups-61ab9.appspot.com",
  messagingSenderId: "763075463662",
  appId: "1:763075463662:web:1402044bfb3d91e06126ff",
  measurementId: "G-D8C6PVJ21F"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Helpers
function sanitizePath(path) {
  return path.replace(/[.#$[\]]/g, "_");
}
function sanitizeInput(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function setCookie(name, value, days = 30) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
  const cookieArr = document.cookie.split(";").map(c => c.trim());
  for (let cookie of cookieArr) {
    if (cookie.startsWith(name + "=")) return cookie.split("=")[1];
  }
  return "";
}
function hasUpvoted(id) {
  const val = getCookie("upvotedStartups");
  return val && val.split(",").includes(id);
}
function addUpvoteToCookie(id) {
  const val = getCookie("upvotedStartups");
  const arr = val ? val.split(",") : [];
  if (!arr.includes(id)) {
    arr.push(id);
    setCookie("upvotedStartups", arr.join(","), 30);
  }
}

function initFirebaseInteractions() {
  const container = document.querySelector("[data-startup-key]");
  if (!container) return;

  const rawKey = container.getAttribute("data-startup-key") || "";
  const startupKey = sanitizePath(rawKey);
  if (!startupKey) return;

  const upvoteBtn = document.getElementById("upvoteButton");
  const upvoteCount = document.getElementById("upvoteCount");

  const commentsList = document.getElementById("commentsList");
  const commentsTitle = document.getElementById("commentsTitle");
  const noCommentsText = document.getElementById("noCommentsText");
  const commentStatus = document.getElementById("commentStatus");

  const upRef = ref(db, `upvotes/${startupKey}/count`);
  const comRef = ref(db, `comments/${startupKey}`);

  // Load upvotes
  onValue(upRef, (snapshot) => {
    const count = snapshot.val() || 0;
    upvoteCount.textContent = count;
    if (upvoteBtn) upvoteBtn.disabled = hasUpvoted(startupKey);
  });

  // Load comments
  onValue(comRef, (snapshot) => {
    commentsList.innerHTML = "";
    if (!snapshot.exists()) {
      commentsTitle.style.display = "none";
      noCommentsText.style.display = "block";
      return;
    }

    noCommentsText.style.display = "none";
    commentsTitle.style.display = "block";

    const arr = [];
    snapshot.forEach(child => {
      arr.push(child.val());
    });

    arr.sort((a, b) => a.timestamp - b.timestamp);

    for (let c of arr) {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `<strong>${sanitizeInput(c.username)}</strong>: ${sanitizeInput(c.comment)}`;
      commentsList.appendChild(li);
    }
  });

  // Handle upvotes
  if (upvoteBtn) {
    upvoteBtn.addEventListener("click", () => {
      if (hasUpvoted(startupKey)) return;
      runTransaction(upRef, (count) => (count || 0) + 1)
        .then(() => {
          addUpvoteToCookie(startupKey);
          upvoteBtn.disabled = true;
        })
        .catch(console.error);
    });
  }

  // Handle comment submission
  const commentForm = document.getElementById("commentForm");
  if (commentForm) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const comment = document.getElementById("comment").value.trim();
      if (!username || !comment) return;

      push(comRef, {
        username,
        comment,
        timestamp: Date.now()
      }).then(() => {
        commentForm.reset();
        commentStatus.style.display = "block";
        setTimeout(() => {
          commentStatus.style.display = "none";
        }, 3000);
      }).catch(console.error);
    });
  }
}

document.addEventListener("DOMContentLoaded", initFirebaseInteractions);
