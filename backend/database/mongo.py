import os
from typing import Optional, Dict, Any, List
from datetime import datetime
try:
    from pymongo import MongoClient
    from pymongo.collection import Collection
    from pymongo.database import Database
except ImportError:
    MongoClient = None
    Collection = Any
    Database = Any

from config import settings

_client: Optional[Any] = None
_db: Optional[Any] = None

def get_mongo_client() -> Optional[Any]:
    global _client
    if _client is None and MongoClient is not None:
        try:
            _client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=3000)
        except Exception:
            _client = None
    return _client

def get_mongo_db() -> Database:
    global _db
    if _db is None:
        client = get_mongo_client()
        _db = client[settings.MONGODB_DB_NAME]
    return _db

# Collection accessors
def get_collection(name: str) -> Collection:
    db = get_mongo_db()
    return db[name]

def users_collection() -> Collection:
    return get_collection("users")

def products_collection() -> Collection:
    return get_collection("products")

def scans_collection() -> Collection:
    return get_collection("scans")

def violations_collection() -> Collection:
    return get_collection("violations")

def inspections_collection() -> Collection:
    return get_collection("inspections")

def rules_collection() -> Collection:
    return get_collection("rules")

def audit_logs_collection() -> Collection:
    return get_collection("audit_logs")

def reports_collection() -> Collection:
    return get_collection("reports")

def risk_scores_collection() -> Collection:
    return get_collection("risk_scores")

def product_versions_collection() -> Collection:
    return get_collection("product_versions")

def get_next_sequence(seq_name: str) -> int:
    """Atomic auto-incrementing integer sequence generator for MongoDB documents."""
    db = get_mongo_db()
    counter = db["counters"].find_one_and_update(
        {"_id": seq_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return counter["seq"]

def serialize_mongo_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Converts MongoDB BSON types (ObjectId, datetime) to JSON/Pydantic-compatible types."""
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        if "id" not in d:
            d["id"] = d.get("numeric_id", str(d["_id"]))
        del d["_id"]
    for k, v in list(d.items()):
        if isinstance(v, datetime):
            d[k] = v.isoformat()
    return d

def serialize_mongo_list(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [serialize_mongo_doc(d) for d in docs if d]

def check_mongo_health() -> Dict[str, Any]:
    try:
        client = get_mongo_client()
        client.admin.command("ping")
        db = get_mongo_db()
        cols = db.list_collection_names()
        return {
            "connected": True,
            "engine": "MongoDB 8.0",
            "host": settings.MONGODB_URL,
            "database": settings.MONGODB_DB_NAME,
            "collections": cols,
            "status": "HEALTHY_AND_SYNCHRONIZED"
        }
    except Exception as e:
        return {
            "connected": False,
            "engine": "MongoDB 8.0",
            "error": str(e),
            "status": "CONNECTION_FAILED"
        }
