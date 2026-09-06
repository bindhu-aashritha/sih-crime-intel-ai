from difflib import SequenceMatcher
from typing import List, Dict

class EntityResolver:
    def __init__(self, similarity_threshold: float = 0.85):
        self.threshold = similarity_threshold

    def _similarity(self, a: str, b: str) -> float:
        """Calculates string similarity using Levenshtein-like ratio."""
        return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

    def merge_duplicate_entities(self, entities: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Deduplicates names or phone numbers across multiple sources.
        e.g., merges 'Vikram Sharma' and 'Vikram S.' if similarity > threshold.
        """
        unique_entities = []

        for entity in entities:
            is_duplicate = False
            for unique in unique_entities:
                # Compare names
                if "name" in entity and "name" in unique:
                    sim = self._similarity(entity["name"], unique["name"])
                    if sim >= self.threshold:
                        # Append alias if new name variant found
                        if entity["name"] not in unique.get("aliases", []):
                            unique.setdefault("aliases", []).append(entity["name"])
                        is_duplicate = True
                        break

            if not is_duplicate:
                entity["aliases"] = [entity.get("name", "")]
                unique_entities.append(entity)

        return unique_entities