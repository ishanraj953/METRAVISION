"""
Multilingual OCR Module for METRAVISION Legal Metrology Pipeline.
Provides language/script detection, regional Indic language translation,
Indic numeral conversion, and multilingual OCR processing.
"""

from .multilingual_processor import (
    MultilingualProcessor,
    detect_script,
    detect_language,
    convert_indic_digits,
    translate_legal_terms,
    get_multilingual_processor,
)

__all__ = [
    "MultilingualProcessor",
    "detect_script",
    "detect_language",
    "convert_indic_digits",
    "translate_legal_terms",
    "get_multilingual_processor",
]
