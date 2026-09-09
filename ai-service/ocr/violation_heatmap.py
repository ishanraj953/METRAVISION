import cv2
from pathlib import Path


def generate_violation_heatmap(
    image_path: str,
    violations,
    output_path: str,
):
    image = cv2.imread(image_path)

    if image is None:
        raise FileNotFoundError(image_path)

    for violation in violations:
        x1, y1, x2, y2 = violation.bbox

        if violation.severity == "HIGH":
            color = (0, 0, 255)
        elif violation.severity == "MEDIUM":
            color = (0, 165, 255)
        else:
            color = (0, 255, 0)

        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            color,
            3,
        )

        label = (
            f"{violation.violation_type}"
            f" [{violation.severity}]"
        )

        cv2.putText(
            image,
            label,
            (x1, max(20, y1 - 8)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            color,
            2,
        )

    Path(output_path).parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    cv2.imwrite(output_path, image)

    return output_path