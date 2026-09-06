import spacy
from re import findall

class EntityExtractor:
    def __init__(self):
        # Load standard model (Train custom spaCy model for production)
        self.nlp = spacy.load("en_core_web_sm")

    def extract_from_fir(self, fir_text: str):
        doc = self.nlp(fir_text)
        entities = {
            "PER": [],
            "LOC": [],
            "ORG": [],
            "PHONE": [],
            "VEHICLE": []
        }

        # Named Entity Recognition
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                entities["PER"].append(ent.text)
            elif ent.label_ in ["GPE", "LOC"]:
                entities["LOC"].append(ent.text)
            elif ent.label_ == "ORG":
                entities["ORG"].append(ent.text)

        # Regex fallback for structured patterns
        entities["PHONE"] = findall(r'\b[6-9]\d{9}\b', fir_text)
        entities["VEHICLE"] = findall(r'\b[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}\b', fir_text)

        return entities