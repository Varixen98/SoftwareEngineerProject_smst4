// File: js/prediction.js

// Pastikan setActivePage bisa diakses jika diperlukan untuk navigasi dari sini
// function setActivePage(pageId); // Tidak perlu deklarasi ulang

document.addEventListener('DOMContentLoaded', function() {
  const predictionForm = document.getElementById('predictionForm');
  const resultContainer = document.getElementById('resultContainer');
  
  // Lakukan null check yang lebih aman untuk semua elemen UI
  const closeResultBtn = resultContainer ? resultContainer.querySelector('.close-result') : null;
  const predictionStatusDiv = resultContainer ? resultContainer.querySelector('.prediction-status') : null;
  const predictionResultDiv = resultContainer ? resultContainer.querySelector('.prediction-result') : null;
  const approvedIcon = resultContainer ? resultContainer.querySelector('.result-icon.approved') : null;
  const rejectedIcon = resultContainer ? resultContainer.querySelector('.result-icon.rejected') : null;
  const approvalStatusEl = resultContainer ? document.getElementById('approvalStatus') : null;
  const approvalDescriptionEl = resultContainer ? document.getElementById('approvalDescription') : null;
  const importanceChartCanvas = document.getElementById('importanceChart');

  // Fungsi untuk menampilkan pesan di area status prediksi
  function showPredictionMessage(message, isError = false) {
    if (predictionStatusDiv && predictionStatusDiv.querySelector('p')) {
        predictionStatusDiv.querySelector('p').textContent = message;
        predictionStatusDiv.classList.remove('hidden');
    }
    if (predictionResultDiv) {
        predictionResultDiv.classList.add('hidden'); // Sembunyikan hasil sebelumnya
        if (isError) {
            predictionResultDiv.classList.remove('hidden'); // Tampilkan div hasil untuk pesan error
        }
    }
    if (isError) {
        if (approvalStatusEl) approvalStatusEl.textContent = 'Error';
        // Pesan error lengkap akan diset oleh blok catch
        if (approvalDescriptionEl) approvalDescriptionEl.textContent = message; 
    }
  }


  if (predictionForm) {
    predictionForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Tombol Predict Loan Status ditekan.');

      if (!resultContainer || !predictionStatusDiv || !predictionResultDiv || !approvedIcon || !rejectedIcon || !approvalStatusEl || !approvalDescriptionEl) {
        console.error("Satu atau lebih elemen UI untuk hasil prediksi tidak ditemukan. Proses dibatalkan. Periksa ID elemen di HTML & JS.");
        alert("Terjadi kesalahan pada komponen tampilan halaman. Silakan refresh atau hubungi dukungan jika masalah berlanjut.");
        return;
      }

      const formDataForApi = {
        gender: document.getElementById('gender')?.value || "", 
        married: document.getElementById('married')?.value || "",
        dependents: document.getElementById('dependents')?.value || "",
        education: document.getElementById('education')?.value || "",
        selfEmployed: document.getElementById('selfEmployed')?.value || "",
        applicantIncome: document.getElementById('applicantIncome')?.value || "0", 
        coapplicantIncome: document.getElementById('coapplicantIncome')?.value || "0",
        loanAmount: document.getElementById('loanAmount')?.value || "0",
        loanTerm: document.getElementById('loanTerm')?.value || "0",
        creditHistory: document.getElementById('creditHistory')?.value || "",
        propertyArea: document.getElementById('propertyArea')?.value || "",
      };
      
      resultContainer.classList.remove('hidden');
      if(approvedIcon) approvedIcon.classList.add('hidden');
      if(rejectedIcon) rejectedIcon.classList.add('hidden');
      showPredictionMessage('Memproses prediksi Anda...', false); 
      if(predictionResultDiv) predictionResultDiv.classList.add('hidden'); 
      resultContainer.scrollIntoView({ behavior: 'smooth' });
      
      try {
        console.log('Mengirim data ke backend:', JSON.stringify(formDataForApi, null, 2));
        const response = await fetch('http://localhost:5000/predict_loan_approval', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formDataForApi),
        });

        const responseStatus = response.status;
        const responseStatusText = response.statusText;
        console.log('Menerima respons dari backend, status:', responseStatus, responseStatusText);
        
        const responseText = await response.text(); 
        console.log('Teks respons mentah dari backend:', responseText);

        if (predictionStatusDiv) predictionStatusDiv.classList.add('hidden'); 
        if (predictionResultDiv) predictionResultDiv.classList.remove('hidden'); 

        if (!response.ok) {
          let errorMsg = `Server error: ${responseStatus} ${responseStatusText}`;
          try {
            const errorJson = JSON.parse(responseText);
            errorMsg = errorJson.error || errorJson.message || responseText; 
          } catch (parseError) {
            console.warn("Respons error dari backend bukan JSON:", parseError);
            errorMsg = responseText.substring(0, 200) + (responseText.length > 200 ? "..." : ""); 
          }
          console.error('Error dari backend:', errorMsg);
          throw new Error(errorMsg);
        }

        const result = JSON.parse(responseText); 
        console.log('Data hasil prediksi (sudah di-parse):', result);

        if (result.error) { 
          throw new Error(result.error);
        }
        
        let isLoanApproved = false;
        if (typeof result.prediction !== 'undefined') {
            if (result.prediction === 1) {
                if(approvedIcon) approvedIcon.classList.remove('hidden');
                if(approvalStatusEl) approvalStatusEl.textContent = 'Disetujui';
                if(approvalDescriptionEl) approvalDescriptionEl.textContent = 'pinjaman Anda kemungkinan akan disetujui'; // PERUBAHAN TEKS
                isLoanApproved = true;
            } else if (result.prediction === 0) {
                if(rejectedIcon) rejectedIcon.classList.remove('hidden');
                if(approvalStatusEl) approvalStatusEl.textContent = 'Ditolak';
                if(approvalDescriptionEl) approvalDescriptionEl.textContent = 'pinjaman Anda kemungkinan akan ditolak'; // PERUBAHAN TEKS
            } else {
                if(approvalStatusEl) approvalStatusEl.textContent = 'Tidak Diketahui';
                if(approvalDescriptionEl) approvalDescriptionEl.textContent = 'hasil prediksi dari server tidak dapat dikenali'; // PERUBAHAN TEKS
                console.warn("Hasil prediksi tidak dikenali (bukan 0 atau 1):", result.prediction);
            }
        } else {
            console.error("Field 'prediction' tidak ada dalam respons dari backend:", result);
            throw new Error("Format respons dari server tidak sesuai (tidak ada field 'prediction').");
        }
        
        if (typeof Chart !== 'undefined' && importanceChartCanvas) {
            createFeatureImportanceChart(isLoanApproved); 
        } else {
            console.warn("Chart.js atau elemen canvas 'importanceChart' tidak ditemukan, chart tidak dibuat.");
        }

      } catch (error) {
        console.error('--- ERROR DALAM PROSES PREDIKSI (FRONTEND) ---');
        console.error('Pesan Error:', error.message);
        if (error.stack) {
            console.error('Stack Trace:', error.stack);
        }
        if (predictionStatusDiv) predictionStatusDiv.classList.add('hidden'); 
        if (predictionResultDiv) predictionResultDiv.classList.remove('hidden'); 
        if (approvedIcon) approvedIcon.classList.add('hidden');
        if (rejectedIcon) rejectedIcon.classList.add('hidden');
        
        // Memanggil showPredictionMessage untuk menampilkan error.message di approvalDescriptionEl
        showPredictionMessage(`${error.message}`, true); 
      }
    });
  }
  
  if (closeResultBtn) {
    closeResultBtn.addEventListener('click', function() {
      if(resultContainer) resultContainer.classList.add('hidden');
    });
  }
  
  function createFeatureImportanceChart(isApproved) {
    const importanceCtx = importanceChartCanvas;
    if (!importanceCtx || typeof Chart === 'undefined') {
        console.warn("Tidak bisa membuat chart: context atau Chart.js tidak ada.");
        return;
    }

    if (window.myImportanceChart instanceof Chart) {
        window.myImportanceChart.destroy();
    }
    
    let featureData;
    if (isApproved) {
      featureData = [ { feature: 'Credit_History', importance: 0.31 },{ feature: 'LoanAmount', importance: 0.19 },{ feature: 'ApplicantIncome', importance: 0.17 },{ feature: 'CoapplicantIncome', importance: 0.11 },{ feature: 'Property_Area', importance: 0.09 },{ feature: 'Education', importance: 0.05 },{ feature: 'Married', importance: 0.04 },{ feature: 'Dependents', importance: 0.02 },{ feature: 'Gender', importance: 0.01 },{ feature: 'Self_Employed', importance: 0.01 }];
    } else {
      featureData = [ { feature: 'Credit_History', importance: 0.35 },{ feature: 'LoanAmount', importance: 0.22 },{ feature: 'ApplicantIncome', importance: 0.14 },{ feature: 'CoapplicantIncome', importance: 0.09 },{ feature: 'Property_Area', importance: 0.08 },{ feature: 'Education', importance: 0.05 },{ feature: 'Loan_Amount_Term', importance: 0.03 },{ feature: 'Married', importance: 0.02 },{ feature: 'Dependents', importance: 0.01 },{ feature: 'Self_Employed', importance: 0.01 }];
    }
    featureData.sort((a, b) => a.importance - b.importance);
    const features = featureData.map(item => item.feature.replace(/_/g, ' '));
    const importanceValues = featureData.map(item => item.importance);
    
    window.myImportanceChart = new Chart(importanceCtx, {
      type: 'bar',
      data: {
        labels: features,
        datasets: [{
          label: 'Feature Importance', data: importanceValues,
          backgroundColor: features.map((_, i) => `hsl(215, 70%, ${35 + (i * 5)}%)`),
          borderColor: 'rgba(59, 130, 246, 1)', borderWidth: 1
        }]
      },
      options: { 
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Faktor Penentu Prediksi' },
            tooltip: { callbacks: { label: function(context) { return `Kontribusi: ${(context.raw * 100).toFixed(1)}%`;}}}
        },
        scales: {
            x: { beginAtZero: true, title: { display: true, text: 'Tingkat Kontribusi (%)' }, ticks: { callback: function(value) { return (value * 100).toFixed(0) + '%'; }}},
            y: { title: { display: false }}
        }
      }
    });
  }
});