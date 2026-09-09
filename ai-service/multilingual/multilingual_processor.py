import json
import os
import re
from typing import Any, Dict, List


# ============================================================
# CONFIGURATION
# ============================================================

CONFIG_PATH = os.path.join(
    os.path.dirname(__file__),
    "language_config.json"
)

with open(CONFIG_PATH, "r", encoding="utf-8") as file:
    CONFIG = json.load(file)

SUPPORTED_LANGUAGES = CONFIG["languages"]


# ============================================================
# DECLARATION LABELS
# ============================================================
# Multilingual declaration vocabulary.
#
# Internal fields remain language-independent:
# manufacturer
# packer
# importer
# mrp
# net_quantity
# consumer_care
# country_of_origin
# unit_sale_price
# manufacturing_date
#
# This is an MVP dictionary and can be expanded later.
# ============================================================

DECLARATION_LABELS = {

    # --------------------------------------------------------
    # MANUFACTURER
    # --------------------------------------------------------

    "manufacturer": {

        "en": [
            "manufacturer",
            "manufactured by",
            "mfd by",
            "mfg by"
        ],

        "hi": [
            "निर्माता",
            "निर्मित द्वारा"
        ],

        "mr": [
            "निर्माता"
        ],

        "ne": [
            "निर्माता"
        ],

        "sa": [
            "निर्माता"
        ],

        "mai": [
            "निर्माता"
        ],

        "doi": [
            "निर्माता"
        ],

        "brx": [
            "निर्माता"
        ],

        "kok": [
            "निर्माता"
        ],

        "as": [
            "উৎপাদক"
        ],

        "bn": [
            "প্রস্তুতকারক",
            "উৎপাদক"
        ],

        "mni": [
            "ꯑꯃꯥꯁꯤꯡ"
        ],

        "gu": [
            "ઉત્પાદક"
        ],

        "pa": [
            "ਨਿਰਮਾਤਾ"
        ],

        "or": [
            "ଉତ୍ପାଦକ"
        ],

        "ta": [
            "உற்பத்தியாளர்"
        ],

        "te": [
            "తయారీదారు",
            "తయారు చేసినవారు"
        ],

        "kn": [
            "ತಯಾರಕರು"
        ],

        "ml": [
            "നിർമ്മാതാവ്"
        ],

        "ur": [
            "کارخانہ دار",
            "تیار کنندہ"
        ],

        "sd": [
            "ٺاهيندڙ"
        ],

        "ks": [
            "کارخانہ دار"
        ],

        "sat": [
            "ᱛᱟᱭᱟᱨᱤ"
        ]
    },


    # --------------------------------------------------------
    # PACKER
    # --------------------------------------------------------

    "packer": {

        "en": [
            "packer",
            "packed by",
            "pkd by"
        ],

        "hi": [
            "पैकर",
            "पैक किया गया"
        ],

        "mr": [
            "पॅकर"
        ],

        "ne": [
            "प्याकर"
        ],

        "gu": [
            "પેકર"
        ],

        "pa": [
            "ਪੈਕਰ"
        ],

        "or": [
            "ପ୍ୟାକର"
        ],

        "ta": [
            "பேக்கர்"
        ],

        "te": [
            "ప్యాకర్",
            "ప్యాక్ చేసినవారు"
        ],

        "kn": [
            "ಪ್ಯಾಕರ್"
        ],

        "ml": [
            "പാക്കർ"
        ],

        "bn": [
            "প্যাকার"
        ],

        "as": [
            "পেকাৰ"
        ],

        "ur": [
            "پیکر"
        ]
    },


    # --------------------------------------------------------
    # IMPORTER
    # --------------------------------------------------------

    "importer": {

        "en": [
            "importer",
            "imported by"
        ],

        "hi": [
            "आयातक",
            "आयातित द्वारा"
        ],

        "mr": [
            "आयातदार"
        ],

        "gu": [
            "આયાતકાર"
        ],

        "pa": [
            "ਆਯਾਤਕਾਰ"
        ],

        "or": [
            "ଆମଦାନିକାରୀ"
        ],

        "ta": [
            "இறக்குமதியாளர்"
        ],

        "te": [
            "దిగుమతిదారు",
            "దిగుమతి చేసినవారు"
        ],

        "kn": [
            "ಆಮದುದಾರ"
        ],

        "ml": [
            "ഇറക്കുമതിക്കാരൻ"
        ],

        "bn": [
            "আমদানিকারক"
        ],

        "as": [
            "আমদানিকাৰক"
        ],

        "ur": [
            "درآمد کنندہ"
        ]
    },


    # --------------------------------------------------------
    # MRP
    # --------------------------------------------------------

    "mrp": {

        "en": [
            "mrp",
            "maximum retail price"
        ],

        "hi": [
            "एमआरपी",
            "अधिकतम खुदरा मूल्य"
        ],

        "mr": [
            "एमआरपी",
            "कमाल किरकोळ किंमत"
        ],

        "gu": [
            "એમઆરપી",
            "મહત્તમ છૂટક કિંમત"
        ],

        "pa": [
            "ਐਮਆਰਪੀ",
            "ਅਧਿਕਤਮ ਪ੍ਰਚੂਨ ਕੀਮਤ"
        ],

        "or": [
            "ଏମଆରପି",
            "ସର୍ବାଧିକ ଖୁଚୁରା ମୂଲ୍ୟ"
        ],

        "ta": [
            "எம்ஆர்பி",
            "அதிகபட்ச சில்லறை விலை"
        ],

        "te": [
            "ఎంఆర్పి",
            "గరిష్ట చిల్లర ధర"
        ],

        "kn": [
            "ಎಂಆರ್‌ಪಿ",
            "ಗರಿಷ್ಠ ಚಿಲ್ಲರೆ ಬೆಲೆ"
        ],

        "ml": [
            "എംആർപി",
            "പരമാവധി ചില്ലറ വില"
        ],

        "bn": [
            "এমআরপি",
            "সর্বোচ্চ খুচরা মূল্য"
        ],

        "as": [
            "এমআৰপি",
            "সৰ্বাধিক খুচুৰা মূল্য"
        ],

        "ur": [
            "ایم آر پی",
            "زیادہ سے زیادہ خوردہ قیمت"
        ]
    },


    # --------------------------------------------------------
    # NET QUANTITY
    # --------------------------------------------------------

    "net_quantity": {

        "en": [
            "net quantity",
            "net qty",
            "net weight",
            "net wt"
        ],

        "hi": [
            "शुद्ध मात्रा",
            "कुल मात्रा",
            "शुद्ध वजन"
        ],

        "mr": [
            "निव्वळ मात्रा",
            "निव्वळ वजन"
        ],

        "gu": [
            "ચોખ્ખી માત્રા",
            "ચોખ્ખું વજન"
        ],

        "pa": [
            "ਸ਼ੁੱਧ ਮਾਤਰਾ",
            "ਸ਼ੁੱਧ ਭਾਰ"
        ],

        "or": [
            "ନିଟ୍ ପରିମାଣ",
            "ନିଟ୍ ଓଜନ"
        ],

        "ta": [
            "நிகர அளவு",
            "நிகர எடை"
        ],

        "te": [
            "నికర పరిమాణం",
            "నికర బరువు"
        ],

        "kn": [
            "ನಿವ್ವಳ ಪ್ರಮಾಣ",
            "ನಿವ್ವಳ ತೂಕ"
        ],

        "ml": [
            "നെറ്റ് അളവ്",
            "നെറ്റ് ഭാരം"
        ],

        "bn": [
            "নিট পরিমাণ",
            "নিট ওজন"
        ],

        "as": [
            "নেট পৰিমাণ",
            "নেট ওজন"
        ],

        "ur": [
            "خالص مقدار",
            "خالص وزن"
        ]
    },


    # --------------------------------------------------------
    # CONSUMER CARE
    # --------------------------------------------------------

    "consumer_care": {

        "en": [
            "consumer care",
            "customer care",
            "helpline",
            "toll free"
        ],

        "hi": [
            "उपभोक्ता सेवा",
            "ग्राहक सेवा",
            "हेल्पलाइन",
            "टोल फ्री"
        ],

        "mr": [
            "ग्राहक सेवा",
            "हेल्पलाइन"
        ],

        "gu": [
            "ગ્રાહક સેવા",
            "હેલ્પલાઇન"
        ],

        "pa": [
            "ਗਾਹਕ ਸੇਵਾ",
            "ਹੈਲਪਲਾਈਨ"
        ],

        "or": [
            "ଗ୍ରାହକ ସେବା",
            "ହେଲ୍ପଲାଇନ୍"
        ],

        "ta": [
            "வாடிக்கையாளர் சேவை",
            "உதவி எண்"
        ],

        "te": [
            "వినియోగదారుల సేవ",
            "కస్టమర్ కేర్",
            "హెల్ప్‌లైన్"
        ],

        "kn": [
            "ಗ್ರಾಹಕ ಸೇವೆ",
            "ಸಹಾಯವಾಣಿ"
        ],

        "ml": [
            "ഉപഭോക്തൃ സേവനം",
            "ഹെൽപ്പ് ലൈൻ"
        ],

        "bn": [
            "গ্রাহক পরিষেবা",
            "হেল্পলাইন"
        ],

        "as": [
            "গ্ৰাহক সেৱা",
            "হেল্পলাইন"
        ],

        "ur": [
            "صارفین کی خدمت",
            "ہیلپ لائن"
        ]
    },


    # --------------------------------------------------------
    # COUNTRY OF ORIGIN
    # --------------------------------------------------------

    "country_of_origin": {

        "en": [
            "country of origin",
            "made in",
            "product of"
        ],

        "hi": [
            "मूल देश",
            "निर्मित देश",
            "भारत में निर्मित"
        ],

        "mr": [
            "मूळ देश",
            "निर्मित देश"
        ],

        "gu": [
            "મૂળ દેશ",
            "માં બનાવેલ"
        ],

        "pa": [
            "ਮੂਲ ਦੇਸ਼",
            "ਵਿੱਚ ਬਣਿਆ"
        ],

        "or": [
            "ମୂଳ ଦେଶ",
            "ତିଆରି ହୋଇଛି"
        ],

        "ta": [
            "பிறப்பிட நாடு",
            "தயாரிக்கப்பட்டது"
        ],

        "te": [
            "మూల దేశం",
            "తయారు చేసిన దేశం"
        ],

        "kn": [
            "ಮೂಲ ದೇಶ",
            "ತಯಾರಿಸಿದ ದೇಶ"
        ],

        "ml": [
            "ഉത്ഭവ രാജ്യം",
            "നിർമ്മിച്ചത്"
        ],

        "bn": [
            "উৎপত্তির দেশ",
            "তৈরি হয়েছে"
        ],

        "as": [
            "উৎপত্তিৰ দেশ"
        ],

        "ur": [
            "ملک کا اصل",
            "ساختہ"
        ]
    },


    # --------------------------------------------------------
    # UNIT SALE PRICE
    # --------------------------------------------------------

    "unit_sale_price": {

        "en": [
            "unit sale price",
            "usp"
        ],

        "hi": [
            "इकाई बिक्री मूल्य"
        ],

        "mr": [
            "युनिट विक्री किंमत"
        ],

        "gu": [
            "એકમ વેચાણ કિંમત"
        ],

        "pa": [
            "ਯੂਨਿਟ ਵਿਕਰੀ ਕੀਮਤ"
        ],

        "ta": [
            "அலகு விற்பனை விலை"
        ],

        "te": [
            "యూనిట్ అమ్మకపు ధర"
        ],

        "kn": [
            "ಘಟಕ ಮಾರಾಟ ಬೆಲೆ"
        ],

        "ml": [
            "യൂണിറ്റ് വിൽപ്പന വില"
        ],

        "bn": [
            "ইউনিট বিক্রয় মূল্য"
        ],

        "or": [
            "ୟୁନିଟ୍ ବିକ୍ରୟ ମୂଲ୍ୟ"
        ],

        "ur": [
            "یونٹ فروخت قیمت"
        ]
    },


    # --------------------------------------------------------
    # MANUFACTURING DATE
    # --------------------------------------------------------

    "manufacturing_date": {

        "en": [
            "manufacturing date",
            "date of manufacture",
            "mfd",
            "mfg",
            "packing date",
            "pkd"
        ],

        "hi": [
            "निर्माण तिथि",
            "निर्मित तिथि",
            "पैकिंग तिथि"
        ],

        "mr": [
            "उत्पादन तारीख",
            "पॅकिंग तारीख"
        ],

        "gu": [
            "ઉત્પાદન તારીખ",
            "પેકિંગ તારીખ"
        ],

        "pa": [
            "ਨਿਰਮਾਣ ਮਿਤੀ",
            "ਪੈਕਿੰਗ ਮਿਤੀ"
        ],

        "or": [
            "ନିର୍ମାଣ ତାରିଖ",
            "ପ୍ୟାକିଂ ତାରିଖ"
        ],

        "ta": [
            "உற்பத்தி தேதி",
            "பேக்கிங் தேதி"
        ],

        "te": [
            "తయారీ తేదీ",
            "ప్యాకింగ్ తేదీ"
        ],

        "kn": [
            "ತಯಾರಿಕೆ ದಿನಾಂಕ",
            "ಪ್ಯಾಕಿಂಗ್ ದಿನಾಂಕ"
        ],

        "ml": [
            "നിർമ്മാണ തീയതി",
            "പാക്കിംഗ് തീയതി"
        ],

        "bn": [
            "উৎপাদনের তারিখ",
            "প্যাকিং তারিখ"
        ],

        "as": [
            "উৎপাদনৰ তাৰিখ",
            "পেকিং তাৰিখ"
        ],

        "ur": [
            "تیاری کی تاریخ",
            "پیکنگ کی تاریخ"
        ]
    }
}


