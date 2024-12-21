
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
import pandas as pd
import re
import spacy
import string
from nltk.corpus import stopwords
import nltk
import os

#11/27/2024
#Wu.Anqi
#columbia.eecs6893

nltk.download('stopwords')
nlp = spacy.load('en_core_web_sm')

#all the file are in airflow/dags
file_path = os.path.join(os.path.dirname(__file__), "bbc_preview.csv")

# functions
def read_csv(**kwargs):
    '''
    function to read csv file and push it to xcom
    '''
    bbc = pd.read_csv(file_path, encoding='utf-8')
    kwargs['ti'].xcom_push(key='bbc_data', value=bbc.to_dict())

def clean_data(**kwargs):
    '''
    function to replace NaN value and apply cleaning
    please note: df name is specified, so is the column name of the df
    please change to the correct one, for example(mainstreamsource['title'])
    '''
    bbc = pd.DataFrame(kwargs['ti'].xcom_pull(key='bbc_data', task_ids='read_csv'))
    bbc = bbc.drop(columns=["title_tokens", "body_tokens"])
    bbc['body'] = bbc['body'].apply(remove_unnecessary_content)
    kwargs['ti'].xcom_push(key='cleaned_data', value=bbc.to_dict())

def remove_unnecessary_content(text):
    '''
    function to remove additional symbol and unnecessary html material
    please adjust them
    '''
    text = re.sub(r'http\S+|www.\S+', '', text) 
    text = re.sub(r'\[.*?\]', '', text) 
    text = re.sub(r'\s+', ' ', text).strip() 
    return text

def tokenize_and_filter(**kwargs):
    '''
    function to remove stopword and punctuation and then split sentence and tokenized
    '''
    bbc = pd.DataFrame(kwargs['ti'].xcom_pull(key='cleaned_data', task_ids='clean_data'))
    
    def preprocess_text(text):
        sentences = [sent.text for sent in nlp(text).sents]
        tokens = [token.text for sent in sentences for token in nlp(sent)]
        stop_words = set(stopwords.words('english'))
        punctuation = set(string.punctuation)
        filtered_tokens = [word for word in tokens if word not in stop_words and word not in punctuation]
        return filtered_tokens

    bbc['processed_body'] = bbc['body'].apply(preprocess_text)
    kwargs['ti'].xcom_push(key='processed_data', value=bbc.to_dict())


def save_to_csv(**kwargs):
    '''
    function to save csv in local
    please note: df name is specified, so is the column name of the df
    please change to the correct one, for example(mainstreamsource['title'])
    '''
    bbc = pd.DataFrame(kwargs['ti'].xcom_pull(key='processed_data', task_ids='tokenize_and_filter'))
    output_path = os.path.join(os.path.dirname(__file__), "bbc_processed.csv")
    bbc.to_csv(output_path, index=False, encoding='utf-8')

# define the DAG
with DAG(
    dag_id='bbc_preprocessing_dag',
    start_date=datetime(2024, 1, 1),
    schedule_interval=None,
    catchup=False,
) as dag:

    # task 1: Read CSV
    read_csv_task = PythonOperator(
        task_id='read_csv',
        python_callable=read_csv,
        provide_context=True
    )

    # task 2: Clean Data
    clean_data_task = PythonOperator(
        task_id='clean_data',
        python_callable=clean_data,
        provide_context=True
    )

    # task 3: Tokenize and Filter
    tokenize_filter_task = PythonOperator(
        task_id='tokenize_and_filter',
        python_callable=tokenize_and_filter,
        provide_context=True
    )

    # task 4: Save to CSV
    save_data_task = PythonOperator(
        task_id='save_to_csv',
        python_callable=save_to_csv,
        provide_context=True
    )

    # Task dependencies
    read_csv_task >> clean_data_task >> tokenize_filter_task >> save_data_task
