from .ocr_engine import OCREngine
from .ocr_result import OCRResult

from .visualizer import draw_ocr_results

from .postprocess import (
    sort_ocr_results,
    group_into_lines,
    line_to_text,
    build_text_lines,

    normalize_text,
    normalize_unit,
    normalize_units_in_text,

    normalize_currency,
    extract_currency,

    normalize_date,
    extract_dates_from_text,

    normalize_phone,
    extract_phone_numbers,

    normalize_email,
    extract_emails,

    normalize_address,
    looks_like_address,

    detect_declaration_labels,

    normalize_ocr_result,
    build_normalized_ocr_output,
)

from .declaration_extractor import (
    extract_declarations,
    extract_declaration_value,
    classify_mfd_use_by_dates,
    extract_mrp,
    extract_net_quantity,
    extract_net_weight,
    extract_unit_sale_price,
    extract_standalone_unit_price,
    extract_manufacturer,
    extract_packer,
    extract_importer,
    extract_consumer_care,
    extract_manufacturing_date,
    extract_country_of_origin,
    extract_product_name_candidate,
)

from .confidence import (
    classify_confidence,
    filter_by_confidence,
    validate_bbox,
    build_ocr_evidence
)

__all__ = [
    "OCREngine",
    "OCRResult",

    "draw_ocr_results",

    "sort_ocr_results",
    "group_into_lines",
    "line_to_text",
    "build_text_lines",

    "normalize_text",
    "normalize_unit",
    "normalize_units_in_text",

    "normalize_currency",
    "extract_currency",

    "normalize_date",
    "extract_dates_from_text",

    "normalize_phone",
    "extract_phone_numbers",

    "normalize_email",
    "extract_emails",

    "normalize_address",
    "looks_like_address",

    "detect_declaration_labels",

    "classify_confidence",
    "filter_by_confidence",
    "validate_bbox",
    "build_ocr_evidence",

    "normalize_ocr_result",
    "build_normalized_ocr_output",

    "extract_declarations",
    "extract_declaration_value",
    "classify_mfd_use_by_dates",
    "extract_mrp",
    "extract_net_quantity",
    "extract_net_weight",
    "extract_unit_sale_price",
    "extract_standalone_unit_price",
    "extract_manufacturer",
    "extract_packer",
    "extract_importer",
    "extract_consumer_care",
    "extract_manufacturing_date",
    "extract_country_of_origin",
    "extract_product_name_candidate",
]