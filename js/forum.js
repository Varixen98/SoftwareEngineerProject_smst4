// File: js/forum.js
// (Kode Anda dari sebelumnya sudah cukup baik, pastikan elemen HTML ada saat skrip ini berjalan)

// Sample data for forum posts
let forumPosts = [
  {
    id: 1,
    title: "Best schools in the area?",
    content: "I'm looking to buy a house and want to know about good schools nearby. Any recommendations?",
    author: "John D.",
    date: "2025-05-15",
    tags: ["school", "property"],
    comments: [
      {
        id: 1,
        author: "Sarah M.",
        date: "2025-05-16",
        content: "The public school on Main Street has excellent ratings!"
      },
      {
        id: 2,
        author: "Mike T.",
        date: "2025-05-17",
        content: "I recommend checking out the private schools too, they have smaller class sizes."
      }
    ],
    likes: 5
  },
  {
    id: 2,
    title: "Loan approval tips",
    content: "What are some things I can do to improve my chances of loan approval?",
    author: "Lisa K.",
    date: "2025-05-10",
    tags: ["loan", "advice"],
    comments: [
      {
        id: 1,
        author: "David P.",
        date: "2025-05-11",
        content: "Make sure your credit score is above 700 and you have stable income."
      }
    ],
    likes: 8
  }
];

// DOM elements (pastikan elemen ini ada di halaman 'community' saat script ini berjalan)
const postForm = document.getElementById('postForm');
const postsList = document.getElementById('postsList');
const forumSearch = document.getElementById('forumSearch');
const forumFilter = document.getElementById('forumFilter');

// Display all posts
function displayPosts(postsToDisplay) { // Ganti nama parameter agar tidak bentrok
  if (!postsList) {
    // console.error('Element with ID "postsList" not found. Forum posts cannot be displayed.');
    return; // Keluar jika elemen tidak ditemukan (penting jika script dimuat sebelum DOM siap)
  }
  postsList.innerHTML = '';
  
  postsToDisplay.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    // Periksa apakah post.author ada sebelum memanggil charAt(0)
    const authorInitial = post.author && post.author.length > 0 ? post.author.charAt(0) : '?';

    postElement.innerHTML = `
      <div class="post-card-header">
        <div class="post-author-avatar">${authorInitial}</div>
        <div class="post-meta">
          <h3 class="post-title">${post.title}</h3>
          <div class="post-author">${post.author}</div>
          <div class="post-date">${post.date}</div>
        </div>
      </div>
      <div class="post-content">${post.content}</div>
      <div class="post-tags">
        ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
      </div>
      <div class="post-actions">
        <div class="post-action like-btn" data-post-id="${post.id}">
          <i class="fa-solid fa-thumbs-up"></i> Like (${post.likes})
        </div>
        <div class="post-action comment-btn" data-post-id="${post.id}">
          <i class="fa-solid fa-comment"></i> Comment (${post.comments.length})
        </div>
      </div>
      <div class="comments-list" id="comments-${post.id}" style="display: none;"> ${post.comments.map(comment => {
          const commentAuthorInitial = comment.author && comment.author.length > 0 ? comment.author.charAt(0) : '?';
          return `
            <div class="comment-item">
              <div class="post-author-avatar">${commentAuthorInitial}</div>
              <div class="comment-details">
                <span class="post-author">${comment.author}</span>
                <span class="post-date">${comment.date}</span>
                <div class="comment-content">${comment.content}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <form class="comment-form" id="comment-form-${post.id}" style="display: none;"> <input type="text" class="comment-input" placeholder="Write a comment..." required>
        <button type="submit" class="btn small">Post</button>
      </form>
    `;
    
    postsList.appendChild(postElement);
  });
  
  // Tambahkan event listener setelah elemen dibuat
  addPostActionListeners();
}

function addPostActionListeners() {
    document.querySelectorAll('#postsList .like-btn').forEach(btn => {
        // Hapus listener lama untuk menghindari duplikasi jika displayPosts dipanggil lagi
        btn.removeEventListener('click', handleLike); 
        btn.addEventListener('click', handleLike);
    });
    
    document.querySelectorAll('#postsList .comment-btn').forEach(btn => {
        btn.removeEventListener('click', toggleCommentSection);
        btn.addEventListener('click', toggleCommentSection);
    });
    
    document.querySelectorAll('#postsList .comment-form').forEach(form => {
        form.removeEventListener('submit', handleCommentSubmit);
        form.addEventListener('submit', handleCommentSubmit);
    });
}


// Handle new post submission
if (postForm) {
  postForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Ini sudah benar
    console.log('Forum post submission'); // Untuk debugging
    
    const titleInput = document.getElementById('postTitle');
    const contentInput = document.getElementById('postContent');
    const tagsInput = document.getElementById('postTags');

    if (!titleInput || !contentInput || !tagsInput) {
        console.error('One or more form elements not found for new post.');
        return;
    }

    const title = titleInput.value;
    const content = contentInput.value;
    const tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    const newPost = {
      id: forumPosts.length > 0 ? Math.max(...forumPosts.map(p => p.id)) + 1 : 1, // ID unik
      title,
      content,
      author: "Current User", // Ganti dengan user yang login jika ada sistem user
      date: new Date().toISOString().split('T')[0],
      tags,
      comments: [],
      likes: 0
    };
    
    forumPosts.unshift(newPost); // Tambah ke awal array
    displayPosts(forumPosts);    // Tampilkan ulang semua post
    postForm.reset();            // Reset form
    
    // Scroll ke post baru (opsional)
    const firstPostCard = document.querySelector('#postsList .post-card:first-child');
    if (firstPostCard) {
        firstPostCard.scrollIntoView({ behavior: 'smooth' });
    }
  });
} else {
//   console.error('Element with ID "postForm" not found.');
}

// Handle like button click
function handleLike(e) {
  const postId = parseInt(e.currentTarget.getAttribute('data-post-id'));
  const post = forumPosts.find(p => p.id === postId);
  
  if (post) {
    // Simulasi: Jika sudah di-like, unlike. Jika belum, like.
    // Untuk implementasi nyata, Anda perlu menyimpan status like per user.
    if (e.currentTarget.classList.contains('liked')) {
        post.likes -= 1;
        e.currentTarget.classList.remove('liked');
    } else {
        post.likes += 1;
        e.currentTarget.classList.add('liked');
    }
    // Update teks tombol like
    e.currentTarget.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> Like (${post.likes})`;
    // Tidak perlu displayPosts(forumPosts) penuh jika hanya update jumlah like,
    // Cukup update teks tombolnya saja untuk performa lebih baik, kecuali ada perubahan struktur besar.
  }
}

