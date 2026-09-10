import re
import unicodedata
from typing import List, Dict, Any, Optional, Tuple

# Try importing PaddleOCR for native multi-language OCR fallback
try:
    from paddleocr import PaddleOCR
    HAS_PADDLE = True
except ImportError:
    HAS_PADDLE = False

# Import OCRResult if available
try:
    from ocr.ocr_result import OCRResult
except ImportError:
    try:
        from ai_service.ocr.ocr_result import OCRResult
    except ImportError:
        # Fallback dataclass/dict representation if imported standalone
        OCRResult = Any


# =============================================================================
# UNICODE SCRIPT & LANGUAGE DETECTION
# =============================================================================

SCRIPT_RANGES: List[Tuple[str, int, int, str]] = [
    ("DEVANAGARI", 0x0900, 0x097F, "hi"),  # Hindi, Marathi, Nepali
    ("BENGALI", 0x0980, 0x09FF, "bn"),     # Bengali, Assamese
    ("GURMUKHI", 0x0A00, 0x0A7F, "pa"),    # Punjabi
    ("GUJARATI", 0x0A80, 0x0AFF, "gu"),    # Gujarati
    ("ORIYA", 0x0B00, 0x0B7F, "or"),       # Odia
    ("TAMIL", 0x0B80, 0x0BFF, "ta"),       # Tamil
    ("TELUGU", 0x0C00, 0x0C7F, "te"),      # Telugu
    ("KANNADA", 0x0C80, 0x0CFF, "kn"),     # Kannada
    ("MALAYALAM", 0x0D00, 0x0D7F, "ml"),   # Malayalam
    ("ARABIC", 0x0600, 0x06FF, "ur"),      # Urdu, Arabic
    ("LATIN", 0x0041, 0x007A, "en"),       # English
]

# Map Indic / Regional numerals to ASCII digits (0-9)
INDIC_DIGIT_MAP = {
    # Devanagari (Hindi/Marathi)
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    # Gujarati
    '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
    '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
    # Bengali
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    # Gurmukhi / Punjabi
    '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4',
    '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
    # Odia
    '୦': '0', '୧': '1', '୨': '2', '୩': '3', '੪': '4',
    '୫': '5', '୬': '6', '୭': '7', '੮': '8', '୯': '9',
    # Telugu
    '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4',
    '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
    # Kannada
    '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4',
    '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
    # Malayalam
    '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4',
    '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9',
}

def convert_indic_digits(text: str) -> str:
    """Convert any Indic script numerals into standard ASCII digits."""
    if not text:
        return ""
    res = list(text)
    for i, char in enumerate(res):
        if char in INDIC_DIGIT_MAP:
            res[i] = INDIC_DIGIT_MAP[char]
    return "".join(res)


def detect_script(text: str) -> str:
    """Detect the predominant script of the text using Unicode character blocks."""
    if not text:
        return "UNKNOWN"
    
    script_counts: Dict[str, int] = {}
    for char in text:
        cp = ord(char)
        for script_name, start, end, _ in SCRIPT_RANGES:
            if start <= cp <= end:
                script_counts[script_name] = script_counts.get(script_name, 0) + 1
                break
                
    if not script_counts:
        return "UNKNOWN"
    
    return max(script_counts, key=script_counts.get)


def detect_language(text: str) -> str:
    """Detect the language code corresponding to the detected script."""
    script = detect_script(text)
    for script_name, _, _, lang_code in SCRIPT_RANGES:
        if script_name == script:
            return lang_code
    return "en"


# =============================================================================
# MULTILINGUAL LEGAL METROLOGY DICTIONARY
# Maps regional terms (Hindi, Marathi, Tamil, Telugu, Gujarati, Bengali, etc.)
# to standardized English Legal Metrology declaration keys & values.
# =============================================================================

