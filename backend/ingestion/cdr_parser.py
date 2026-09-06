import pandas as pd
from typing import List, Dict

class CDRParser:
    @staticmethod
    def parse_cdr_csv(file_path: str) -> List[Dict]:
        df = pd.read_csv(file_path)
        # Ensure column normalization
        df.columns = [c.lower().strip() for c in df.columns]
        
        records = []
        for _, row in df.iterrows():
            records.append({
                "caller": str(row.get("caller_number", "")).strip(),
                "receiver": str(row.get("receiver_number", "")).strip(),
                "duration": int(row.get("duration_seconds", 0)),
                "timestamp": str(row.get("timestamp", "")),
                "tower_id": str(row.get("cell_tower_id", ""))
            })
        return records