# ============================================================
# SCRIPT DETECTION
# ============================================================

SCRIPT_RANGES = {

    "Devanagari": r"[\u0900-\u097F]",

    "Bengali": r"[\u0980-\u09FF]",

    "Gurmukhi": r"[\u0A00-\u0A7F]",

    "Gujarati": r"[\u0A80-\u0AFF]",

    "Odia": r"[\u0B00-\u0B7F]",

    "Tamil": r"[\u0B80-\u0BFF]",

    "Telugu": r"[\u0C00-\u0C7F]",

    "Kannada": r"[\u0C80-\u0CFF]",

    "Malayalam": r"[\u0D00-\u0D7F]",

    "Latin": r"[A-Za-z]",

    "Arabic": r"[\u0600-\u06FF]",

    "Ol Chiki": r"[\u1C50-\u1C7F]"
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: Any) -> str:

    if text is None:
        return ""

    text = str(text)

    text = text.replace("\n", " ")
    text = text.replace("\t", " ")

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ============================================================
# SCRIPT DETECTION FUNCTION
# ============================================================

def detect_script(text: str) -> str:

    text = normalize_text(text)

    if not text:
        return "Unknown"

    # --------------------------------------------------------
    # Check Indic / non-Latin scripts first.
    #
    # Product labels are often multilingual, for example:
    # "निर्माता: ABC Pvt Ltd"
    #
    # In such cases Latin characters may be more numerous,
    # but the actual declaration language is Devanagari.
    # --------------------------------------------------------

    non_latin_scripts = [
        "Devanagari",
        "Bengali",
        "Gurmukhi",
        "Gujarati",
        "Odia",
        "Tamil",
        "Telugu",
        "Kannada",
        "Malayalam",
        "Arabic",
        "Ol Chiki"
    ]

    for script in non_latin_scripts:

        pattern = SCRIPT_RANGES[script]

        if re.search(pattern, text):

            return script

    # --------------------------------------------------------
    # If no Indic/non-Latin script is found, check Latin.
    # --------------------------------------------------------

    if re.search(
        SCRIPT_RANGES["Latin"],
        text
    ):
        return "Latin"

    return "Unknown"


