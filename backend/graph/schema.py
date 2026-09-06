from pydantic import BaseModel, Field
from typing import List, Optional

# Node Schema Models
class PersonNode(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    aliases: List[str] = []

class IncidentNode(BaseModel):
    fir_id: str
    description: str
    incident_date: Optional[str] = None

class LocationNode(BaseModel):
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# Relationship Models
class CallRelationship(BaseModel):
    caller_phone: str
    receiver_phone: str
    duration: int
    timestamp: str

class TransferRelationship(BaseModel):
    sender_phone: str
    receiver_phone: str
    amount: float
    txn_id: str
    timestamp: str