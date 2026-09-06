import pandas as pd
import numpy as np
from faker import Faker
import json
import random

fake = Faker('en_IN') # Generates realistic Indian names, addresses, and phone numbers

def generate_crime_network_data(num_people=20, num_firs=5, num_cdrs=50, num_transfers=30):
    # 1. Generate Suspects & Entities
    people = [{'id': f"P_{i:03d}", 'name': fake.name(), 'phone': fake.phone_number()} for i in range(num_people)]
    
    # Designate 1 Kingpin and 2 Lieutenants (Ground Truth)
    kingpin = people[0]
    lieutenants = [people[1], people[2]]
    
    # 2. Generate Synthetic FIR Texts
    firs = []
    locations = ["Connaught Place, Delhi", "MG Road, Bengaluru", "Sector 17, Chandigarh", "Bandra, Mumbai"]
    for i in range(num_firs):
        suspect_sample = random.sample(people, random.randint(2, 4))
        # Ensure Kingpin is occasionally mentioned with aliases
        text = f"On {fake.date_this_year()}, an incident occurred near {random.choice(locations)}. " \
               f"Primary suspects identified in investigation include {suspect_sample[0]['name']} and {suspect_sample[1]['name']}. " \
               f"Witnesses reported association with alias '{fake.first_name_male()}'. Vehicle ID {fake.license_plate()} was spotted."
        
        firs.append({
            "fir_id": f"FIR-2026-{i+1001}",
            "incident_date": str(fake.date_this_year()),
            "description": text
        })
        
    # 3. Generate CDR Logs (Call Detail Records)
    cdrs = []
    for _ in range(num_cdrs):
        # Higher probability of Lieutenants calling the Kingpin
        if random.random() < 0.4:
            caller = random.choice(lieutenants)['phone']
            receiver = kingpin['phone']
        else:
            p1, p2 = random.sample(people, 2)
            caller, receiver = p1['phone'], p2['phone']
            
        cdrs.append({
            "caller_number": caller,
            "receiver_number": receiver,
            "duration_seconds": random.randint(10, 600),
            "timestamp": str(fake.date_time_this_month()),
            "cell_tower_id": f"TOWER-{random.randint(100, 105)}"
        })
        
    # 4. Generate Financial Transactions (Bank Transfers)
    transfers = []
    for _ in range(num_transfers):
        p1, p2 = random.sample(people, 2)
        transfers.append({
            "transaction_id": f"TXN{random.randint(100000, 999999)}",
            "sender_phone": p1['phone'],
            "receiver_phone": p2['phone'],
            "amount_inr": random.choice([5000, 25000, 50000, 200000, 500000]),
            "timestamp": str(fake.date_time_this_month())
        })

    # Save generated data to /data/raw/
    with open('data/raw/firs.json', 'w') as f:
        json.dump(firs, f, indent=2)
        
    pd.DataFrame(cdrs).to_csv('data/raw/cdrs.csv', index=False)
    pd.DataFrame(transfers).to_csv('data/raw/financial_transfers.csv', index=False)
    
    print("✅ Synthetic dataset created successfully in 'data/raw/'")

if __name__ == "__main__":
    generate_crime_network_data()