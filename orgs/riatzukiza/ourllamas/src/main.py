import asyncio
import hashlib
import json
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


DATA_DIR = Path(os.getenv("OUR_LLAMAS_DATA_DIR", "/data"))
INBOX_DIR = DATA_DIR / "inbox"
OUTBOX_DIR = DATA_DIR / "outbox"
ARCHIVE_DIR = DATA_DIR / "archive"
STATE_DIR = DATA_DIR / "state"
STATE_FILE = STATE_DIR / "processed.json"
LATEST_CONTACT_REPORT = OUTBOX_DIR / "contact-report-latest.json"

OUR_GPUS_API_BASE_URL = os.getenv("OUR_GPUS_API_BASE_URL", "http://host.docker.internal:18000")
WATCH_ENABLED = env_bool("OUR_LLAMAS_WATCH_ENABLED", True)
WATCH_INTERVAL_SECS = int(os.getenv("OUR_LLAMAS_WATCH_INTERVAL_SECS", "5"))
AUTO_PROBE = env_bool("OUR_LLAMAS_AUTO_PROBE", False)
CONTACT_REFRESH_LIMIT = int(os.getenv("OUR_LLAMAS_CONTACT_REFRESH_LIMIT", "100"))
CONTACT_TIMEOUT_SECS = float(os.getenv("OUR_LLAMAS_CONTACT_TIMEOUT_SECS", "15"))

SUPPORTED_SUFFIXES = {".txt", ".json", ".jsonl"}


def ensure_dirs() -> None:
    for path in (INBOX_DIR, OUTBOX_DIR, ARCHIVE_DIR, STATE_DIR):
        path.mkdir(parents=True, exist_ok=True)


def load_processed_state() -> dict[str, Any]:
    if not STATE_FILE.exists():
        return {"files": {}}
    try:
        return json.loads(STATE_FILE.read_text())
    except json.JSONDecodeError:
        return {"files": {}}


def save_processed_state(state: dict[str, Any]) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2, sort_keys=True))


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def list_inbox_files() -> list[Path]:
    return sorted(
        [
            path
            for path in INBOX_DIR.iterdir()
            if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES
        ],
        key=lambda path: path.stat().st_mtime,
    )


def archive_file(path: Path) -> Path:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    archived_path = ARCHIVE_DIR / f"{timestamp}-{path.name}"
    shutil.move(str(path), archived_path)
    return archived_path


def parse_vcard(vcard_array: Any) -> dict[str, list[str]]:
    emails: set[str] = set()
    names: set[str] = set()
    phones: set[str] = set()

    if not isinstance(vcard_array, list) or len(vcard_array) < 2:
        return {"emails": [], "names": [], "phones": []}

    entries = vcard_array[1]
    if not isinstance(entries, list):
        return {"emails": [], "names": [], "phones": []}

    for entry in entries:
        if not isinstance(entry, list) or len(entry) < 4:
            continue
        field_name = entry[0]
        value = entry[3]
        if field_name == "email" and isinstance(value, str):
            emails.add(value)
        elif field_name == "fn" and isinstance(value, str):
            names.add(value)
        elif field_name == "tel" and isinstance(value, str):
            phones.add(value)

    return {
        "emails": sorted(emails),
        "names": sorted(names),
        "phones": sorted(phones),
    }


def flatten_entities(entities: Any) -> list[dict[str, Any]]:
    flattened: list[dict[str, Any]] = []

    def walk(entity: Any) -> None:
        if not isinstance(entity, dict):
            return
        vcard = parse_vcard(entity.get("vcardArray"))
        flattened.append(
            {
                "handle": entity.get("handle"),
                "roles": entity.get("roles", []),
                "emails": vcard["emails"],
                "names": vcard["names"],
                "phones": vcard["phones"],
            }
        )
        for child in entity.get("entities", []):
            walk(child)

    if isinstance(entities, list):
        for entity in entities:
            walk(entity)

    return flattened


async def ping_our_gpus() -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{OUR_GPUS_API_BASE_URL}/healthz")
        response.raise_for_status()
        return response.json()


async def upload_to_our_gpus(path: Path) -> dict[str, Any]:
    mime_type = "text/plain" if path.suffix.lower() == ".txt" else "application/octet-stream"
    async with httpx.AsyncClient(timeout=120.0) as client:
        with path.open("rb") as handle:
            response = await client.post(
                f"{OUR_GPUS_API_BASE_URL}/api/ingest",
                data={"source": "ourllamas-watch", "field_map": "{}"},
                files={"file": (path.name, handle, mime_type)},
            )
        response.raise_for_status()
        return response.json()


async def trigger_probe() -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{OUR_GPUS_API_BASE_URL}/api/probe",
            json={"filter": {"status": "discovered"}},
        )
        response.raise_for_status()
        return response.json()


async def fetch_all_hosts(limit: int) -> list[dict[str, Any]]:
    hosts: list[dict[str, Any]] = []
    async with httpx.AsyncClient(timeout=30.0) as client:
        page = 1
        remaining = limit
        while remaining > 0:
            page_size = min(500, remaining)
            response = await client.get(
                f"{OUR_GPUS_API_BASE_URL}/api/hosts",
                params={"page": page, "size": page_size},
            )
            response.raise_for_status()
            payload = response.json()
            items = payload.get("items", [])
            if not items:
                break
            hosts.extend(items)
            remaining -= len(items)
            if page >= payload.get("pages", 0):
                break
            page += 1
    return hosts


