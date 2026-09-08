import os
import cv2
from typing import List, Optional, Dict, Any

from .ocr_result import OCRResult


def draw_ocr_results(
    image_path: str,
    results: List[OCRResult],
    output_path: str,
    declarations: Optional[Dict[str, Any]] = None
) -> str:
    """
    Draw bounding boxes and annotations onto the image.
    Supports confidence color coding and declaration field labeling.
    """
    image = cv2.imread(image_path)

    if image is None:
        raise FileNotFoundError(
            f"Unable to load image: {image_path}"
        )

    # Build bbox to field lookup if declarations provided
    field_by_bbox = {}
    if declarations:
        fields = declarations.get("fields", {}) if isinstance(declarations, dict) else {}
        for field_name, item in fields.items():
            if item and isinstance(item, dict) and "bbox" in item and item["bbox"]:
                key = tuple(item["bbox"])
                field_by_bbox[key] = field_name

    for result in results:
        x1, y1, x2, y2 = result.bbox
        score = float(result.confidence)

        # Color based on confidence or declaration match
        bbox_tuple = tuple(result.bbox)
        if bbox_tuple in field_by_bbox:
            color = (255, 128, 0) # Orange for detected legal declaration
            label = f"{field_by_bbox[bbox_tuple]}: {result.text[:20]} ({score:.2f})"
        elif score >= 0.90:
            color = (0, 200, 0) # Green for high confidence
            label = f"{result.text[:15]} ({score:.2f})"
        elif score >= 0.70:
            color = (0, 215, 255) # Yellow for medium confidence
            label = f"{result.text[:15]} ({score:.2f})"
        else:
            color = (0, 0, 255) # Red for low confidence
            label = f"{result.text[:15]} ({score:.2f})"

        # Draw bounding box
        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            color,
            2
        )

        # Label background
        text_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
        label_y = max(y1 - 5, text_size[1] + 5)
        cv2.rectangle(
            image,
            (x1, label_y - text_size[1] - 2),
            (x1 + text_size[0] + 4, label_y + 2),
            (20, 20, 20),
            -1
        )

        # Label text
        cv2.putText(
            image,
            label,
            (x1 + 2, label_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            color,
            1,
            cv2.LINE_AA
        )

    # Ensure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    success = cv2.imwrite(output_path, image)

    if not success:
        raise RuntimeError(
            f"Failed to save visualization: {output_path}"
        )

    return output_path