LEGAL_TRANSLATIONS: Dict[str, List[Dict[str, Any]]] = {
    "mrp": [
        # Hindi / Devanagari
        {"pattern": r"(?:अधिकतम\s+खुदरा\s+मूल्य|एम\s*आर\s*पी|खुदरा\s+मूल्य|मूल्य|एम\.आर\.पी|किंमत)", "translation": "MRP", "unit": "INR"},
        # Tamil
        {"pattern": r"(?:அதிகபட்ச\s+சில்லறை\s+விலை|விலை|எம்\.ஆர்\.பி)", "translation": "MRP", "unit": "INR"},
        # Telugu
        {"pattern": r"(?:గరిష్ట\s+రిటైల్\s+ధర|ధర|ఎమ్\s*ఆర్\s*పి)", "translation": "MRP", "unit": "INR"},
        # Gujarati
        {"pattern": r"(?:મહત્તમ\s+છૂટક\s+કિંમત|કિંમત|એમ\.આર\.પી)", "translation": "MRP", "unit": "INR"},
        # Bengali
        {"pattern": r"(?:সর্বোচ্চ\s+খুচরা\s+মূল্য|দাম|এম\.আর\.পি)", "translation": "MRP", "unit": "INR"},
    ],
    "net_quantity": [
        # Hindi / Devanagari
        {"pattern": r"(?:शुद्ध\s+मात्रा|कुल\s+वजन|शुद्ध\s+भार|मात्रा|वजन|नेट्ट\s+परिमाण)", "translation": "NET QUANTITY"},
        # Tamil
        {"pattern": r"(?:நிகர\s+அளவு|அளவு|எடை)", "translation": "NET QUANTITY"},
        # Telugu
        {"pattern": r"(?:నికర\s+పరిమాణం|పరిమాణం|బరువు)", "translation": "NET QUANTITY"},
        # Gujarati
        {"pattern": r"(?:ચોખ્ખું\s+વજન|જથ્થો|માત્રા)", "translation": "NET QUANTITY"},
        # Bengali
        {"pattern": r"(?:নিট\s+পরিমাণ|ওজন|পরিমাণ)", "translation": "NET QUANTITY"},
    ],
    "manufacturer": [
        # Hindi / Devanagari
        {"pattern": r"(?:निर्माता|निर्मित|उत्पादक|उत्पादित|कंपनी|द्वारा\s+निर्मित)", "translation": "MANUFACTURED BY"},
        # Tamil
        {"pattern": r"(?:தயாரிப்பாளர்|உற்பத்தியாளர்|தயாரிப்பு)", "translation": "MANUFACTURED BY"},
        # Telugu
        {"pattern": r"(?:తయారీదారు|ఉత్పత్తిదారు|తయారీ)", "translation": "MANUFACTURED BY"},
        # Gujarati
        {"pattern": r"(?:ઉત્પાદક|બનાવનાર|દ્વારા\s+બનાવેલ)", "translation": "MANUFACTURED BY"},
        # Bengali
        {"pattern": r"(?:প্রস্তুতকারক|উৎপাদক|দ্বারা\s+তৈরি)", "translation": "MANUFACTURED BY"},
    ],
    "importer": [
        # Hindi / Devanagari
        {"pattern": r"(?:आयातक|आयातकर्ता|द्वारा\s+आयातित)", "translation": "IMPORTED BY"},
        # Tamil
        {"pattern": r"(?:இறக்குமதியாளர்)", "translation": "IMPORTED BY"},
        # Telugu
        {"pattern": r"(?:దిగుమతిదారు)", "translation": "IMPORTED BY"},
        # Gujarati
        {"pattern": r"(?:આયાતકાર)", "translation": "IMPORTED BY"},
        # Bengali
        {"pattern": r"(?:আমদানিকারক)", "translation": "IMPORTED BY"},
    ],
    "consumer_care": [
        # Hindi / Devanagari
        {"pattern": r"(?:उपभोक्ता\s+देखभाल|ग्राहक\s+सेवा|संपर्क|हेल्पलाइन|कस्टमर\s+केयर|टोल\s+फ्री)", "translation": "CONSUMER CARE"},
        # Tamil
        {"pattern": r"(?:நுகர்வோர்\s+சேவை|தொடர்புக்கு|வாடிக்கையாளர்\s+சேவை)", "translation": "CONSUMER CARE"},
        # Telugu
        {"pattern": r"(?:వినియోగదారుల\s+సేవ|సంప్రదించండి|కస్టమర్\s+కేర్)", "translation": "CONSUMER CARE"},
        # Gujarati
        {"pattern": r"(?:ગ્રાહક\s+સંભાળ|હેલ્પલાઇન)", "translation": "CONSUMER CARE"},
        # Bengali
        {"pattern": r"(?:গ্রাহক\s+পরিষেবা|যোগাযোগ)", "translation": "CONSUMER CARE"},
    ],
    "country_of_origin": [
        # Hindi / Devanagari
        {"pattern": r"(?:मूल\s+देश|उत्पत्ति\s+का\s+देश|निर्मित\s+देश|भारत\s+में\s+निर्मित|भारत\s+उत्पाद)", "translation": "COUNTRY OF ORIGIN: INDIA"},
        # Tamil
        {"pattern": r"(?:உற்பத்தி\s+நாடு|இந்தியாவில்\s+தயாரிக்கப்பட்டது)", "translation": "COUNTRY OF ORIGIN: INDIA"},
        # Telugu
        {"pattern": r"(?:మూల\s+దేశం|భారతదేశంలో\s+తయారీ)", "translation": "COUNTRY OF ORIGIN: INDIA"},
        # Gujarati
        {"pattern": r"(?:મૂળ\s+દેશ|ભારતમાં\s+બનાવેલ)", "translation": "COUNTRY OF ORIGIN: INDIA"},
        # Bengali
        {"pattern": r"(?:উৎপত্তি\s+দেশ|ভারতে\s+তৈরি)", "translation": "COUNTRY OF ORIGIN: INDIA"},
    ],
    "date_of_manufacture": [
        # Hindi / Devanagari
        {"pattern": r"(?:निर्मा\s+तिथि|उत्पादन\s+तिथि|पैकिंग\s+तिथि|एमएफजी\s+तिथि|निर्माण\s+की\s+तारीख)", "translation": "MFG DATE"},
        # Tamil
        {"pattern": r"(?:தயாரிப்பு\s+தேதி|பேக்கிங்\s+தேதி)", "translation": "MFG DATE"},
        # Telugu
        {"pattern": r"(?:తయారీ\s+తేదీ|ప్యాకింగ్\s+తేదీ)", "translation": "MFG DATE"},
        # Gujarati
        {"pattern": r"(?:ઉત્પાદન\s+તારીખ|પેકિંગ\s+તારીખ)", "translation": "MFG DATE"},
        # Bengali
        {"pattern": r"(?:উৎপাদন\s+তারিখ|প্যাকিং\s+তারিখ)", "translation": "MFG DATE"},
    ],
    "expiry_date": [
        # Hindi / Devanagari
        {"pattern": r"(?:समाप्ति\s+तिथि|अंतिम\s+तिथि|उपयोग\s+अवधि|एक्सपायरी|प्रयोग\s+योग्य\s+अवधि)", "translation": "EXPIRY DATE / USE BY"},
        # Tamil
        {"pattern": r"(?:காலாவதி\s+தேதி)", "translation": "EXPIRY DATE / USE BY"},
        # Telugu
        {"pattern": r"(?:గడువు\s+తేదీ)", "translation": "EXPIRY DATE / USE BY"},
        # Gujarati
        {"pattern": r"(?:અંતિમ\s+તારીખ|એક્સપાયરી)", "translation": "EXPIRY DATE / USE BY"},
        # Bengali
        {"pattern": r"(?:মেয়াদ\s+উত্তীর্ণের\s+তারিখ)", "translation": "EXPIRY DATE / USE BY"},
    ],
}

