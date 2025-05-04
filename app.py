import streamlit as st
import pandas as pd
import numpy as np
import pickle
import matplotlib.pyplot as plt
import seaborn as sns

# Kalo mau run website di vscode
# ketik di terminal: streamlit run app.py

# Set Page config
st.set_page_config(
    page_title= "🏦 House Loan Approval Prediction",
    page_icon= "",
    layout= "wide"
)

# Function to load models
@st.cache_resource
def load_models():
    with open(".//Model//model_rfV2.pkl", "rb") as f:
        rf_model = pickle.load(f)
    return rf_model

# Function to load scalers
@st.cache_resource
def load_scalers():
    with open('.//Model//scaler.pkl','rb') as f:
        scaler_model = pickle.load(f)
    return scaler_model
    
# Function to load datasets
@st.cache_data
def load_data():
    return pd.read_csv(".//Datasets//train.csv")

#load models and data
try:
    rf_model = load_models()
    scaler_model = load_scalers()
    df = load_data()
    models_loaded = True
except Exception as e:
    st.error(f"Error loading models or data: {e}")
    models_loaded = False


# Main Title 
st.title("🏦 House Loan Approval Prediction App")

# Sidebar
st.sidebar.header("Navigation")
page = st.sidebar.radio('Select Page: ', ['Home', 'Data Exploration', 'Loan Status Prediction'])

# Home Page
if page == "Home":

    col1, col2 = st.columns(2)

    with col1:
        st.write("""
            ### About the App
            This app predicts the user's eligibility to apply house loan
            based on the following factors:
                 
            - Gender: Female || Male  
            - Dependents: 0, 1, 2, 3+  
            - Education: Graduate || Not Graduate 
            - Self Employed: Yes || No  
            - Applicant Income: (in Indian Rupee)  
            - Coapplicant Income: (in Indian Rupee)  
            - Loan Amount: (in Indian Rupee)  
            - Loan Amount Term: (Numerical month)  
            - Credit History: 0.0 || 1.0  
            - Property Area: Urban, Semiurban, Rural                   

            This app uses Random Forest machine learning model.
        """)
    
    with col2:
        st.image(".//Media//Property_Finance_Condo_Loan_sts_1372683893.jpg", use_container_width=True)
    st.write("""
    ### How to use the App
    1. **Data Exploration**: View and analyze the datasets used for model training.
    2. **Price Prediction**: Input User's data and get House Loan Prediction.

    use the sidebar on the left to navigate between pages. 
    """)


# Data Exploration page
elif page == "Data Exploration":
    st.header("Data Exploration")

    if models_loaded:
        #display datasets
        st.subheader("Home Loan Approval Dataset")
        st.dataframe(df)
        st.write("---")

        # Display summary statistics
        st.subheader("Descriptive Statistics")
        st.write(df.describe())
        st.write("---")

        # Display histoplot
        st.subheader("Numerical Feature Distribution")
        num_columns = ['ApplicantIncome','CoapplicantIncome','LoanAmount']
        num_feature = st.selectbox("Select Feature:", num_columns)

        fig, ax= plt.subplots(figsize=(12, 6))
        sns.histplot(df[num_feature], kde=True, bins=30, ax=ax)
        ax.set_title(f"Distribution of {num_feature}")
        st.pyplot(fig)
        st.write("---")

        # Display countplot
        st.subheader("Categorical Feature Distribution")
        cat_columns = ['Gender','Married','Dependents','Education','Self_Employed',	'Property_Area', 'Credit_History']
        cat_feature = st.selectbox("Select Feature:", cat_columns)

        fig, axb= plt.subplots(figsize=(12, 6))
        sns.countplot(data=df,x=cat_feature, hue='Loan_Status', ax=axb)
        axb.set_title(f"Distribution of {cat_feature}")
        st.pyplot(fig)
        st.write("---")

        #Display Outlier
        st.subheader("Plotting Outlier")
        fig, ax= plt.subplots(figsize=(12,6))
        sns.boxplot(df[num_columns], ax=ax)
        st.pyplot(fig)


# Prediction Page
elif page == "Loan Status Prediction":
    st.header("House Loan Prediction")

    if models_loaded:
        col1, col2,= st.columns(2)

    # Map for categorical features
    gender_map = {'Male': 1, 'Female': 0}
    married_map = {'Yes': 1, 'No': 0}
    dependents_map = {'0': 0, '1': 1, '2': 2, '3+': 3}  # if 3+ was encoded as 3
    education_map = {'Graduate': 0, 'Not Graduate': 1}
    self_employed_map = {'Yes': 1, 'No': 0}
    property_area_map = {'Rural': 0, 'Semiurban': 1, 'Urban': 2}

    with col1:
        st.subheader('Categorical Features')
        st.write('---')
        Gender = st.selectbox("Applicant Gender:", ['Male', 'Female'])
        Dependents = st.selectbox("Dependent:", ['0', '1', '2', '3+'])
        Married = st.selectbox("Married:", ['Yes', 'No'])
        Education = st.selectbox('Education:', ['Graduate', 'Not Graduate'])
        Self_Employed = st.selectbox("Self Employed:", ['Yes', 'No'])
        Credit_History = st.selectbox('Credit History:', [0.0, 1.0])
        Property_Area = st.selectbox("Property(House) Area:", ['Rural', 'Urban', 'Semiurban'])

    with col2:
        st.subheader('Numerical Features')
        st.write('---')
        ApplicantIncome = st.number_input('Applicant Income:', value=1000.0)
        CoapplicantIncome = st.number_input("Coapplicant Income:", value=1000.0)
        LoanAmount = st.number_input('Loan Amount (x1000):', value=100.0)
        Loan_Amount_Term = st.number_input('Loan Amount Term(Month):', value=360)

    
    # Create Feature array
    features = np.array([[gender_map[Gender], married_map[Married], dependents_map[Dependents], education_map[Education],
       self_employed_map[Self_Employed], ApplicantIncome, CoapplicantIncome, LoanAmount,
       Loan_Amount_Term, Credit_History,property_area_map[Property_Area]]])

    # scaled the features
    scaled_features = scaler_model.transform(features)

    if st.button("Predict House Loan Status"):
        
        prediction = rf_model.predict(scaled_features)[0]
        label_prediction = {1:'Yes', 0:'No'}
        # Display prediction
        st.success(f"Predicted House Loan Approval: {label_prediction.get(prediction)}")


    # Display feature importance
    st.write("---")
    st.subheader('Feature Importance in Prediction')
    feature_importance = pd.DataFrame({
        'Feature': ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed',
       'ApplicantIncome', 'CoapplicantIncome', 'LoanAmount',
       'Loan_Amount_Term', 'Credit_History', 'Property_Area'],
       'Importance': rf_model.feature_importances_
    }).sort_values('Importance', ascending=True)

    fig, ax= plt.subplots(figsize=(12,6))
    sns.barplot(x='Importance', y='Feature', data=feature_importance, palette='rocket', ax=ax)
    ax.set_title("Feature Importance (Random Forest)")
    st.pyplot(fig)
