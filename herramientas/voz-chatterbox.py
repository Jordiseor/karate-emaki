# KARATE EMAKI - locución con Chatterbox Multilingual (Resemble AI, licencia MIT) en el PC de Jorge.
# Lo lanza herramientas/voz-chatterbox.ps1. Uso directo:
#   python voz-chatterbox.py --pieza 2026-11-11-presentacion [--tomas 2] [--referencia mi-voz.wav]
# Usa la voz de serie del modelo. --referencia solo con la voz del propio Jorge (nunca la de otra persona).
# Crea un WAV por frase y toma, y una muestra completa con pausas naturales, en
#   Videos\KarateEmaki\<pieza>\voz-chatterbox\  (y un .zip al lado para subirlo al chat).

import argparse, os, sys, zipfile
from pathlib import Path

# Frases por pieza. Grafía adaptada para que se pronuncie bien (dōjō -> doyo).
# pausa = silencio (s) DESPUÉS de la frase en la muestra completa.
PIEZAS = {
    "2026-11-11-presentacion": [
        ("f01", "Pasa, que empezamos.", 0.45),                                              # plano 1
        ("f02", "Un emaki es un rollo japonés ilustrado que cuenta una historia, escena a escena.", 0.5),  # planos 2-3
        ("f03", "De dónde viene todo.", 0.35),                                              # plano 4
        ("f04", "La técnica, paso a paso.", 0.35),                                          # plano 5
        ("f05", "Y la física: ¿cuánto aguantas?", 0.45),                                    # plano 6
        ("f06", "Y el doyo.", 0.4),                                                         # plano 7 (aquí va el kiai)
        ("f07", "Con sus gallos.", 0.5),                                                    # plano 7
        ("f08", "Karate, contado escena a escena.", 0.4),                                   # plano 8
        ("f09", "¿Te quedas?", 0.0),                                                        # plano 9
    ],
}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pieza", default="2026-11-11-presentacion", choices=sorted(PIEZAS))
    ap.add_argument("--tomas", type=int, default=2, help="tomas por frase (para elegir la más natural)")
    ap.add_argument("--expresividad", type=float, default=0.5, help="exaggeration: 0.3 sobrio … 0.8 muy expresivo")
    ap.add_argument("--cfg", type=float, default=0.4, help="cfg_weight: más bajo = ritmo más pausado")
    ap.add_argument("--referencia", default=None, help="WAV de 10 s de la voz de Jorge (opcional)")
    ap.add_argument("--salida", default=str(Path.home() / "Videos" / "KarateEmaki"))
    a = ap.parse_args()

    import torch, torchaudio as ta
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS

    dev = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Cargando Chatterbox Multilingual en {dev} (la primera vez descarga ~3 GB)…", flush=True)
    model = ChatterboxMultilingualTTS.from_pretrained(device=dev)
    sr = model.sr

    out = Path(a.salida) / a.pieza / "voz-chatterbox"
    out.mkdir(parents=True, exist_ok=True)
    frases = PIEZAS[a.pieza]
    completa = []
    for fid, texto, pausa in frases:
        for k in range(1, a.tomas + 1):
            torch.manual_seed(1000 * k + int(fid[1:]))
            kw = dict(language_id="es", exaggeration=a.expresividad, cfg_weight=a.cfg)
            if a.referencia:
                kw["audio_prompt_path"] = a.referencia
            wav = model.generate(texto, **kw)
            f = out / f"{fid}-t{k}.wav"
            ta.save(str(f), wav.cpu(), sr)
            print(f"  {f.name}: {wav.shape[-1] / sr:.2f} s  «{texto}»", flush=True)
            if k == 1:
                completa += [wav.cpu(), torch.zeros(1, int(sr * pausa))]
    ta.save(str(out / "muestra-completa-t1.wav"), torch.cat(completa, dim=-1), sr)
    (out / "LEEME.txt").write_text(
        "Chatterbox Multilingual (Resemble AI, MIT). Voz de serie"
        + (" con referencia de Jorge" if a.referencia else "")
        + f". expresividad={a.expresividad} cfg={a.cfg} tomas={a.tomas}.\n"
        "fNN-tK.wav = frase NN, toma K. muestra-completa-t1.wav = toma 1 de todas con pausas.\n",
        encoding="utf-8")
    z = Path(a.salida) / f"{a.pieza}-voz-chatterbox.zip"
    with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(out.iterdir()):
            zf.write(p, p.name)
    print(f"\nListo. Escucha {out / 'muestra-completa-t1.wav'}\nSube al chat: {z}")

if __name__ == "__main__":
    sys.exit(main())
