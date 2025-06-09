import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getDatabase, ref, get, set, update, onValue, push } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js';

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
};};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const startupKey = document.querySelector('[data-startup-key]')?.getAttribute('data-startup-key');
const upvoteRef = ref(db, `startups/${startupKey}/upvotes`);
const commentsRef = ref(db, `startups/${startupKey}/comments`);

const upvoteCount = document.getElementById('upvoteCount');
const upvoteButton = document.getElementById('upvoteButton');
const commentForm = document.getElementById('commentForm');
const commentStatus = document.getElementById('commentStatus');
const commentsList = document.getElementById('commentsList');
const commentsTitle = document.getElementById('commentsTitle');
const noCommentsText = document.getElementById('noCommentsText');

if (startupKey) {
  // Display upvote count
  onValue(upvoteRef, (snapshot) => {
    const count = snapshot.val() || 0;
    upvoteCount.textContent = count;
  });

  // Handle upvotes
  upvoteButton?.addEventListener('click', async () => {
    const snapshot = await get(upvoteRef);
    const current = snapshot.exists() ? snapshot.val() : 0;
    await set(upvoteRef, current + 1);
  });

  // Handle comment submission
  commentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const comment = document.getElementById('comment').value.trim();
    if (!username || !comment) return;

    await push(commentsRef, {
      username,
      comment,
      timestamp: Date.now()
    });

    commentForm.reset();
    commentStatus.style.display = 'block';
    setTimeout(() => commentStatus.style.display = 'none', 3000);
  });

  // Display comments
  onValue(commentsRef, (snapshot) => {
    commentsList.innerHTML = '';
    if (!snapshot.exists()) {
      noCommentsText.style.display = 'block';
      commentsTitle.style.display = 'none';
      return;
    }

    noCommentsText.style.display = 'none';
    commentsTitle.style.display = 'block';
    const comments = snapshot.val();
    Object.values(comments).sort((a, b) => b.timestamp - a.timestamp).forEach(({ username, comment }) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `<strong>${username}:</strong> ${comment}`;
      commentsList.appendChild(li);
    });
  });
}
