import re
from typing import Any


# ============================================================
# PHASE 8 - PRODUCT CLASSIFICATION
# ============================================================

CATEGORIES = [
    "electronics",
    "food",
    "garment",
    "imported",
    "general",
    "multi-pack",
]


# Keywords used for the initial rule-based classification.
# This can later be replaced or combined with a trained ML model.
CATEGORY_KEYWORDS = {

    "electronics": [
        "mobile",
        "smartphone",
        "laptop",
        "computer",
        "tablet",
        "charger",
        "adapter",
        "television",
        "tv",
        "earphone",
        "earphones",
        "headphone",
        "headphones",
        "speaker",
        "keyboard",
        "mouse",
        "camera",
        "printer",
        "monitor",
        "electronic",
        "electronics",
        "battery",
        "power bank",
    ],

    "food": [
        "food",
        "biscuit",
        "biscuits",
        "cookie",
        "cookies",
        "rice",
        "atta",
        "flour",
        "sugar",
        "salt",
        "spice",
        "spices",
        "masala",
        "noodles",
        "chips",
        "snack",
        "snacks",
        "juice",
        "beverage",
        "drink",
        "milk",
        "tea",
        "coffee",
        "chocolate",
        "ingredients",
        "nutrition",
        "edible",
        "cereal",
        "dal",
        "pulses",
    ],

    "garment": [
        "shirt",
        "shirts",
        "t-shirt",
        "tshirt",
        "tshirts",
        "trouser",
        "trousers",
        "jeans",
        "dress",
        "dresses",
        "jacket",
        "kurta",
        "garment",
        "garments",
        "clothing",
        "apparel",
        "cotton",
        "fabric",
        "textile",
        "sweater",
        "hoodie",
        "shorts",
        "socks",
    ],

    "imported": [
        "imported",
        "imported by",
        "country of origin",
        "made in china",
        "made in usa",
        "made in japan",
        "made in korea",
        "made in vietnam",
        "made in thailand",
        "made in indonesia",
    ],

    "multi-pack": [
        "multi pack",
        "multi-pack",
        "multipack",
        "pack of",
        "set of",
        "combo pack",
        "combo",
        "value pack",
        "family pack",
        "twin pack",
        "triple pack",
        "2 x",
        "3 x",
        "4 x",
        "5 x",
        "6 x",
        "10 x",
    ],
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: Any) -> str:
    """
    Normalize OCR/product text.

    Example:
        " SAMSUNG   SMARTPHONE\\n128 GB "
        ->
        "samsung smartphone 128 gb"
    """

    if text is None:
        return ""

    text = str(text).lower()

    text = text.replace("\n", " ")
    text = text.replace("\t", " ")

    # Normalize multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ============================================================
# KEYWORD MATCHING
# ============================================================

def find_matches(
    text: str,
    keywords: list[str]
) -> list[str]:
    """
    Find category keywords present in the text.
    """

    matches = []

    for keyword in keywords:

        keyword = normalize_text(keyword)

        if keyword and keyword in text:
            matches.append(keyword)

    return matches


# ============================================================
# CONFIDENCE
# ============================================================

def calculate_confidence(
    matched_count: int,
    total_matches: int
) -> float:
    """
    Calculate classification confidence.

    This is an evidence-based classification confidence.
    It is NOT legal compliance confidence.
    """

    if matched_count <= 0:
        return 0.30

    if total_matches <= 0:
        return 0.30

    confidence = matched_count / total_matches

    # More matching keywords = stronger evidence
    if matched_count >= 4:
        confidence += 0.10

    elif matched_count == 3:
        confidence += 0.08

    elif matched_count == 2:
        confidence += 0.05

    return round(
        min(confidence, 0.99),
        2
    )


# ============================================================
# PRODUCT CLASSIFIER
# ============================================================

def classify_product(text: str) -> dict:
    """
    Classify product from text.

    Example:

        classify_product(
            "Samsung smartphone 128 GB charger"
        )

    Returns:

        {
            "category": "electronics",
            "confidence": 0.99
        }
    """

    normalized_text = normalize_text(text)

    # Empty input
    if not normalized_text:

        return {
            "category": "general",
            "confidence": 0.30
        }

    scores = {}
    matches = {}

    # Find evidence for every category
    for category, keywords in CATEGORY_KEYWORDS.items():

        category_matches = find_matches(
            normalized_text,
            keywords
        )

        matches[category] = category_matches
        scores[category] = len(category_matches)

    # --------------------------------------------------------
    # MULTI-PACK PRIORITY
    # --------------------------------------------------------
    #
    # "Pack of 6 chocolate bars"
    #
    # contains both:
    #   food       -> chocolate
    #   multi-pack -> pack of
    #
    # Multi-pack indicator is explicit, therefore prioritize it.
    # --------------------------------------------------------

    multipack_matches = matches.get(
        "multi-pack",
        []
    )

    strong_multipack_indicators = [
        "multi pack",
        "multi-pack",
        "multipack",
        "pack of",
        "set of",
        "combo pack",
        "value pack",
        "family pack",
        "twin pack",
        "triple pack",
    ]

    if any(
        indicator in normalized_text
        for indicator in strong_multipack_indicators
    ):

        return {
            "category": "multi-pack",
            "confidence": 0.90
        }

    # --------------------------------------------------------
    # NO MATCH
    # --------------------------------------------------------

    best_category = max(
        scores,
        key=scores.get
    )

    best_score = scores[best_category]
    total_score = sum(scores.values())

    if best_score == 0:

        return {
            "category": "general",
            "confidence": 0.40
        }

    # --------------------------------------------------------
    # AMBIGUOUS / WEAK MATCH
    # --------------------------------------------------------

    confidence = calculate_confidence(
        best_score,
        total_score
    )

    if best_score == 1:

        return {
            "category": best_category,
            "confidence": min(confidence, 0.60)
        }

    return {
        "category": best_category,
        "confidence": confidence
    }


# ============================================================
# OCR RESULT CLASSIFICATION
# ============================================================

def classify_from_ocr_results(
    ocr_results: list
) -> dict:
    """
    Classify product directly from OCR results.

    Supported format:

        [
            {"text": "Samsung"},
            {"text": "Smartphone"},
            {"text": "128 GB"}
        ]

    Also supports:

        [
            "Samsung",
            "Smartphone",
            "128 GB"
        ]
    """

    if not ocr_results:

        return {
            "category": "general",
            "confidence": 0.30
        }

    texts = []

    for item in ocr_results:

        if isinstance(item, dict):

            text = item.get("text")

            if text:
                texts.append(
                    str(text)
                )

        elif isinstance(item, str):

            texts.append(item)

    combined_text = " ".join(texts)

    return classify_product(
        combined_text
    )


# ============================================================
# CLASSIFICATION DETAILS
# ============================================================

def get_classification_details(
    text: str
) -> dict:
    """
    Return classification result along with
    matched evidence.

    Useful for debugging and future explainability.
    """

    normalized_text = normalize_text(text)

    result = classify_product(
        normalized_text
    )

    evidence = {}

    for category, keywords in CATEGORY_KEYWORDS.items():

        evidence[category] = find_matches(
            normalized_text,
            keywords
        )

    result["evidence"] = evidence

    return result