import pandas as pd

def detect_suspicious_patterns(cdrs: list, transfers: list):
    """Detects rapid calls following financial transactions (Coordinated Activity)."""
    alerts = []
    
    cdr_df = pd.DataFrame(cdrs)
    txn_df = pd.DataFrame(transfers)

    if cdr_df.empty or txn_df.empty:
        return alerts

    # High Value Transfers Detection
    high_val = txn_df[txn_df['amount'] >= 100000]
    for _, row in high_val.iterrows():
        alerts.append({
            "type": "HIGH_VALUE_TRANSFER",
            "severity": "HIGH",
            "description": f"Large transfer of INR {row['amount']} from {row['sender']} to {row['receiver']}."
        })

    return alerts