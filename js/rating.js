// File: js/rating.js
// Berfungsi untuk halaman daftar semua rating tempat (<section id="ratings">)

// Pastikan setActivePage bisa diakses (didefinisikan global di navigation.js atau diimpor)


// Sample data untuk rating tempat (bisa diambil dari server nantinya)
let placeRatingsData = [ // Ganti nama variabel agar tidak konflik jika ada file ratingPage.js lain
  {
    id: "place_1", // Gunakan ID yang konsisten
    name: "Greenfield Elementary School",
    category: "school",
    address: "123 Education St, Springfield",
    overallRating: 4.5,
    aspects: { cleanliness: 4, service: 5, quality: 4, price: 5, accessibility: 4, atmosphere: 4 },
    commentsText: "Great school with excellent teachers. The facilities are well-maintained and the curriculum is comprehensive.", // Ganti nama field
    author: "Parent123",
    date: "2025-05-10",
    likes: 12
  },
  {
    id: "place_2",
    name: "City General Hospital",
    category: "hospital",
    address: "456 Health Ave, Springfield",
    overallRating: 3.8,
    aspects: { cleanliness: 4, service: 3, quality: 4, price: 3, accessibility: 5, atmosphere: 3 },
    commentsText: "Good medical care but waiting times can be long. Staff is generally friendly and professional.",
    author: "HealthConscious",
    date: "2025-05-05",
    likes: 8
  }
];

// DOM elements (pastikan ada di halaman 'ratings')
const ratingsListEl = document.getElementById('ratingsList'); // Ganti nama agar unik
const ratingsSearchEl = document.getElementById('ratingsSearch');
const ratingsCategoryEl = document.getElementById('ratingsCategory');
const ratingsSortEl = document.getElementById('ratingsSort');
const newRatingBtnEl = document.getElementById('newRatingBtn'); // Tombol "Add New Rating"

// Fungsi untuk menampilkan bintang rating
function generateStarsHTML(ratingValue, maxStars = 5) {
    let starsHTML = '';
    const fullStars = Math.floor(ratingValue);
    const halfStar = (ratingValue % 1) >= 0.5 ? 1 : 0;
    const emptyStars = maxStars - fullStars - halfStar;

    for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fa-solid fa-star"></i>';
    if (halfStar) starsHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
    for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="fa-regular fa-star"></i>';
    return starsHTML;
}

// Display all ratings
function displayPlaceRatings(ratingsToDisplay) { // Ganti nama fungsi
  if (!ratingsListEl) {
    // console.warn('Element with ID "ratingsList" not found. Ratings cannot be displayed.');
    return;
  }
  ratingsListEl.innerHTML = '';
  
  ratingsToDisplay.forEach(rating => {
    const ratingElement = document.createElement('div');
    ratingElement.className = 'rating-card'; // Anda perlu CSS untuk .rating-card
    ratingElement.innerHTML = `
      <div class="rating-header">
        <h3 class="rating-place-name">${rating.name}</h3>
        <span class="rating-category">${rating.category}</span>
      </div>
      <div class="rating-meta">
        <span>${rating.address}</span>
        <span>Date: ${rating.date}</span>
      </div>
      <div class="rating-overall">
        <div class="rating-stars">
          ${generateStarsHTML(rating.overallRating)}
        </div>
        <span class="rating-value">${rating.overallRating.toFixed(1)}</span>
      </div>
      <p class="rating-comments-summary">${rating.commentsText.substring(0, 100)}...</p> 
      <div class="rating-actions">
        <button class="btn-like-rating" data-rating-id="${rating.id}">
            <i class="fa-solid fa-thumbs-up"></i> Like (${rating.likes || 0})
        </button>
        <button class="btn small add-rating-btn" data-place-id="${rating.id}" data-place-name="${rating.name}">
            <i class="fa-solid fa-plus"></i> Beri/Edit Rating
        </button>
      </div>
    `;
    // Tambahkan detail aspek jika diperlukan, atau buat tombol "Lihat Detail"
    // yang akan menampilkan aspek rating di modal atau halaman lain.
    
    ratingsListEl.appendChild(ratingElement);
  });
  
  // Tambahkan event listener untuk tombol like di daftar rating
  document.querySelectorAll('#ratingsList .btn-like-rating').forEach(btn => {
    btn.removeEventListener('click', handleRatingLike); // Hindari duplikasi
    btn.addEventListener('click', handleRatingLike);
  });
}

