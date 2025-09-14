from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import os
import traceback # Untuk traceback error yang lebih detail

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"--- INFO DEBUGGING AWAL ---")
print(f"File app.py berada di: {BASE_DIR}")
print(f"Skrip Python dijalankan dari (Current Working Directory): {os.getcwd()}")
try:
    print(f"Isi dari direktori {BASE_DIR}:")
    for item in os.listdir(BASE_DIR):
        print(f"  - {item}")
except Exception as e:
    print(f"  Error saat membaca isi direktori {BASE_DIR}: {e}")
print(f"--- AKHIR INFO DEBUGGING AWAL ---")

model_filename = './model/rf_pipelineV2.pkl'
model_path = os.path.join(BASE_DIR, model_filename)
model = None

print(f"\nMencoba memuat model dari: {model_path}")
try:
    with open(model_path, 'rb') as f_model:
        model = pickle.load(f_model)
    print(f"Model '{model_filename}' berhasil dimuat.")
except FileNotFoundError:
    print(f"ERROR: File model '{model_filename}' TIDAK DITEMUKAN di '{model_path}'")
except Exception as e:
    print(f"ERROR saat memuat model '{model_filename}': {e}")
    traceback.print_exc()

if not model:
    print("\nPERINGATAN SERIUS: PIPELINE GAGAL DIMUAT! Prediksi tidak akan berfungsi.")
else:
    print("\nPipeline berhasil dimuat.")

RAW_INPUT_COLUMNS = [
    'Gender', 'Married', 'Dependents', 'Education', 'Self_Employed',
    'ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term',
    'Credit_History', 'Property_Area'
]

json_map = {
    'gender': 'Gender',
    'married': 'Married',
    'dependents': 'Dependents',
    'education': 'Education',
    'selfEmployed': 'Self_Employed',
    'applicantIncome': 'ApplicantIncome',
    'coapplicantIncome': 'CoapplicantIncome',
    'loanAmount': 'LoanAmount',
    'loanTerm': 'Loan_Amount_Term',
    'creditHistory': 'Credit_History',
    'propertyArea': 'Property_Area'
}

def status_pinjam(pred):
    if pred == 'Y':
        return "Disetujui"
    elif pred == 'N':
        return "Ditolak"
    else:
        return "Tidak Diketahui"

@app.route('/predict_loan_approval', methods=['POST'])
def predict_loan_approval():
    print("\n--- Menerima Permintaan Prediksi (Mapping Manual & Penyesuaian Scaling) ---")
    if not model:
        error_msg = "Model atau Scaler tidak termuat dengan benar di server. Prediksi dibatalkan."
        print(f"[PREDICT_ERROR] {error_msg}")
        return jsonify({'error': error_msg, 'prediction': None, 'status_text': "Tidak Diketahui"}), 500

    try:
        data_input_json = request.get_json(force=True)
        print(f"[PREDICT_INFO] Data mentah diterima dari frontend: {data_input_json}")

        # --- Map nama field dari frontend ke kolom pipeline ---
        data_input_json_std = {json_map[k]: v for k, v in data_input_json.items() if k in json_map}
        print(f"[PREDICT_INFO] Setelah mapping key: {data_input_json_std}")

        input_df = pd.DataFrame([data_input_json_std], columns=RAW_INPUT_COLUMNS)
        print(f"[PREDICT_INFO] DataFrame yang akan dikirim ke pipeline:\n{input_df.to_string()}")

        numerical_cols = ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History']
        categorical_cols = ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed', 'Property_Area']

        for col in numerical_cols:
            input_df[col] = pd.to_numeric(input_df[col], errors='coerce')
        input_df[numerical_cols] = input_df[numerical_cols].fillna(0)

        for col in categorical_cols:
            input_df[col] = input_df[col].astype(str).replace(['nan', 'None', ''], 'Unknown')

        print("[PREDICT_INFO] dtypes DataFrame final:")
        print(input_df.dtypes)
        print("[PREDICT_INFO] DataFrame final:")
        print(input_df)

        # --- LAKUKAN PREDIKSI ---
        prediction = model.predict(input_df)
        prediction_proba = None
        if hasattr(model, "predict_proba"):
            prediction_proba = model.predict_proba(input_df)

        hasil_prediksi = str(prediction[0])  # 'Y' atau 'N'
        status_str = status_pinjam(hasil_prediksi)
        print(f"[PREDICT_INFO] Hasil prediksi akhir: {hasil_prediksi} ({status_str})")

        return jsonify({
            'prediction': hasil_prediksi,
            'status_text': status_str,
            'probabilities': prediction_proba[0].tolist() if prediction_proba is not None else None
        })
    except Exception as e:
        print(f"[PREDICT_CRITICAL_ERROR] Exception tidak terduga di endpoint prediksi: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Terjadi kesalahan internal server yang tidak terduga: {str(e)}', 'prediction': None, 'status_text': "Tidak Diketahui"}), 500

if __name__ == '__main__':
    print("\nMenjalankan server Flask...")
    app.run(host='0.0.0.0', port=5000, debug=True)
