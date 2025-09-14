// File: js/navigation.js

/**
 * Fungsi utama untuk menangani perpindahan halaman dalam SPA.
 * Menyembunyikan semua halaman, menampilkan halaman target, mengupdate link navigasi aktif,
 * dan memuat skrip khusus halaman jika diperlukan.
 * @param {string} pageId - ID dari elemen <section> halaman yang akan ditampilkan.
 */
function setActivePage(pageId) {
  const pages = document.querySelectorAll('.main-content .page');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

  let pageFound = false;
  pages.forEach(p => {
    if (p.id === pageId) {
      p.classList.add('active');
      pageFound = true;
    } else {
      p.classList.remove('active');
    }
  });

  if (pageFound) {
    window.scrollTo(0, 0); // Scroll ke atas halaman baru
  } else {
    console.warn(`Halaman dengan ID "${pageId}" tidak ditemukan. Menampilkan halaman home.`);
    const homePage = document.getElementById('home');
    if (homePage) {
        homePage.classList.add('active');
        pageId = 'home'; // Set pageId ke home untuk highlighting navLink
    }
  }

  navLinks.forEach(l => {
    l.classList.remove('active');
    if (l.getAttribute('data-page') === pageId) {
      l.classList.add('active');
    }
  });

  // Memuat skrip khusus halaman secara dinamis
  // Pastikan variabel window.namaScriptLoaded dicek untuk menghindari pemuatan ganda
  if (pageId === 'community' && !window.forumScriptLoaded) {
    console.log('Memuat js/forum.js...');
    const script = document.createElement('script');
    script.src = 'js/forum.js';
    script.defer = true;
    document.body.appendChild(script);
    window.forumScriptLoaded = true;
  } else if (pageId === 'ratings' && !window.ratingsScriptLoaded) {
    console.log('Memuat js/rating.js...');
    const script = document.createElement('script');
    script.src = 'js/rating.js';
    script.defer = true;
    document.body.appendChild(script);
    window.ratingsScriptLoaded = true;
  } else if (pageId === 'exploration' && typeof initializeExplorationCharts === 'function' && !window.explorationChartsInitialized) {
    // Fungsi initializeExplorationCharts() harus didefinisikan di charts.js
    console.log('Menginisialisasi chart eksplorasi...');
    initializeExplorationCharts();
    window.explorationChartsInitialized = true;
  }
  // Tambahkan logika untuk halaman lain jika perlu
  // Misalnya, untuk halaman detail rating, logikanya ada di nearbyPlaces.js
  // atau bisa dibuatkan file terpisah jika kompleks, misal ratingDetailPage.js
  if (pageId === 'place-rating-detail' && typeof initializeRatingDetailPage === 'function' && !window.ratingDetailPageScriptLoaded ) {
    // initializeRatingDetailPage() bisa ada di nearbyPlaces.js atau file baru
    // initializeRatingDetailPage();
    // window.ratingDetailPageScriptLoaded = true;
    // Untuk saat ini, logika place-rating-detail ada di nearbyPlaces.js dan dimuat bersama nearbyPlaces.js
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  const startPredictionBtn = document.getElementById('startPrediction');
  const appContainer = document.getElementById('appContainer');

  // Inisialisasi halaman berdasarkan status login dari auth.js
  // auth.js akan menangani apakah loginPage atau appContainer yang ditampilkan.
  // Jika appContainer ditampilkan, kita set halaman aktif awal.
  if (appContainer && !appContainer.classList.contains('hidden')) {
    const activeLinkInitially = document.querySelector('.sidebar-nav .nav-link.active');
    if (activeLinkInitially) {
      setActivePage(activeLinkInitially.getAttribute('data-page'));
    } else {
      setActivePage('home'); // Halaman default jika tidak ada yang aktif
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      setActivePage(pageId);
      
      if (sidebar && window.innerWidth <= 768 && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
      }
    });
  });
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  }
  
  if (startPredictionBtn) {
    startPredictionBtn.addEventListener('click', function() {
      setActivePage('prediction');
      if (sidebar && window.innerWidth <= 768 && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
      }
    });
  }
  
  // Handle resize untuk sidebar (opsional, bisa disesuaikan)
  if (sidebar) {
    let desktopSidebarForcedOpen = window.innerWidth > 768;
    // if (desktopSidebarForcedOpen) { // Awalnya set 'active' jika desktop
    //     sidebar.classList.add('active');
    // }

    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        // if (!sidebar.classList.contains('active') && desktopSidebarForcedOpen) {
          // sidebar.classList.add('active'); // Selalu terbuka di desktop jika desainnya begitu
        // }
        // desktopSidebarForcedOpen = true;
      } else {
        // Di mobile, jangan paksa buka/tutup saat resize, biarkan user control
        // sidebar.classList.remove('active'); 
        // desktopSidebarForcedOpen = false;
      }
    });
  }
});