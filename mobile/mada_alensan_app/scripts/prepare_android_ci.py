#!/usr/bin/env python3
"""Small CI hardening script for generated Flutter Android files.

The repository intentionally keeps the Flutter app source light. GitHub Actions
runs `flutter create` when the Android platform folder is missing. This script
then applies the production Android settings that the app needs to call the API
from release APKs.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "android" / "app" / "src" / "main" / "AndroidManifest.xml"
GRADLE = ROOT / "android" / "app" / "build.gradle"


def patch_manifest() -> None:
    if not MANIFEST.exists():
        raise SystemExit(f"AndroidManifest.xml not found: {MANIFEST}")
    text = MANIFEST.read_text(encoding="utf-8")

    permissions = [
        "android.permission.INTERNET",
        "android.permission.POST_NOTIFICATIONS",
    ]
    for permission in permissions:
        if permission not in text:
            text = text.replace(
                "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\">",
                "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\">\n"
                f"    <uses-permission android:name=\"{permission}\" />",
            )

    # Keep a clear Arabic label for installed APKs without requiring custom assets.
    text = text.replace('android:label="mada_alensan_app"', 'android:label="مدى الإنسان"')
    MANIFEST.write_text(text, encoding="utf-8")


def patch_gradle() -> None:
    if not GRADLE.exists():
        # Newer Flutter versions may use Kotlin DSL. The build still works, so do not fail here.
        return
    text = GRADLE.read_text(encoding="utf-8")

    # Do not force heavy custom Gradle changes. Release size is controlled by split-per-abi.
    # Keep this hook for future safe Android tweaks if the generated template changes.
    GRADLE.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    patch_manifest()
    patch_gradle()
    print("Android CI files prepared successfully.")
