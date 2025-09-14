// File: js/charts.js

// Fungsi ini akan dipanggil oleh navigation.js ketika halaman 'exploration' aktif
function initializeExplorationCharts() {
  // Cek jika chart sudah diinisialisasi untuk menghindari duplikasi
  if (window.explorationChartsInitializedAlready) {
    // console.log("Exploration charts already initialized.");
    return;
  }

  // Initialize tabs
  const tabBtns = document.querySelectorAll('#exploration .tab-btn');
  const tabContents = document.querySelectorAll('#exploration .tab-content');
  
  if (tabBtns.length > 0 && tabContents.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        tabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const targetTab = this.getAttribute('data-tab');
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.id === targetTab) {
            content.classList.add('active');
          }
        });
      });
    });
  } else {
    // console.warn("Tab buttons or contents not found on exploration page.");
  }
  
  // Initialize Distribution Chart
  const distributionCtx = document.getElementById('distributionChart');
  if (distributionCtx && typeof Chart !== 'undefined') { // Pastikan Chart.js sudah dimuat
    // Hancurkan chart lama jika ada untuk menghindari error saat re-inisialisasi
    if (window.myDistributionChart instanceof Chart) {
        window.myDistributionChart.destroy();
    }
    window.myDistributionChart = new Chart(distributionCtx, { // Simpan instance ke window
      type: 'bar',
      // ... (konfigurasi data dan options Anda dari sebelumnya) ...
        data: {
            labels: generateBins(0, 10000, 20),
            datasets: [{
            label: 'Applicant Income',
            data: generateNormalDistribution(20, 5000, 2000),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
            title: { display: true, text: 'Distribution of Applicant Income' },
            tooltip: { mode: 'index', intersect: false }
            },
            scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Frequency'}},
            x: { title: { display: true, text: 'Applicant Income (₹)'}}
            }
        }
    });
    
    const numFeatureSelect = document.getElementById('numFeature');
    if (numFeatureSelect) {
      numFeatureSelect.addEventListener('change', function() {
        const selectedFeature = this.value;
        let mean, stdDev, titleText; // Ganti nama variabel 'title'
        
        switch(selectedFeature) {
          case 'ApplicantIncome': mean = 5000; stdDev = 2000; titleText = 'Applicant Income'; break;
          case 'CoapplicantIncome': mean = 1500; stdDev = 1000; titleText = 'Coapplicant Income'; break;
          case 'LoanAmount': mean = 150; stdDev = 50; titleText = 'Loan Amount'; break;
          default: mean = 5000; stdDev = 2000; titleText = 'Applicant Income';
        }
        
        if (window.myDistributionChart) {
            window.myDistributionChart.data.datasets[0].data = generateNormalDistribution(20, mean, stdDev);
            window.myDistributionChart.data.datasets[0].label = titleText;
            window.myDistributionChart.options.plugins.title.text = `Distribution of ${titleText}`;
            window.myDistributionChart.options.scales.x.title.text = `${titleText} (₹)`;
            window.myDistributionChart.update();
        }
      });
    }
  } else if (!distributionCtx) {
    // console.warn("Element with ID 'distributionChart' not found.");
  } else if (typeof Chart === 'undefined') {
    // console.warn("Chart.js library not loaded.");
  }
  
  // Initialize Category Chart
  const categoryCtx = document.getElementById('categoryChart');
  if (categoryCtx && typeof Chart !== 'undefined') {
    if (window.myCategoryChart instanceof Chart) {
        window.myCategoryChart.destroy();
    }
    window.myCategoryChart = new Chart(categoryCtx, {
      type: 'bar',
      // ... (konfigurasi data dan options Anda dari sebelumnya) ...
        data: {
            labels: ['Male', 'Female'],
            datasets: [
                { label: 'Approved', data: [300, 150], backgroundColor: 'rgba(34, 197, 94, 0.6)', borderColor: 'rgba(34, 197, 94, 1)', borderWidth: 1 },
                { label: 'Rejected', data: [100, 50], backgroundColor: 'rgba(239, 68, 68, 0.6)', borderColor: 'rgba(239, 68, 68, 1)', borderWidth: 1 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { title: { display: true, text: 'Loan Approval by Gender' }, tooltip: { mode: 'index', intersect: false }},
            scales: { y: { beginAtZero: true, stacked: false, title: { display: true, text: 'Count' }}, x: { title: { display: true, text: 'Gender' }}}
        }
    });
        
    const catFeatureSelect = document.getElementById('catFeature');
    if (catFeatureSelect) {
      catFeatureSelect.addEventListener('change', function() {
        const selectedFeature = this.value;
        let labels, approved, rejected, titleText;
        
        switch(selectedFeature) {
          case 'Gender': labels = ['Male', 'Female']; approved = [300, 150]; rejected = [100, 50]; titleText = 'Gender'; break;
          case 'Married': labels = ['Yes', 'No']; approved = [350, 100]; rejected = [80, 70]; titleText = 'Married'; break;
          // ... (case lainnya)
          default: labels = ['Male', 'Female']; approved = [300, 150]; rejected = [100, 50]; titleText = 'Gender';
        }
        
        if (window.myCategoryChart) {
            window.myCategoryChart.data.labels = labels;
            window.myCategoryChart.data.datasets[0].data = approved;
            window.myCategoryChart.data.datasets[1].data = rejected;
            window.myCategoryChart.options.plugins.title.text = `Loan Approval by ${titleText}`;
            window.myCategoryChart.options.scales.x.title.text = titleText;
            window.myCategoryChart.update();
        }
      });
    }
  }
  
  // Initialize Boxplot Chart
  const boxplotCtx = document.getElementById('boxplotChart');
  if (boxplotCtx && typeof Chart !== 'undefined') {
     if (window.myBoxplotChart instanceof Chart) {
        window.myBoxplotChart.destroy();
    }
    window.myBoxplotChart = new Chart(boxplotCtx, {
      type: 'bar',
      // ... (konfigurasi data dan options Anda dari sebelumnya) ...
        data: {
            labels: ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount'],
            datasets: [
                { label: 'Min', data: [150, 0, 9], /* ... colors */ },
                { label: 'Q1 (25%)', data: [2877.5, 0, 100], /* ... colors */ },
                { label: 'Median (50%)', data: [3812.5, 1188.5, 128], /* ... colors */ },
                { label: 'Q3 (75%)', data: [5795, 2297.25, 168], /* ... colors */ },
                { label: 'Max', data: [81000, 41667, 700], /* ... colors */ }
            ]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { title: { display: true, text: 'Distribution Summary (Box Plot like)' }, tooltip: { mode: 'index', intersect: false }},
            scales: { x: { beginAtZero: true, title: { display: true, text: 'Value' }}, y: { title: { display: true, text: 'Feature' }}}
        }
    });
  }
  
  window.explorationChartsInitializedAlready = true; // Tandai sudah diinisialisasi
}
  
// Helper functions (generateBins, generateNormalDistribution) tetap sama
function generateBins(min, max, count) {
    const bins = []; const step = (max - min) / count;
    for (let i = 0; i < count; i++) {
        const binStart = min + (step * i); const binEnd = min + (step * (i + 1));
        bins.push(`${Math.round(binStart)}-${Math.round(binEnd)}`);
    } return bins;
}
function generateNormalDistribution(count, mean, stdDev) {
    const data = [];
    for (let i = 0; i < count; i++) {
        let sum = 0; for (let j = 0; j < 6; j++) { sum += Math.random(); }
        const randomValue = (sum - 3) * stdDev + mean; data.push(Math.max(0, randomValue));
    } return data;
}

// Jangan panggil initializeExplorationCharts() di sini secara langsung.
// Biarkan navigation.js memanggilnya saat halaman 'exploration' aktif.