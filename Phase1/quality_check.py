import os
import cv2
import numpy as np


# ==========================================
# Configuration
# ==========================================

MIN_WIDTH = 640
MIN_HEIGHT = 480

BLUR_THRESHOLD = 80.0

DARK_THRESHOLD = 45
BRIGHT_THRESHOLD = 215

CONTRAST_THRESHOLD = 35

GLARE_PIXEL_THRESHOLD = 245
GLARE_PERCENT_THRESHOLD = 3.0

QUALITY_THRESHOLD = 60


# ==========================================
# 1. Resolution Check
# ==========================================

def check_resolution(image):

    height, width = image.shape[:2]

    resolution_ok = (
        width >= MIN_WIDTH
        and height >= MIN_HEIGHT
    )

    return resolution_ok


# ==========================================
# 2. Blur Detection
# ==========================================

def check_blur(gray):

    # Variance of Laplacian
    laplacian = cv2.Laplacian(
        gray,
        cv2.CV_64F
    )

    blur_score = laplacian.var()

    is_blurry = blur_score < BLUR_THRESHOLD

    return is_blurry, float(blur_score)


# ==========================================
# 3. Darkness Detection
# ==========================================

def check_darkness(gray):

    mean_brightness = np.mean(gray)

    excessive_darkness = (
        mean_brightness < DARK_THRESHOLD
    )

    return excessive_darkness, float(mean_brightness)


# ==========================================
# 4. Excessive Brightness Detection
# ==========================================

def check_brightness(gray):

    mean_brightness = np.mean(gray)

    excessive_brightness = (
        mean_brightness > BRIGHT_THRESHOLD
    )

    return excessive_brightness, float(mean_brightness)


# ==========================================
# 5. Glare Detection
# ==========================================

def check_glare(image):

    # Convert to grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Very bright pixels
    bright_pixels = (
        gray >= GLARE_PIXEL_THRESHOLD
    )

    glare_percentage = (
        np.sum(bright_pixels)
        / bright_pixels.size
    ) * 100

    glare_detected = (
        glare_percentage >= GLARE_PERCENT_THRESHOLD
    )

    return glare_detected, float(glare_percentage)


# ==========================================
# 6. Contrast Detection
# ==========================================

def check_contrast(gray):

    contrast = np.std(gray)

    poor_contrast = (
        contrast < CONTRAST_THRESHOLD
    )

    return poor_contrast, float(contrast)


# ==========================================
# 7. Extreme Perspective Detection
# ==========================================

