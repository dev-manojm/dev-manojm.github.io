"""Fail a public-site build if sensitive master-profile fields slip in."""
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "portfolio-data.json"
ALLOWED_KEYS = {
    "schema_version", "name", "headline", "location", "summary", "years_experience",
    "cloud_platforms", "links", "experience", "projects", "skills", "achievements",
    "education", "certifications", "employer", "title", "start_date", "end_date",
    "positions", "technologies", "date", "detail", "institution", "gpa", "label", "url",
}


def validate(value, path="root"):
    if isinstance(value, dict):
        unexpected = set(value) - ALLOWED_KEYS
        if unexpected:
            raise ValueError(f"Unexpected public profile fields at {path}: {sorted(unexpected)}")
        for key, item in value.items():
            validate(item, f"{path}.{key}")
    elif isinstance(value, list):
        for index, item in enumerate(value):
            validate(item, f"{path}[{index}]")


def main() -> None:
    if not DATA_FILE.is_file():
        raise SystemExit("portfolio-data.json is missing; generate the allowlisted public dataset first.")
    public_data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    validate(public_data)
    forbidden_files = {".env", "master-profile.json", "manoj_more_master_career_profile.json"}
    present = {path.name.casefold() for path in ROOT.rglob("*") if path.is_file()}
    leaked = forbidden_files & present
    if leaked:
        raise SystemExit(f"Private files found in public site: {sorted(leaked)}")
    print("Public portfolio dataset passed the allowlist check.")


if __name__ == "__main__":
    main()
