// File: js/nearbyPlaces.js
// Catatan: Sebagian besar fungsionalitas asli file ini bergantung pada #nearbyPlacesSection
// yang telah dihapus dari halaman prediksi. Logika di sini perlu disesuaikan
// atau dipindahkan ke halaman 'ratings' jika fungsionalitas pencarian tempat dan rating
// akan diimplementasikan di sana.

// Logika untuk tombol "Beri Rating Detail" (jika tombol ini ada di tempat lain, misal di halaman "ratings")
// dan interaksi bintang untuk halaman #place-rating-detail.

 // Deklarasikan bahwa fungsi ini ada (didefinisikan di navigation.js)

document.addEventListener('DOMContentLoaded', () => {
    // --- Logika untuk Halaman Detail Rating (#place-rating-detail) ---
    const detailedRatingForm = document.getElementById('detailedRatingForm');
    const ratingStarsContainers = document.querySelectorAll('#place-rating-detail .stars');
    const ratingSubmissionStatus = document.getElementById('ratingSubmissionStatus');
    const ratingPlaceNameElementOnDetailPage = document.getElementById('ratingPlaceName'); // ID di hal. detail rating
    const detailedRatingPlaceIdElementOnDetailPage = document.getElementById('detailedRatingPlaceId'); // ID di hal. detail rating
    const backToPreviousPageBtn = document.getElementById('backToSearchBtn'); // Tombol kembali di hal. detail rating

    // Interaksi Bintang Rating di #place-rating-detail
    if (ratingStarsContainers.length > 0) {
        ratingStarsContainers.forEach(starsContainer => {
            const stars = starsContainer.querySelectorAll('i.fa-star');
            const aspect = starsContainer.dataset.aspect;
            const hiddenInput = document.getElementById(`input${aspect.charAt(0).toUpperCase() + aspect.slice(1)}`);

            if (!hiddenInput) {
                // console.warn(`Hidden input for aspect "${aspect}" not found.`);
                return;
            }

            stars.forEach(star => {
                star.addEventListener('mouseover', () => {
                    const siblingStars = starsContainer.querySelectorAll('i.fa-star'); // Ambil ulang scope bintang
                    resetStarClasses(siblingStars);
                    const currentValue = parseInt(star.dataset.value);
                    highlightStars(siblingStars, currentValue);
                });

                star.addEventListener('mouseout', () => {
                    const siblingStars = starsContainer.querySelectorAll('i.fa-star');
                    const selectedValue = hiddenInput.value ? parseInt(hiddenInput.value) : 0;
                    resetStarClasses(siblingStars);
                    highlightStars(siblingStars, selectedValue, true); // Terapkan kelas 'selected'
                });

                star.addEventListener('click', () => {
                    const siblingStars = starsContainer.querySelectorAll('i.fa-star');
                    const currentValue = parseInt(star.dataset.value);
                    hiddenInput.value = currentValue;
                    resetStarClasses(siblingStars);
                    highlightStars(siblingStars, currentValue, true); // Terapkan kelas 'selected'
                });
            });
        });
    }

    function highlightStars(starElements, value, isSelecting = false) {
        starElements.forEach(s => {
            if (parseInt(s.dataset.value) <= value) {
                s.classList.remove('fa-regular');
                s.classList.add('fas');
                if (isSelecting) {
                    s.classList.add('selected'); // Untuk menandai yang sudah dipilih permanen
                } else {
                    s.classList.add('highlighted'); // Untuk hover
                }
            } else { // Pastikan bintang setelahnya kembali regular dan tidak selected/highlighted
                s.classList.remove('fas', 'selected', 'highlighted');
                s.classList.add('fa-regular');
            }
        });
    }

    function resetStarClasses(starElements) {
        starElements.forEach(s => {
            // Hanya hapus 'highlighted', biarkan 'selected' jika ada
            s.classList.remove('highlighted'); 
            if (!s.classList.contains('selected')){ // Jika tidak selected, pastikan jadi regular
                 if(s.classList.contains('fas')) { // Jika terlanjur jadi solid karena hover
                    s.classList.remove('fas');
                    s.classList.add('fa-regular');
                 }
            }
        });
    }
    
    // Submit Form Rating Detail di #place-rating-detail
    if (detailedRatingForm) {
        detailedRatingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(detailedRatingForm);
            const ratingData = {
                placeId: formData.get('placeId'),
                placeName: ratingPlaceNameElementOnDetailPage ? ratingPlaceNameElementOnDetailPage.textContent : 'Unknown Place',
                comments: formData.get('ratingComments'),
                aspects: {}
            };
            
            document.querySelectorAll('#detailedRatingForm .stars').forEach(sc => {
                const aspect = sc.dataset.aspect;
                const inputElement = document.getElementById(`input${aspect.charAt(0).toUpperCase() + aspect.slice(1)}`);
                if (inputElement) {
                    ratingData.aspects[aspect] = inputElement.value || '0'; // Default ke 0 jika tidak ada nilai
                }
            });

            console.log('Rating Data Submitted:', ratingData); 

            if (ratingSubmissionStatus) {
                ratingSubmissionStatus.textContent = 'Terima kasih! Rating Anda telah berhasil dikirim (simulasi).';
                ratingSubmissionStatus.classList.remove('hidden');
                ratingSubmissionStatus.classList.add('success'); 

                setTimeout(() => {
                    ratingSubmissionStatus.classList.add('hidden');
                    ratingSubmissionStatus.classList.remove('success');
                }, 5000);
            }
            detailedRatingForm.reset();
            resetAllStarInputsVisual();
        });

        const resetRatingBtn = document.getElementById('resetRatingBtn');
        if (resetRatingBtn) {
            resetRatingBtn.addEventListener('click', function() {
                resetAllStarInputsVisual();
                const commentsArea = document.getElementById('ratingComments');
                if (commentsArea) commentsArea.value = '';
            });
        }
    }

    function resetAllStarInputsVisual() {
        if (ratingStarsContainers.length > 0) {
            ratingStarsContainers.forEach(starsContainer => {
                const stars = starsContainer.querySelectorAll('i.fa-star');
                const aspect = starsContainer.dataset.aspect;
                const hiddenInput = document.getElementById(`input${aspect.charAt(0).toUpperCase() + aspect.slice(1)}`);
                if (hiddenInput) hiddenInput.value = '';
                
                stars.forEach(s => { // Reset visual bintang
                    s.classList.remove('fas', 'selected', 'highlighted');
                    s.classList.add('fa-regular');
                });
            });
        }
    }

    // Tombol kembali di halaman #place-rating-detail
    if (backToPreviousPageBtn) {
        backToPreviousPageBtn.addEventListener('click', () => {
            // Idealnya kembali ke halaman 'ratings' atau halaman sebelumnya yang relevan
            if (typeof setActivePage === 'function') {
                setActivePage('ratings'); // Mengarahkan ke halaman daftar rating
            } else {
                console.error('Fungsi navigasi setActivePage tidak ditemukan.');
            }
        });
    }


    // --- Logika untuk tombol-tombol di dalam place-card (JIKA MASIH ADA/DIPINDAHKAN) ---
    // Catatan: Jika .place-card dibuat dinamis, gunakan event delegation pada kontainer induknya.
    // Contoh: document.getElementById('ratingsList').addEventListener('click', function(event) { ... });

    // Logika untuk .btn-rate-detail (misalnya dari halaman 'ratings' jika ada daftar tempat di sana)
    // Ini perlu event delegation jika .btn-rate-detail ada di dalam elemen yang dinamis.
    // Untuk sekarang, asumsikan event listener dipasang pada elemen yang sudah ada saat DOMContentLoaded.
    // Jika tidak, kode ini perlu dipindah ke dalam fungsi yang dipanggil setelah elemen dibuat.
    
    // Fungsi untuk menangani klik pada tombol "Add Rating" (atau "Beri Rating Detail")
    // Fungsi ini mungkin perlu dipanggil dari halaman "ratings" setelah tempat dipilih.
    window.setupRatingNavigation = function(buttonSelector, targetPageId) {
        // Menggunakan event delegation pada document body jika tombol dibuat dinamis
        document.body.addEventListener('click', function(event) {
            const targetButton = event.target.closest(buttonSelector);
            if (targetButton) {
                const placeId = targetButton.dataset.placeId;
                const placeName = targetButton.dataset.placeName;

                if (ratingPlaceNameElementOnDetailPage) {
                    ratingPlaceNameElementOnDetailPage.textContent = placeName || 'Rate This Place';
                }
                if (detailedRatingPlaceIdElementOnDetailPage) {
                    detailedRatingPlaceIdElementOnDetailPage.value = placeId || '';
                }
                resetAllStarInputsVisual(); // Reset bintang saat pindah ke halaman rating

                if (typeof setActivePage === 'function') {
                    setActivePage(targetPageId);
                } else {
                    console.error('Fungsi navigasi (setActivePage) tidak ditemukan.');
                }
            }
        });
    };

    // Panggil setup ini untuk tombol .add-rating-btn yang mengarah ke place-rating-detail
    // Anda akan menempatkan tombol dengan kelas .add-rating-btn di daftar tempat pada halaman "ratings"
    setupRatingNavigation('.add-rating-btn', 'place-rating-detail');
    
    // Contoh untuk tombol "View Ratings" jika ada (mungkin menampilkan modal atau bagian lain)
    // setupRatingNavigation('.view-ratings-btn', 'ratings'); // Ini akan re-navigate ke halaman ratings, mungkin bukan ini tujuannya.
                                                            // Mungkin lebih baik menampilkan detail rating di halaman yang sama atau modal.
});