# ============================================================
# LANGUAGE DETECTION
# ============================================================

def detect_language(text: str) -> str:

    text = normalize_text(text)

    if not text:
        return "unknown"

    lowered = text.lower()

    # --------------------------------------------------------
    # Strong language-specific labels
    # --------------------------------------------------------

    language_scores = {
        language: 0
        for language in SUPPORTED_LANGUAGES
    }

    for field, languages in DECLARATION_LABELS.items():

        for language, labels in languages.items():

            for label in labels:

                label = normalize_text(label)

                if not label:
                    continue

                if label.lower() in lowered:

                    language_scores[language] += 2

    # --------------------------------------------------------
    # Script detection
    # --------------------------------------------------------

    script = detect_script(text)

    # --------------------------------------------------------
    # Unique scripts
    # --------------------------------------------------------

    script_to_language = {

        "Latin": "en",

        "Gujarati": "gu",

        "Gurmukhi": "pa",

        "Odia": "or",

        "Tamil": "ta",

        "Telugu": "te",

        "Kannada": "kn",

        "Malayalam": "ml",

        "Ol Chiki": "sat"
    }

    if script in script_to_language:

        return script_to_language[script]

    # --------------------------------------------------------
    # Arabic script
    # --------------------------------------------------------
    # Urdu, Sindhi and Kashmiri may share Arabic-derived
    # scripts. Therefore use vocabulary first.
    # --------------------------------------------------------

    if script == "Arabic":

        arabic_scores = {
            "ur": language_scores.get("ur", 0),
            "sd": language_scores.get("sd", 0),
            "ks": language_scores.get("ks", 0)
        }

        best_arabic_language = max(
            arabic_scores,
            key=arabic_scores.get
        )

        if arabic_scores[best_arabic_language] > 0:
            return best_arabic_language

        return "ur"

    # --------------------------------------------------------
    # Devanagari
    # --------------------------------------------------------
    # Hindi, Marathi, Nepali, Sanskrit, Maithili,
    # Dogri, Bodo and Konkani may use Devanagari.
    #
    # We use known declaration vocabulary where possible.
    # --------------------------------------------------------

    if script == "Devanagari":

        hindi_specific = [

            "निर्माता",
            "निर्मित द्वारा",
            "पैकर",
            "पैक किया गया",
            "आयातक",
            "आयातित द्वारा",
            "एमआरपी",
            "अधिकतम खुदरा मूल्य",
            "शुद्ध मात्रा",
            "शुद्ध वजन",
            "उपभोक्ता सेवा",
            "ग्राहक सेवा",
            "हेल्पलाइन",
            "टोल फ्री",
            "मूल देश",
            "निर्मित देश",
            "भारत में निर्मित",
            "इकाई बिक्री मूल्य",
            "निर्माण तिथि",
            "निर्मित तिथि",
            "पैकिंग तिथि"
        ]

        for label in hindi_specific:

            if label.lower() in lowered:
                return "hi"

        # Check language scores if a language-specific
        # vocabulary match exists.

        devanagari_languages = [
            "mr",
            "ne",
            "sa",
            "mai",
            "doi",
            "brx",
            "kok"
        ]

        available_scores = {
            language: language_scores.get(
                language,
                0
            )
            for language in devanagari_languages
        }

        best_language = max(
            available_scores,
            key=available_scores.get
        )

        if available_scores[best_language] > 0:
            return best_language

        return "unknown"

    # --------------------------------------------------------
    # Bengali-derived script
    # --------------------------------------------------------
    # Assamese, Bengali and Manipuri can overlap in script.
    # --------------------------------------------------------

    if script == "Bengali":

        bengali_specific = [

            "প্রস্তুতকারক",
            "প্যাকার",
            "আমদানিকারক",
            "এমআরপি",
            "সর্বোচ্চ খুচরা মূল্য",
            "নিট পরিমাণ",
            "নিট ওজন",
            "গ্রাহক পরিষেবা",
            "উৎপত্তির দেশ",
            "উৎপাদনের তারিখ"
        ]

        for label in bengali_specific:

            if label.lower() in lowered:
                return "bn"

        bengali_scores = {
            "bn": language_scores.get("bn", 0),
            "as": language_scores.get("as", 0),
            "mni": language_scores.get("mni", 0)
        }

        best_language = max(
            bengali_scores,
            key=bengali_scores.get
        )

        if bengali_scores[best_language] > 0:
            return best_language

        return "unknown"

    # --------------------------------------------------------
    # Generic vocabulary fallback
    # --------------------------------------------------------

    best_language = max(
        language_scores,
        key=language_scores.get
    )

    if language_scores[best_language] > 0:
        return best_language

    return "unknown"


