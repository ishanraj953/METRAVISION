import cv2
from typing import List

from .ocr_result import OCRResult


def draw_ocr_results(
    image_path: str,
    results: List[OCRResult],
    output_path: str
) -> None:

    image = cv2.imread(image_path)

    if image is None:
        raise FileNotFoundError(
            f"Unable to load image: {image_path}"
        )

    for result in results:

        x1, y1, x2, y2 = result.bbox

        # Draw bounding box
        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2
        )

        # Label
        label = f"{result.confidence:.2f}"

        cv2.putText(
            image,
            label,
            (x1, max(y1 - 5, 15)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            (0, 255, 0),
            1,
            cv2.LINE_AA
        )

    success = cv2.imwrite(output_path, image)

    if not success:
        raise RuntimeError(
            f"Failed to save visualization: {output_path}"
        )