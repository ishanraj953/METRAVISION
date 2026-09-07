from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class RuleCheckResult(BaseModel):
    rule_code: str
    category: str
    field_name: str
    status: str  # PASSED, FAILED, WARNING
    message: str

class ComplianceResponse(BaseModel):
    status: str
    passed: List[Dict[str, Any]] = []
    warnings: List[Dict[str, Any]] = []
    violations: List[Dict[str, Any]] = []