# ============================================================
# FIELD NORMALIZATION
# ============================================================

def normalize_field(text: str) -> str:

    text = normalize_text(text)

    if not text:
        return "unknown"

    lowered = text.lower()

    # --------------------------------------------------------
    # First try language-independent field matching.
    # --------------------------------------------------------

    matches = []

    for field, languages in DECLARATION_LABELS.items():

        for labels in languages.values():

            for label in labels:

                label = normalize_text(label)

                if not label:
                    continue

                if label.lower() in lowered:

                    matches.append(
                        (
                            field,
                            len(label)
                        )
                    )

    if not matches:
        return "unknown"

    # Prefer the longest matching label.
    # This avoids short labels incorrectly matching
    # inside longer declarations.
    matches.sort(
        key=lambda item: item[1],
        reverse=True
    )

    return matches[0][0]


# ============================================================
# VALUE EXTRACTION
# ============================================================

def extract_value(
    text: str,
    field: str
) -> str:

    text = normalize_text(text)

    if field == "unknown":
        return text

    all_labels = []

    for labels in DECLARATION_LABELS[field].values():

        all_labels.extend(labels)

    # Longer labels first.
    all_labels.sort(
        key=len,
        reverse=True
    )

    for label in all_labels:

        label = normalize_text(label)

        if not label:
            continue

        match = re.search(
            re.escape(label)
            + r"\s*[:\-]?\s*(.*)",
            text,
            flags=re.IGNORECASE
        )

        if match:

            value = match.group(1).strip()

            if value:
                return value

    return text


# ============================================================
# SINGLE TEXT PROCESSING
# ============================================================

def process_text(
    text: str
) -> Dict[str, Any]:

    raw_text = normalize_text(text)

    language = detect_language(
        raw_text
    )

    field = normalize_field(
        raw_text
    )

    value = extract_value(
        raw_text,
        field
    )

    return {

        "language": language,

        "language_name": SUPPORTED_LANGUAGES.get(
            language,
            {
                "name": "Unknown"
            }
        ).get(
            "name",
            "Unknown"
        ),

        "script": detect_script(
            raw_text
        ),

        "field": field,

        "value": value,

        "raw_text": raw_text
    }


# ============================================================
# OCR RESULTS PROCESSING
# ============================================================

def process_ocr_results(
    ocr_results: List[Any]
) -> List[Dict[str, Any]]:

    processed = []

    for item in ocr_results:

        if isinstance(item, dict):

            text = item.get(
                "text",
                ""
            )

        else:

            text = str(item)

        if not text:
            continue

        processed.append(
            process_text(text)
        )

    return processed