def translate_legal_terms(text: str) -> Tuple[str, List[str]]:
    """
    Translate regional Indic terms in OCR text into English Legal Metrology equivalents.
    Returns (translated_text, list_of_matched_declaration_fields).
    """
    if not text:
        return "", []

    # First convert any non-ASCII numerals to standard digits
    text_converted = convert_indic_digits(text)
    translated_text = text_converted
    matched_fields: List[str] = []

    for field_name, rules in LEGAL_TRANSLATIONS.items():
        for rule in rules:
            pattern = rule["pattern"]
            translation = rule["translation"]
            if re.search(pattern, text_converted, re.IGNORECASE):
                # Replace regional label with standard English term
                translated_text = re.sub(pattern, translation, translated_text, flags=re.IGNORECASE)
                if field_name not in matched_fields:
                    matched_fields.append(field_name)

    return translated_text, matched_fields


# =============================================================================
# MULTILINGUAL OCR PROCESSOR CLASS
# =============================================================================

class MultilingualProcessor:
    """
    Multilingual OCR Processor for METRAVISION.
    Identifies scripts, converts Indic digits, translates regional packaging
    terms into standard Legal Metrology declarations, and runs secondary OCR passes.
    """

    def __init__(self):
        self._ocr_cache: Dict[str, Any] = {}

    def get_ocr_engine(self, lang: str = "hi"):
        """Lazy load language-specific PaddleOCR engine if installed."""
        if not HAS_PADDLE:
            return None
        if lang not in self._ocr_cache:
            try:
                self._ocr_cache[lang] = PaddleOCR(lang=lang, device="cpu", enable_mkldnn=False)
            except Exception:
                self._ocr_cache[lang] = None
        return self._ocr_cache[lang]

    def process_ocr_results(
        self,
        ocr_results: List[Any],
        languages: Optional[List[str]] = None
    ) -> List[Any]:
        """
        Process OCR results to detect scripts, convert Indic digits,
        and translate regional terms into English declaration equivalents.
        """
        processed_results = []

        for res in ocr_results:
            raw_text = getattr(res, "text", str(res))
            script = detect_script(raw_text)
            lang = detect_language(raw_text)

            # Convert Indic digits to standard ASCII digits
            text_with_ascii_digits = convert_indic_digits(raw_text)
            
            # Translate regional legal terms
            translated_text, matched_fields = translate_legal_terms(text_with_ascii_digits)

            # If OCRResult object, update or attach metadata attributes
            if hasattr(res, "text"):
                res.script = script
                res.language = lang
                res.original_text = raw_text
                
                # If regional script was translated, update primary text or create translated text field
                if script != "LATIN" or translated_text != raw_text:
                    res.translated_text = translated_text
                    res.text = translated_text  # Set normalized text for extractor regex matching
                    res.matched_fields = matched_fields

                processed_results.append(res)
            else:
                processed_results.append(translated_text)

        return processed_results

    def translate_text(self, text: str) -> Dict[str, Any]:
        """
        Detailed translation breakdown for a string of text.
        """
        script = detect_script(text)
        lang = detect_language(text)
        digits_converted = convert_indic_digits(text)
        translated_text, matched_fields = translate_legal_terms(digits_converted)

        return {
            "original_text": text,
            "script": script,
            "language": lang,
            "digits_converted": digits_converted,
            "translated_text": translated_text,
            "matched_fields": matched_fields
        }

    def enrich_declarations(
        self,
        declarations: Dict[str, Any],
        ocr_results: List[Any]
    ) -> Dict[str, Any]:
        """
        Enrich missing declaration fields using translated multilingual OCR text.
        """
        fields = declarations.get("fields", {})

        for res in ocr_results:
            if not hasattr(res, "translated_text") or not getattr(res, "translated_text", None):
                continue

            trans_text = res.translated_text
            matched_fields = getattr(res, "matched_fields", [])

            # Check if any matched field is currently missing in declarations
            for field_name in matched_fields:
                if field_name in fields and fields[field_name] is None:
                    # Provide enriched declaration candidate
                    fields[field_name] = {
                        "field": field_name,
                        "value": trans_text,
                        "raw_text": getattr(res, "original_text", trans_text),
                        "confidence": getattr(res, "confidence", 0.9),
                        "bbox": getattr(res, "bbox", [0, 0, 0, 0]),
                        "source": "multilingual_ocr",
                        "status": "detected_multilingual"
                    }

        declarations["fields"] = fields
        declarations["detected_field_count"] = sum(1 for v in fields.values() if v is not None)
        return declarations


# Global singleton instance
_multilingual_processor: Optional[MultilingualProcessor] = None

def get_multilingual_processor() -> MultilingualProcessor:
    global _multilingual_processor
    if _multilingual_processor is None:
        _multilingual_processor = MultilingualProcessor()
    return _multilingual_processor