// Toggle comment section (form dan list)
function toggleCommentSection(e) {
  const postId = e.currentTarget.getAttribute('data-post-id');
  const commentForm = document.getElementById(`comment-form-${postId}`);
  const commentsList = document.getElementById(`comments-${postId}`);

  if (commentForm) commentForm.style.display = commentForm.style.display === 'none' ? 'flex' : 'none';
  if (commentsList) commentsList.style.display = commentsList.style.display === 'none' ? 'block' : 'none';
}

// Handle comment submission
function handleCommentSubmit(e) {
  e.preventDefault();
  
  const postId = parseInt(this.id.split('-')[2]); // 'this' merujuk ke form
  const commentInput = this.querySelector('.comment-input');
  
  if (!commentInput) return;
  const commentContent = commentInput.value;

  if (!commentContent.trim()) {
    alert('Comment cannot be empty.');
    return;
  }
  
  const newComment = {
    id: Date.now(), // ID unik untuk komentar
    author: "Current User", // Ganti dengan user yang login
    date: new Date().toISOString().split('T')[0],
    content: commentContent
  };
  
  const post = forumPosts.find(p => p.id === postId);
  if (post) {
    post.comments.push(newComment);
    // Re-render hanya bagian komentar dari post yang relevan untuk efisiensi
    // atau panggil displayPosts(forumPosts) jika lebih mudah
    displayPosts(forumPosts); // Ini akan re-render semua, lebih mudah tapi kurang efisien
    // Bisa juga update DOM secara spesifik untuk komentar baru
    commentInput.value = ''; // Kosongkan input
  }
}

// Filter and search posts
function filterPosts() {
  if (!forumSearch || !forumFilter || !forumPosts) return; // Pastikan elemen ada

  const searchTerm = forumSearch.value.toLowerCase();
  const filterValue = forumFilter.value;
  
  let filtered = [...forumPosts]; // Salin array agar tidak mengubah data asli
  
  if (searchTerm) {
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(searchTerm) || 
      post.content.toLowerCase().includes(searchTerm) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }
  
  if (filterValue !== 'all') {
    filtered = filtered.filter(post => post.tags && post.tags.includes(filterValue));
  }
  
  displayPosts(filtered);
}

// Tambahkan event listener jika elemen ada
if (forumSearch) {
    forumSearch.addEventListener('input', filterPosts);
}
if (forumFilter) {
    forumFilter.addEventListener('change', filterPosts);
}

// Initialize the forum (tampilkan post awal)
// Cek jika postsList ada sebelum memanggil displayPosts
if (postsList) {
    displayPosts(forumPosts);
} else {
    // console.warn("postsList element not found on this page, forum not initialized.");
}