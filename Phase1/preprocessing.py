import os
import json
import cv2
import numpy as np
from PIL import Image, ImageOps


# ==========================================
# Configuration
# ==========================================

ALLOWED_FORMATS = [".jpg", ".jpeg", ".png", ".webp"]

MIN_WIDTH = 640
MIN_HEIGHT = 480

MAX_WIDTH = 1920
MAX_HEIGHT = 1920

MAX_FILE_SIZE_MB = 20

OUTPUT_DIR = "Phase1/output"


# ==========================================
# 1. Image Validation
# ==========================================

def validate_image(image_path):

    result = {
        "valid": False,
        "width": 0,
        "height": 0,
        "format": "",
        "file_size_mb": 0,
        "message": ""
    }

    # Check file exists
    if not os.path.exists(image_path):
        result["message"] = "Image file not found"
        return None, result

    # Check extension
    extension = os.path.splitext(image_path)[1].lower()

    if extension not in ALLOWED_FORMATS:
        result["message"] = (
            "Unsupported image format. "
            "Use JPG, PNG or WebP."
        )
        return None, result

    result["format"] = extension.replace(".", "")

    # Check file size
    file_size_mb = os.path.getsize(image_path) / (1024 * 1024)

    result["file_size_mb"] = round(file_size_mb, 2)

    if file_size_mb > MAX_FILE_SIZE_MB:
        result["message"] = (
            f"Image file is too large. "
            f"Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
        )
        return None, result

    # Read image
    image = cv2.imread(image_path)

    if image is None:
        result["message"] = "Unable to read image. File may be corrupted."
        return None, result

    # Check empty image
    if image.size == 0:
        result["message"] = "Invalid or empty image."
        return None, result

    # Get dimensions
    height, width = image.shape[:2]

    result["width"] = width
    result["height"] = height

    # Resolution check
    if width < MIN_WIDTH or height < MIN_HEIGHT:
        result["message"] = (
            f"Image resolution is too low. "
            f"Minimum required resolution is "
            f"{MIN_WIDTH}x{MIN_HEIGHT}."
        )
        return None, result

    result["valid"] = True
    result["message"] = "Image validation successful"

    return image, result


# ==========================================
# 2. Orientation Correction
# ==========================================

def correct_orientation(image_path):

    try:

        pil_image = Image.open(image_path)

        # Correct EXIF orientation
        pil_image = ImageOps.exif_transpose(pil_image)

        # Convert to RGB
        pil_image = pil_image.convert("RGB")

        # PIL → NumPy
        image = np.array(pil_image)

        # RGB → BGR for OpenCV
        image = cv2.cvtColor(
            image,
            cv2.COLOR_RGB2BGR
        )

        return image

    except Exception:
        return None


# ==========================================
# 3. Resize Image
# ==========================================

def resize_image(image):

    height, width = image.shape[:2]

    # No resize required
    if width <= MAX_WIDTH and height <= MAX_HEIGHT:
        return image

    # Calculate scale
    scale = min(
        MAX_WIDTH / width,
        MAX_HEIGHT / height
    )

    new_width = int(width * scale)
    new_height = int(height * scale)

    resized = cv2.resize(
        image,
        (new_width, new_height),
        interpolation=cv2.INTER_AREA
    )

    return resized


# ==========================================
# 4. Grayscale Conversion
# ==========================================

def convert_to_grayscale(image):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    return gray


# ==========================================
# 5. Noise Reduction
# ==========================================

def reduce_noise(image):

    denoised = cv2.fastNlMeansDenoising(
        image,
        None,
        h=10,
        templateWindowSize=7,
        searchWindowSize=21
    )

    return denoised


# ==========================================
# 6. CLAHE Contrast Enhancement
# ==========================================

def enhance_contrast(image):

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    enhanced = clahe.apply(image)

    return enhanced


# ==========================================
# 7. Perspective Correction
# ==========================================

