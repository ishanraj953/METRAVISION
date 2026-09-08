from ocr.confidence import (
    classify_confidence,
    filter_by_confidence
)
from ocr import OCREngine


print("=" * 70)
print("PHASE 5 — OCR CONFIDENCE & BOUNDING BOX TEST")
print("=" * 70)


# ---------------------------------------------------------
# 1. CONFIDENCE CLASSIFICATION
# ---------------------------------------------------------

print("\n[1] CONFIDENCE CLASSIFICATION")

test_scores = [
    0.96,
    0.91,
    0.82,
    0.73,
    0.61,
    0.32
]

for score in test_scores:
    level = classify_confidence(score)

    print(
        f"{score:.2f} -> {level}"
    )


# ---------------------------------------------------------
# 2. REAL OCR
# ---------------------------------------------------------

print("\n[2] REAL OCR RESULTS")

engine = OCREngine()

results = engine.extract_text(
    "test_images/package1.jpg"
)

print(f"Total OCR regions: {len(results)}")


# ---------------------------------------------------------
# 3. DISPLAY OCR STRUCTURE
# ---------------------------------------------------------

print("\n[3] OCR RESULT STRUCTURE")

for result in results[:10]:

    print("\nText       :", result.text)
    print("Confidence :", round(result.confidence, 3))
    print(
        "Level      :",
        classify_confidence(result.confidence)
    )
    print("BBox       :", result.bbox)
    print("Polygon    :", result.polygon)
    print("Source     :", result.source)


# ---------------------------------------------------------
# 4. CONFIDENCE DISTRIBUTION
# ---------------------------------------------------------

print("\n[4] CONFIDENCE DISTRIBUTION")

high = 0
medium = 0
low = 0

for result in results:

    level = classify_confidence(
        result.confidence
    )

    if level == "high":
        high += 1

    elif level == "medium":
        medium += 1

    else:
        low += 1


print("High   :", high)
print("Medium :", medium)
print("Low    :", low)


# ---------------------------------------------------------
# 5. FILTERING
# ---------------------------------------------------------

filtered = filter_by_confidence(
    results,
    minimum_confidence=0.50
)

print("\n[5] FILTERING")

print(
    "Before:",
    len(results)
)

print(
    "After :",
    len(filtered)
)


print("\n" + "=" * 70)
print("PHASE 5 TEST COMPLETE")
print("=" * 70)