def check_perspective(image):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    edges = cv2.Canny(
        gray,
        50,
        150
    )

    contours, _ = cv2.findContours(
        edges,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return False

    image_area = image.shape[0] * image.shape[1]

    contours = sorted(
        contours,
        key=cv2.contourArea,
        reverse=True
    )

    for contour in contours[:10]:

        area = cv2.contourArea(contour)

        if area < image_area * 0.20:
            continue

        perimeter = cv2.arcLength(
            contour,
            True
        )

        approx = cv2.approxPolyDP(
            contour,
            0.04 * perimeter,
            True
        )

        if len(approx) == 4:

            points = approx.reshape(4, 2)

            # Calculate side lengths
            sides = []

            for i in range(4):

                p1 = points[i]
                p2 = points[(i + 1) % 4]

                length = np.linalg.norm(
                    p2 - p1
                )

                sides.append(length)

            max_side = max(sides)
            min_side = min(sides)

            if min_side == 0:
                return True

            ratio = max_side / min_side

            # Extremely distorted rectangular region
            if ratio > 6:
                return True

            return False

    return False


# ==========================================
# 8. Possible Occlusion Detection
# ==========================================

def check_occlusion(image):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    height, width = gray.shape

    # Look at border regions where package
    # may be cut off by the image boundary.

    border = int(
        min(height, width) * 0.03
    )

    top = gray[:border, :]
    bottom = gray[-border:, :]
    left = gray[:, :border]
    right = gray[:, -border:]

    border_pixels = np.concatenate([
        top.flatten(),
        bottom.flatten(),
        left.flatten(),
        right.flatten()
    ])

    # Very dark/empty border can indicate
    # cropping or partial visibility.
    dark_border_ratio = np.mean(
        border_pixels < 20
    )

    possible_occlusion = (
        dark_border_ratio > 0.35
    )

    return possible_occlusion


# ==========================================
# 9. Quality Score
# ==========================================

def calculate_quality_score(
    blur,
    resolution_ok,
    darkness,
    brightness,
    glare,
    contrast,
    perspective,
    occlusion
):

    score = 100

    # Blur
    if blur:
        score -= 25

    # Resolution
    if not resolution_ok:
        score -= 25

    # Darkness
    if darkness:
        score -= 15

    # Excessive brightness
    if brightness:
        score -= 15

    # Glare
    if glare:
        score -= 10

    # Poor contrast
    if contrast:
        score -= 10

    # Extreme perspective
    if perspective:
        score -= 10

    # Possible occlusion
    if occlusion:
        score -= 10

    score = max(
        0,
        min(100, score)
    )

    return score


# ==========================================
# 10. Main Quality Assessment
# ==========================================

def assess_image_quality(image_path):

    result = {
        "quality_score": 0,
        "blur": False,
        "resolution_ok": False,
        "darkness": False,
        "brightness": False,
        "glare": False,
        "poor_contrast": False,
        "extreme_perspective": False,
        "possible_occlusion": False,
        "usable": False,
        "status": "INSUFFICIENT EVIDENCE",
        "message": ""
    }

    # --------------------------------------
    # File check
    # --------------------------------------

    if not os.path.exists(image_path):

        result["message"] = (
            "Image file not found"
        )

        return result

    # --------------------------------------
    # Read image
    # --------------------------------------

    image = cv2.imread(image_path)

    if image is None:

        result["message"] = (
            "Unable to read image"
        )

        return result

    if image.size == 0:

        result["message"] = (
            "Empty or invalid image"
        )

        return result

    # --------------------------------------
    # Grayscale
    # --------------------------------------

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # --------------------------------------
    # Run quality checks
    # --------------------------------------

    resolution_ok = check_resolution(
        image
    )

    blur, blur_score = check_blur(
        gray
    )

    darkness, brightness_score = check_darkness(
        gray
    )

    brightness, _ = check_brightness(
        gray
    )

    glare, glare_percentage = check_glare(
        image
    )

    poor_contrast, contrast_score = check_contrast(
        gray
    )

    extreme_perspective = check_perspective(
        image
    )

    possible_occlusion = check_occlusion(
        image
    )

    # --------------------------------------
    # Calculate final score
    # --------------------------------------

    quality_score = calculate_quality_score(
        blur,
        resolution_ok,
        darkness,
        brightness,
        glare,
        poor_contrast,
        extreme_perspective,
        possible_occlusion
    )

    # --------------------------------------
    # Decide usability
    # --------------------------------------

    usable = (
        quality_score >= QUALITY_THRESHOLD
        and resolution_ok
    )

    # --------------------------------------
    # Final status
    # --------------------------------------

    if usable:

        status = "USABLE"

        message = (
            "Image quality is sufficient "
            "for OCR and further analysis."
        )

    else:

        status = "INSUFFICIENT EVIDENCE"

        message = (
            "Image quality is too poor for "
            "reliable OCR-based compliance analysis."
        )

    # --------------------------------------
    # Result
    # --------------------------------------

    result.update({

        "quality_score": quality_score,

        "blur": blur,

        "resolution_ok": resolution_ok,

        "darkness": darkness,

        "brightness": brightness,

        "glare": glare,

        "poor_contrast": poor_contrast,

        "extreme_perspective": extreme_perspective,

        "possible_occlusion": possible_occlusion,

        "usable": usable,

        "status": status,

        "message": message,

        # Useful diagnostic values
        "diagnostics": {
            "blur_score": round(
                blur_score,
                2
            ),

            "brightness_score": round(
                brightness_score,
                2
            ),

            "contrast_score": round(
                contrast_score,
                2
            ),

            "glare_percentage": round(
                glare_percentage,
                2
            )
        }
    })

    return result