#!/usr/bin/env python3
"""Pregunta a ChatGPT (API de OpenAI) y guarda la respuesta. Lo usa el agente `chatgpt`.

Uso:
  python3 herramientas/chatgpt.py --encargo encargo.md --salida respuesta.md [--modelo gpt-5-mini] [--max 4000]
  echo "texto" | python3 herramientas/chatgpt.py --salida respuesta.md

Necesita la variable de entorno OPENAI_API_KEY (nunca en el repositorio) y que la red permita api.openai.com.
Modelo por defecto: variable OPENAI_MODEL o gpt-5-mini.
"""
import argparse, json, os, sys, urllib.request, urllib.error

SISTEMA = (
    "Trabajas como colaborador creativo del estudio KARATE EMAKI (reels animados 3D de karate, base Shotokan, "
    "en español de España). Propón con libertad, pero no inventes datos: si una fecha, cifra o cita no viene en el "
    "encargo, márcala como [SIN VERIFICAR]. Nada de burlas a otros estilos. Responde en español de España."
)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--encargo", help="fichero con el encargo (si no, stdin)")
    ap.add_argument("--salida", required=True)
    ap.add_argument("--modelo", default=os.environ.get("OPENAI_MODEL", "gpt-5-mini"))
    ap.add_argument("--max", type=int, default=4000, help="máximo de tokens de salida")
    a = ap.parse_args()

    clave = os.environ.get("OPENAI_API_KEY")
    if not clave:
        sys.exit("ERROR: falta OPENAI_API_KEY (Jorge tiene que ponerla en el entorno de la nube).")
    texto = open(a.encargo, encoding="utf-8").read() if a.encargo else sys.stdin.read()

    cuerpo = {"model": a.modelo, "instructions": SISTEMA, "input": texto, "max_output_tokens": a.max}
    req = urllib.request.Request(
        "https://api.openai.com/v1/responses", data=json.dumps(cuerpo).encode(),
        headers={"Authorization": f"Bearer {clave}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            d = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"ERROR HTTP {e.code}: {e.read().decode()[:500]}")
    except urllib.error.URLError as e:
        sys.exit(f"ERROR de red (¿api.openai.com bloqueado en la nube?): {e.reason}")

    salida = d.get("output_text") or "".join(
        c.get("text", "") for o in d.get("output", []) for c in o.get("content", []) if c.get("type") == "output_text")
    uso = d.get("usage", {})
    with open(a.salida, "w", encoding="utf-8") as f:
        f.write(f"<!-- ChatGPT {a.modelo} · tokens entrada {uso.get('input_tokens')} · salida {uso.get('output_tokens')} -->\n")
        f.write(salida.strip() + "\n")
    print(f"OK {a.modelo}: {uso.get('input_tokens')} + {uso.get('output_tokens')} tokens → {a.salida}")

if __name__ == "__main__":
    main()
