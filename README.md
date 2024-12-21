# **Stance Detection of Russia-Ukraine War Across Nations on Mainstream News**

This project aimed to analyze mainstream media coverage, specifically focusing on the current international conflict involving the Russia-Ukraine war. While countries have expressed their attitudes through official statements on the Russia-Ukraine conflict, their actions have not always aligned with these declarations. Economic deals, strategic movements, and national political decisions often reveal more complex or even conflicting attitudes.
For instance, France initially expressed its strong support for Ukraine, including condemning Russia's actions in official statements. However, France continued significant purchases of Russian natural gas, suggesting a more complex position towards Russia-Ukraine war. This conflict between diplomatic statements and actions highlights the importance of examining not only official rhetoric but also concrete actions to truly understand a country's stance.
Our project focused on monitoring and quantifying stances over time by analyzing mainstream news media coverage of diplomacy, specifically regarding Russia. By uncovering trends within media coverage, this project provided audiences with a data-driven perspective on nations' and media outlets' true stances over time.

## **Acknowledgment**
This is a school project from Columbia University, EECS 6893 Big Data Analytics class, Group 19 source code. 

We would like to thank **Professor Dr. Ching-Yung Lin** and **TAs Apurva Patel** and **Linyang He** for their guidance and support throughout this project.

## **Credits**
This project was primarily developed by:
- **Anqi Wu**  
  *Email*: aw3088@columbia.edu  

- **Zhanghao Ni**  
  *Email*: zn2209@columbia.edu  

Additionally:
- **Zishun Shen** contributed to the CNN data scraping part, implemented in the file: `1.4_cnn_scrap.py`.


## **Repository Structure**

### **1. Extracting Data**
Scripts and notebooks for data extraction from multiple sources:
- **1.1_api_NYT.ipynb**: Retrieves data from the New York Times API.
- **1.2_RT_crawler.ipynb**: Crawls articles from RT (Russia Today) website.
- **1.2_api_RT.ipynb**: Fetches data from RT API.
- **1.3_api_guardian_bbc.py**: Fetches data from The Guardian and BBC APIs.
- **1.4_cnn_scrap.py**: Scrapes articles from CNN.

### **2. Exploratory Data Analysis (EDA)**
Combining and preprocessing extracted data for analysis:
- **Processed_data_combine.ipynb**: Combines processed data from various sources.
- Preprocessing DAGs for individual sources:
  - **bbc_preprocessing_dag.py**
  - **cnn_preprocessing_dag.py**
  - **guardian_preprocessing_dag.py**
  - **rt_preprocessing_dag.py**

### **3. Comparing Models**
Evaluation of different models for stance detection:
- **Model_comparing_Anqi.ipynb**: Compares the performance of various models.

### **4. Model Training**
Processes for enhancing data and training models:
- **Data_Enhancement.ipynb**: Prepares and augments data for improved analysis.
- **Train and Analysis.ipynb**: Trains models and analyzes results.
- **label_tokenized.xlsx**: Contains tokenized and labeled data.
- **tunning_anqi_1208.ipynb**: Fine-tunes model parameters for optimal performance.

### **5. Real Analysis**
Application of trained models to real-world data:
- **Train and Analysis.ipynb**: Performs final analysis on real-world datasets.

### **6. Result Visualization**
Scripts and data for visualizing analysis results:
- **countryStance.js**: Visualizes countries' stances as a network graph.
- **dataset.js**: Contains processed data for visualization.
- **final_result.csv**: Final results of the analysis.
- **network.js**: Generates an interactive network graph.
- **processed_filtered_data.csv**: Filtered data used in visualizations.
- **result.csv**: Summarized results.
- **stance.js**: Visualizes stance analysis results.

## **Project Overview**
- Extracting data from multiple APIs and scraping sources.
- Preprocessing data to ensure consistency and quality.
- Training and fine-tuning machine learning models for stance detection.
- Visualizing results through dynamic and interactive network graphs.

## **Dataset**
The dataset used for this project is too large to be uploaded to the GitHub repository. You can access it through the following Google Drive link:

- [Download Dataset]([https://drive.google.com/your-dataset-link-here](https://drive.google.com/drive/folders/1NbjL30mSmH4ERoXnC32lkfyD_AgckPSD?usp=sharing))

### **Important Notification**
People with **lionemail access** are able to download and edit this.
After downloading the dataset, **adjust the file locations** to match the paths expected by the scripts in this repository. 
Each script assumes specific file paths for the dataset. Some of the files were already upload in their desire folders.

## **Usage**
1. **Data Extraction**: Run scripts in the "Extracting Data" section to gather data from respective sources.
2. **Preprocessing**: Use the DAG scripts in "Exploratory Data Analysis" to preprocess and clean the data.
3. **Model Training**: Train models using notebooks in "Model Training" and fine-tune parameters for optimal performance.
4. **Analysis**: Apply models to real-world datasets and analyze results.
5. **Visualization**: Use JavaScript files in "Result Visualization" to generate network graphs and other visualizations.

## **Dependencies**
- Python 3.x
- Jupyter Notebook
- Required Python libraries (listed in respective notebooks/scripts)
- JavaScript runtime environment for visualization scripts

## **License**
This repository is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
