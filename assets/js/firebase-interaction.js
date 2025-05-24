import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  runTransaction
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase config — replace with your actual keys
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

// Detect if we're on a startup or firm page
const body = document.body;
const startupId = body.dataset.startupKey || null;
const vcId = body.dataset.vcKey || null;

const entityId = startupId || vcId;
const isStartup = Boolean(startupId);

// Construct DB paths
const commentPath = isStartup ? `startup_comments/${entityId}` : `comments/${entityId}`;
const upvotePath = isStartup ? `startup_upvotes/${entityId}` : `upvotes/${entityId}`;

// DOM Elements
const upvoteBtn = document.getElementById("upvote-btn");
const upvoteCountEl = document.getElementById("upvote-count");
const commentInput = document.getElementById("comment-text");
const submitBtn = document.getElementById("submit-comment");
const commentsContainer = document.getElementById("comments-container");

// Upvotes
function setupUpvotes() {
  const countRef = ref(db, `${upvotePath}/count`);
  onValue(countRef, (snapshot) => {
    const count = snapshot.val() || 0;
    upvoteCountEl.textContent = `${count} upvotes`;
  });

  upvoteBtn?.addEventListener("click", () => {
    runTransaction(countRef, (current) => (current || 0) + 1);
  });
}

// Comments
function setupComments() {
  const commentsRef = ref(db, commentPath);

  onValue(commentsRef, (snapshot) => {
    const comments = snapshot.val() || {};
    commentsContainer.innerHTML = "";
    Object.values(comments).forEach((comment) => {
      const div = document.createElement("div");
      div.className = "comment";
      div.textContent = comment.text;
      commentsContainer.appendChild(div);
    });
  });

  submitBtn?.addEventListener("click", () => {
    const text = commentInput.value.trim();
    if (!text) return;
    const newCommentRef = push(ref(db, commentPath));
    set(newCommentRef, { text });
    commentInput.value = "";
  });
}

// Init
if (entityId) {
  setupUpvotes();
  setupComments();
}