// Handle rating like
function handleRatingLike(e) {
  const ratingId = e.currentTarget.getAttribute('data-rating-id');
  const rating = placeRatingsData.find(r => r.id === ratingId);
  
  if (rating) {
    if (e.currentTarget.classList.contains('liked')) {
        rating.likes = (rating.likes || 0) - 1;
        e.currentTarget.classList.remove('liked');
    } else {
        rating.likes = (rating.likes || 0) + 1;
        e.currentTarget.classList.add('liked');
    }
    e.currentTarget.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> Like (${rating.likes})`;
    // Tidak perlu re-render semua jika hanya update like count
  }
}

// Filter and sort ratings
function filterAndSortPlaceRatings() { // Ganti nama fungsi
  if (!ratingsSearchEl || !ratingsCategoryEl || !ratingsSortEl || !placeRatingsData) return;

  const searchTerm = ratingsSearchEl.value.toLowerCase();
  const categoryValue = ratingsCategoryEl.value;
  const sortValue = ratingsSortEl.value;
  
  let filtered = [...placeRatingsData];
  
  if (searchTerm) {
    filtered = filtered.filter(rating => 
      rating.name.toLowerCase().includes(searchTerm) || 
      (rating.address && rating.address.toLowerCase().includes(searchTerm))
    );
  }
  
  if (categoryValue !== 'all') {
    filtered = filtered.filter(rating => rating.category === categoryValue);
  }
  
  if (sortValue === 'newest') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortValue === 'highest') {
    filtered.sort((a, b) => b.overallRating - a.overallRating);
  } else if (sortValue === 'lowest') {
    filtered.sort((a, b) => a.overallRating - b.overallRating);
  }
  
  displayPlaceRatings(filtered);
}

// Event listeners untuk filter
if (ratingsSearchEl) ratingsSearchEl.addEventListener('input', filterAndSortPlaceRatings);
if (ratingsCategoryEl) ratingsCategoryEl.addEventListener('change', filterAndSortPlaceRatings);
if (ratingsSortEl) ratingsSortEl.addEventListener('change', filterAndSortPlaceRatings);

// Tombol "Add New Rating"
if (newRatingBtnEl) {
  newRatingBtnEl.addEventListener('click', () => {
    // Alur untuk "Add New Rating":
    // 1. Mungkin tampilkan modal untuk mencari/memasukkan nama tempat baru.
    // 2. Setelah tempat dipilih/dibuat, ambil ID dan namanya.
    // 3. Kemudian navigasi ke #place-rating-detail dengan data tersebut.
    // Untuk saat ini, kita akan langsung ke #place-rating-detail (asumsi tempat dipilih via cara lain atau formnya generik)
    // Kosongkan detail tempat di form rating detail, karena ini rating baru
    const ratingPlaceNameEl = document.getElementById('ratingPlaceName');
    const detailedRatingPlaceIdEl = document.getElementById('detailedRatingPlaceId');
    if (ratingPlaceNameEl) ratingPlaceNameEl.textContent = 'Beri Rating Tempat Baru';
    if (detailedRatingPlaceIdEl) detailedRatingPlaceIdEl.value = `new_place_${Date.now()}`; // ID sementara

    // Panggil fungsi reset bintang di halaman detail (jika ada dan bisa diakses)
    if(typeof resetAllStarInputsVisual === 'function') { // Fungsi dari nearbyPlaces.js
        resetAllStarInputsVisual();
    }
    const commentsArea = document.getElementById('ratingComments');
    if (commentsArea) commentsArea.value = '';


    if (typeof setActivePage === 'function') {
      setActivePage('place-rating-detail');
    } else {
      console.error('Fungsi navigasi setActivePage tidak ditemukan.');
    }
  });
}

// Inisialisasi halaman rating (tampilkan rating awal)
if (ratingsListEl) {
    filterAndSortPlaceRatings();
} else {
    // console.warn("ratingsListEl element not found on this page, ratings page not initialized.");
}