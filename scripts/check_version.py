#!/usr/bin/env python3
"""Guard against shipping a mixed-version distribution."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
ver = "2.5.1"
for name in ("SWF_CheatMenu.js", "installer/main.go", "installer/main_test.go",
             "scripts/build_release.py", "scripts/verify_release.py",
             "README.md", "installer/README.md", ".github/workflows/release.yml",
             ".github/ISSUE_TEMPLATE/bug_report.yml"):
    text = (root / name).read_text(encoding="utf-8")
    assert ver in text, f"Missing {ver}: {name}"
    if name in ("SWF_CheatMenu.js", "scripts/build_release.py", "README.md"):
        assert "2.2.0" not in text, f"Old version in current release metadata: {name}"
assert 'version = "2.5.1"' in (root / "installer/main.go").read_text()
assert "SWF_CheatMenu_MV_MZ_v2.5.1.zip" in (root / "scripts/build_release.py").read_text()
assert "v2.5.1" in (root / ".github/workflows/release.yml").read_text()
print("All active version declarations agree: v2.5.1")
