from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class DashboardStats(BaseModel):
    total_users: int
    total_products: int
    total_scans: int
    total_violations: int
    total_inspections: int
    overall_compliance_rate: float

class ComplianceStats(BaseModel):
    total_scans: int
    compliant_scans: int
    non_compliant_scans: int
    compliance_rate: float
    by_category: Dict[str, float]

class ViolationStats(BaseModel):
    total_violations: int
    open_violations: int
    confirmed_violations: int
    rejected_violations: int
    by_severity: Dict[str, int]
    by_field: Dict[str, int]

class RiskStats(BaseModel):
    high_risk_products_count: int
    repeat_offenders_count: int
    risk_distribution: Dict[str, int]

class ManufacturerStats(BaseModel):
    total_manufacturers: int
    repeat_offenders: List[Dict[str, Any]]