async def lookup_rdap_contact(ip: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=CONTACT_TIMEOUT_SECS, follow_redirects=True) as client:
        response = await client.get(f"https://rdap.org/ip/{ip}")
        response.raise_for_status()
        payload = response.json()

    entities = flatten_entities(payload.get("entities", []))
    emails = sorted({email for entity in entities for email in entity.get("emails", [])})
    names = sorted({name for entity in entities for name in entity.get("names", [])})
    phones = sorted({phone for entity in entities for phone in entity.get("phones", [])})

    return {
        "ip": ip,
        "queried_at": utc_now_iso(),
        "rdap_url": str(response.url),
        "handle": payload.get("handle"),
        "name": payload.get("name"),
        "type": payload.get("type"),
        "country": payload.get("country"),
        "startAddress": payload.get("startAddress"),
        "endAddress": payload.get("endAddress"),
        "emails": emails,
        "names": names,
        "phones": phones,
        "entities": entities,
    }


def write_contact_report(report: dict[str, Any]) -> Path:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    snapshot_path = OUTBOX_DIR / f"contact-report-{timestamp}.json"
    body = json.dumps(report, indent=2, sort_keys=True)
    snapshot_path.write_text(body)
    LATEST_CONTACT_REPORT.write_text(body)
    return snapshot_path


async def build_contact_report(limit: int) -> dict[str, Any]:
    hosts = await fetch_all_hosts(limit=limit)
    results: list[dict[str, Any]] = []

    for host in hosts:
        ip = host.get("ip")
        if not isinstance(ip, str) or not ip:
            continue
        try:
            rdap = await lookup_rdap_contact(ip)
            results.append(
                {
                    "host": host,
                    "contact": rdap,
                }
            )
        except Exception as exc:  # noqa: BLE001
            results.append(
                {
                    "host": host,
                    "contact": {
                        "ip": ip,
                        "queried_at": utc_now_iso(),
                        "error": str(exc),
                    },
                }
            )

    report = {
        "generated_at": utc_now_iso(),
        "source": "ourllamas-rdap",
        "limit": limit,
        "total_hosts_considered": len(hosts),
        "entries": results,
    }
    write_contact_report(report)
    return report


app = FastAPI(title="ourllamas", version="0.1.0")
app.state.process_lock = asyncio.Lock()
app.state.watch_task = None
app.state.last_processed_at = None
app.state.last_contact_refresh_at = None
app.state.processed_files = 0
app.state.failed_files = 0


async def process_inbox_once() -> dict[str, Any]:
    async with app.state.process_lock:
        ensure_dirs()
        state = load_processed_state()
        files_state = state.setdefault("files", {})
        processed: list[dict[str, Any]] = []
        failed: list[dict[str, Any]] = []

        for path in list_inbox_files():
            file_hash = sha256_file(path)
            if file_hash in files_state:
                archive_file(path)
                continue

            try:
                ingest_result = await upload_to_our_gpus(path)
                probe_result: dict[str, Any] | None = None
                if AUTO_PROBE:
                    probe_result = await trigger_probe()
                archived_path = archive_file(path)
                files_state[file_hash] = {
                    "file_name": path.name,
                    "archived_path": str(archived_path),
                    "processed_at": utc_now_iso(),
                    "ingest_result": ingest_result,
                    "probe_result": probe_result,
                }
                processed.append(files_state[file_hash])
                app.state.processed_files += 1
            except Exception as exc:  # noqa: BLE001
                failed.append({"file_name": path.name, "error": str(exc)})
                app.state.failed_files += 1

        save_processed_state(state)
        app.state.last_processed_at = utc_now_iso()

        return {
            "processed": processed,
            "failed": failed,
            "processed_count": len(processed),
            "failed_count": len(failed),
        }


async def watch_loop() -> None:
    while True:
        try:
            await process_inbox_once()
        except Exception:
            pass
        await asyncio.sleep(WATCH_INTERVAL_SECS)


@app.on_event("startup")
async def startup() -> None:
    ensure_dirs()
    if WATCH_ENABLED:
        app.state.watch_task = asyncio.create_task(watch_loop())


@app.on_event("shutdown")
async def shutdown() -> None:
    task = app.state.watch_task
    if task:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


@app.get("/healthz")
async def healthz() -> dict[str, Any]:
    our_gpus_status: dict[str, Any] | None = None
    our_gpus_error: str | None = None

    try:
        our_gpus_status = await ping_our_gpus()
    except Exception as exc:  # noqa: BLE001
        our_gpus_error = str(exc)

    return {
        "ok": our_gpus_error is None,
        "service": "ourllamas",
        "time": utc_now_iso(),
        "watch_enabled": WATCH_ENABLED,
        "inbox_files": len(list_inbox_files()),
        "last_processed_at": app.state.last_processed_at,
        "last_contact_refresh_at": app.state.last_contact_refresh_at,
        "processed_files": app.state.processed_files,
        "failed_files": app.state.failed_files,
        "our_gpus": our_gpus_status,
        "our_gpus_error": our_gpus_error,
    }


@app.post("/api/process-now")
async def api_process_now() -> dict[str, Any]:
    return await process_inbox_once()


@app.post("/api/contacts/refresh")
async def api_contacts_refresh(limit: int = CONTACT_REFRESH_LIMIT) -> dict[str, Any]:
    if limit < 1 or limit > 1000:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 1000")
    report = await build_contact_report(limit=limit)
    app.state.last_contact_refresh_at = report["generated_at"]
    return {
        "generated_at": report["generated_at"],
        "total_hosts_considered": report["total_hosts_considered"],
        "saved_to": str(LATEST_CONTACT_REPORT),
    }


@app.get("/api/contacts/report")
async def api_contacts_report() -> Any:
    if not LATEST_CONTACT_REPORT.exists():
        raise HTTPException(status_code=404, detail="contact report not found")
    return json.loads(LATEST_CONTACT_REPORT.read_text())