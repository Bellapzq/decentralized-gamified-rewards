import pdfplumber
import requests
import time
import io
from datetime import datetime, timedelta
from collections import OrderedDict
import json

def download_pdf(url):
    response = requests.get(url)
    if response.status_code == 200:
        return io.BytesIO(response.content)
    else:
        print("Failed to download PDF. Status code:", response.status_code)
        return None

def extract_table_from_pdf(pdf_file):
    with pdfplumber.open(pdf_file) as pdf:
        # If the table is on the first page, you can adjust the page index if it is not.
        first_page = pdf.pages[0]
        table = first_page.extract_table()
        if table:
            
            table=table[:-2]
            # for row in table:
            #     print(row)
            return table
        else:
            print("No table found on the first page")
            return None

def filter_last_30_days(data):
    result = {}
    today = datetime.today()
    start_date = today - timedelta(days=30)
    month_indices = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4,
        'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
        'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    }

    for row in data[1:]:
        day_str = row[0].replace('st', '').replace('nd', '').replace('rd', '').replace('th', '')
        try:
            day = int(day_str)
        except ValueError:
            continue
        
        for month, month_idx in month_indices.items():
            if row[month_idx] not in ["", "fl"]:
                # Construct the dates, ensuring all dates are in the year 2024.
                date_str = f'2024-{month_indices[month]:02d}-{day:02d}'
                try:
                    date = datetime.strptime(date_str, '%Y-%m-%d')
                except ValueError as e:
                    print(f"Error parsing date: {date_str} - {e}")
                    continue

                if start_date <= date <= today:
                    precipitation = row[month_idx]
                    result[date.strftime('%Y-%m-%d')] = precipitation

    return result

def save_to_json(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def scrape_pdf_data():
    pdf_url = "https://reg.bom.gov.au/tmp/cdio/IDCJAC0009_066037_2024.pdf"
    pdf_file = download_pdf(pdf_url)
    if pdf_file:
        table = extract_table_from_pdf(pdf_file)
        if table:
            data = filter_last_30_days(table)
            sorted_data = OrderedDict(sorted(data.items()))
            print(sorted_data)
            save_to_json(sorted_data, 'rainfall_last_30_days.json')
            print("Data saved to rainfall_last_30_days.json")
        

scrape_pdf_data()