def perspective_correction(image):

    # Convert image to grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Edge detection
    edges = cv2.Canny(
        gray,
        50,
        150
    )

    # Find contours
    contours, _ = cv2.findContours(
        edges,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return image

    # Sort contours by area
    contours = sorted(
        contours,
        key=cv2.contourArea,
        reverse=True
    )

    image_area = image.shape[0] * image.shape[1]

    # Look for a large rectangular region
    for contour in contours:

        area = cv2.contourArea(contour)

        # Ignore very small regions
        if area < image_area * 0.20:
            continue

        perimeter = cv2.arcLength(
            contour,
            True
        )

        approx = cv2.approxPolyDP(
            contour,
            0.02 * perimeter,
            True
        )

        # Need approximately 4 corners
        if len(approx) == 4:

            points = approx.reshape(4, 2)

            corrected = four_point_transform(
                image,
                points
            )

            return corrected

    # If no suitable rectangle found,
    # return original image
    return image


# ==========================================
# 8. Four Point Perspective Transform
# ==========================================

def four_point_transform(image, points):

    points = np.array(
        points,
        dtype="float32"
    )

    # Sort points
    rect = np.zeros(
        (4, 2),
        dtype="float32"
    )

    total = points.sum(axis=1)

    rect[0] = points[np.argmin(total)]
    rect[2] = points[np.argmax(total)]

    difference = np.diff(
        points,
        axis=1
    )

    rect[1] = points[np.argmin(difference)]
    rect[3] = points[np.argmax(difference)]

    (top_left,
     top_right,
     bottom_right,
     bottom_left) = rect

    # Calculate width
    width_a = np.linalg.norm(
        bottom_right - bottom_left
    )

    width_b = np.linalg.norm(
        top_right - top_left
    )

    max_width = int(
        max(width_a, width_b)
    )

    # Calculate height
    height_a = np.linalg.norm(
        top_right - bottom_right
    )

    height_b = np.linalg.norm(
        top_left - bottom_left
    )

    max_height = int(
        max(height_a, height_b)
    )

    # Avoid invalid dimensions
    if max_width <= 0 or max_height <= 0:
        return image

    destination = np.array(
        [
            [0, 0],
            [max_width - 1, 0],
            [max_width - 1, max_height - 1],
            [0, max_height - 1]
        ],
        dtype="float32"
    )

    # Perspective matrix
    matrix = cv2.getPerspectiveTransform(
        rect,
        destination
    )

    # Apply transformation
    warped = cv2.warpPerspective(
        image,
        matrix,
        (max_width, max_height)
    )

    return warped


# ==========================================
# 9. Main Preprocessing Pipeline
# ==========================================

def preprocess_image(image_path, save_output=True):

    # --------------------------------------
    # Step 1: Validate image
    # --------------------------------------

    image, metadata = validate_image(
        image_path
    )

    if not metadata["valid"]:
        return None, metadata

    # --------------------------------------
    # Step 2: Orientation correction
    # --------------------------------------

    corrected = correct_orientation(
        image_path
    )

    if corrected is None:

        metadata["valid"] = False
        metadata["message"] = (
            "Orientation correction failed."
        )

        return None, metadata

    # Update dimensions after orientation
    height, width = corrected.shape[:2]

    metadata["width"] = width
    metadata["height"] = height

    # --------------------------------------
    # Step 3: Resize
    # --------------------------------------

    resized = resize_image(
        corrected
    )

    # --------------------------------------
    # Step 4: Perspective correction
    # --------------------------------------

    perspective_corrected = perspective_correction(
        resized
    )

    # --------------------------------------
    # Step 5: Grayscale
    # --------------------------------------

    gray = convert_to_grayscale(
        perspective_corrected
    )

    # --------------------------------------
    # Step 6: Noise reduction
    # --------------------------------------

    denoised = reduce_noise(
        gray
    )

    # --------------------------------------
    # Step 7: CLAHE enhancement
    # --------------------------------------

    processed = enhance_contrast(
        denoised
    )

    # --------------------------------------
    # Update metadata
    # --------------------------------------

    metadata["message"] = (
        "Image successfully preprocessed"
    )

    metadata["processing"] = {
        "orientation_correction": True,
        "resizing": True,
        "grayscale": True,
        "noise_reduction": True,
        "clahe": True,
        "perspective_correction": True
    }

    # --------------------------------------
    # Step 8: Save output
    # --------------------------------------

    if save_output:

        os.makedirs(
            OUTPUT_DIR,
            exist_ok=True
        )

        output_path = os.path.join(
            OUTPUT_DIR,
            "processed_image.jpg"
        )

        cv2.imwrite(
            output_path,
            processed
        )

        metadata["output_path"] = output_path

        # Save metadata JSON
        metadata_path = os.path.join(
            OUTPUT_DIR,
            "metadata.json"
        )

        with open(
            metadata_path,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                metadata,
                file,
                indent=4
            )

        metadata["metadata_path"] = metadata_path

    return processed, metadata