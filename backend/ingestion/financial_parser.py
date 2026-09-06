import pandas as pd
from typing import List, Dict

class FinancialParser:
    @staticmethod
    def parse_transfers_csv(file_path: str) -> List[Dict]:
        df = pd.read_csv(file_path)
        df.columns = [c.lower().strip() for c in df.columns]
        
        transactions = []
        for _, row in df.iterrows():
            transactions.append({
                "transaction_id": str(row.get("transaction_id", "")),
                "sender": str(row.get("sender_phone", "")),
                "receiver": str(row.get("receiver_phone", "")),
                "amount": float(row.get("amount_inr", 0.0)),
                "timestamp": str(row.get("timestamp", ""))
            })
        return transactions