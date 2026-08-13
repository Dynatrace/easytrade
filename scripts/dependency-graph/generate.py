import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit(
        "PyYAML is required to run this script.\n"
        "Install it with: pip install -r scripts/dependency-graph/requirements.txt"
    )

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
COMPOSE_FILE = REPO_ROOT / "compose.dev.yaml"
README_FILE = REPO_ROOT / "README.md"
SRC_DIR = REPO_ROOT / "src"

START_MARKER = "<!-- dependency-graph:start -->"
END_MARKER = "<!-- dependency-graph:end -->"

LANGUAGE_RULES = [
    ("java", ("build.gradle", "build.gradle.kts"), "Java", "#f8b4b4", "#c0392b"),
    ("dotnet", ("*.csproj",), "C# / .NET", "#d2b4de", "#6c3483"),
    ("go", ("go.mod",), "Go", "#a9cce3", "#1f618d"),
    ("node", ("package.json",), "TypeScript / Node.js", "#a9dfbf", "#1e8449"),
]
OTHER_LANGUAGE = ("other", "Other / config (no language manifest)", "#d5d8dc", "#5d6d7e")

NODE_TEXT_COLOR = "#1a1a1a"


def load_compose_services() -> dict:
    with COMPOSE_FILE.open() as f:
        data = yaml.safe_load(f)
    return data.get("services", {})


def discover_off_compose_services(compose_services: dict) -> list:
    """Services that exist under src/ but have no compose.dev.yaml entry."""
    src_services = {
        p.name for p in SRC_DIR.iterdir() if p.is_dir() and p.name != "proto"
    }
    return sorted(src_services - compose_services.keys())


def build_graph(compose_services: dict):
    node_names = set(compose_services.keys())
    off_compose = discover_off_compose_services(compose_services)
    node_names |= set(off_compose)

    edges = set()
    for name, spec in compose_services.items():
        for dep in (spec or {}).get("depends_on") or []:
            edges.add((name, dep))

    return sorted(node_names), sorted(edges), off_compose


def resolve_service_dir(name: str, spec: dict) -> Path:
    build = (spec or {}).get("build")
    context = None
    if isinstance(build, str):
        context = build
    elif isinstance(build, dict):
        context = build.get("context")
    if not context:
        context = f"src/{name}"
    if "${" in context:
        context = context.split("${", 1)[0].rstrip("/")
    path = REPO_ROOT / context
    return path if path.exists() else SRC_DIR / name


def detect_language(service_dir: Path) -> str:
    for key, patterns, *_ in LANGUAGE_RULES:
        for pattern in patterns:
            if next(
                (p for p in service_dir.rglob(pattern) if "node_modules" not in p.parts),
                None,
            ):
                return key
    return OTHER_LANGUAGE[0]


def detect_languages(compose_services: dict, all_nodes: list) -> dict:
    return {
        name: detect_language(resolve_service_dir(name, compose_services.get(name)))
        for name in all_nodes
    }


def language_style(key: str):
    for rule_key, _patterns, label, fill, stroke in LANGUAGE_RULES:
        if rule_key == key:
            return label, fill, stroke
    return OTHER_LANGUAGE[1], OTHER_LANGUAGE[2], OTHER_LANGUAGE[3]


def render_mermaid(nodes, edges, off_compose, languages) -> str:
    lines = ["flowchart TD"]
    for src, dst in edges:
        lines.append(f"    {src} --> {dst}")

    connected = {n for edge in edges for n in edge}
    off_compose_set = set(off_compose)
    for node in nodes:
        if node not in connected and node not in off_compose_set:
            lines.append(f"    {node}")

    by_class = {}
    for node in nodes:
        lang = languages[node]
        class_name = f"{lang}OffCompose" if node in off_compose_set else lang
        by_class.setdefault(class_name, []).append(node)

    lines.append("")
    for class_name in sorted(by_class):
        node_list = ",".join(sorted(by_class[class_name]))
        lines.append(f"    class {node_list} {class_name}")

    used_languages = sorted({languages[n] for n in nodes})
    lines.append("")
    for lang in used_languages:
        _label, fill, stroke = language_style(lang)
        lines.append(
            f"    classDef {lang} fill:{fill},stroke:{stroke},color:{NODE_TEXT_COLOR},"
            "stroke-width:1px"
        )
    for lang in sorted({languages[n] for n in off_compose_set}):
        _label, fill, stroke = language_style(lang)
        lines.append(
            f"    classDef {lang}OffCompose fill:{fill},stroke:{stroke},"
            f"color:{NODE_TEXT_COLOR},stroke-width:1px,stroke-dasharray:5 5"
        )

    lines.append("")
    lines.append("    subgraph Legend[Legend: implementation language]")
    lines.append("        direction LR")
    for lang in used_languages:
        label, _fill, _stroke = language_style(lang)
        lines.append(f'        legend_{lang}["{label}"]:::{lang}')
    lines.append("    end")

    return "\n".join(lines)


def inject_into_readme(mermaid_body: str) -> None:
    text = README_FILE.read_text()
    pattern = re.compile(
        re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER), re.DOTALL
    )
    if not pattern.search(text):
        sys.exit(
            f"Could not find {START_MARKER} / {END_MARKER} markers in README.md.\n"
            "Add them once manually under the 'Dependency graph' heading before "
            "running this script."
        )
    replacement = f"{START_MARKER}\n```mermaid\n{mermaid_body}\n```\n{END_MARKER}"
    README_FILE.write_text(pattern.sub(lambda _: replacement, text, count=1))


def main() -> None:
    compose_services = load_compose_services()
    nodes, edges, off_compose = build_graph(compose_services)
    languages = detect_languages(compose_services, nodes)
    mermaid_body = render_mermaid(nodes, edges, off_compose, languages)
    inject_into_readme(mermaid_body)
    print(f"Updated dependency graph in {README_FILE.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
