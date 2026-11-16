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
    # v2 (16 nov 2026): una frase por plano, de final/locucion-v2.txt
    "2026-11-09-zenkutsu-estabilidad": [
        ("f01", "Empújame hacia delante. ¿Cuánto aguanto?", 0.3),                        # plano 1 (0,0 s)
        ("f02", "Mientras el punto rojo caiga sobre tus pies, aguantas.", 0.3),          # plano 2 (2,0 s)
        ("f03", "Pies juntos: ocho grados y fuera.", 0.4),                               # plano 3 (5,0 s)
        ("f04", "Zenkutsu dachi: un metro de base.", 0.4),                               # plano 4 (7,5 s)
        ("f05", "Hacia delante, aguantas unos veintiséis grados.", 0.4),                 # plano 5 (10,0 s)
        ("f06", "Baja la cadera: aún más.", 0.5),                                        # plano 6 (13,0 s)
        ("f07", "De lado, la base es estrecha.", 0.6),                                   # plano 7 (15,0 s)
        ("f08", "¿Por dónde me empujarías tú?", 0.0),                                    # plano 8 (17,7 s)
    ],
    "2026-11-09-nombre-shotokan": [
        ("f01", "Shotokan no es un estilo.", 0.3),                                       # 0,0 s
        ("f02", "Es una casa.", 0.4),                                                    # 1,6 s
        ("f03", "Funakoshi firmaba sus poemas como Shoto:", 0.3),                        # 3,2 s
        ("f04", "Olas de pino. Suena a mar.", 0.4),                                      # 5,4 s
        ("f05", "Y kan significa casa.", 0.4),                                           # 7,8 s
        ("f06", "En el treinta y nueve, levantan un doyo.", 0.4),                        # 9,8 s
        ("f07", "Cuentan que sus alumnos colgaron el cartel.", 0.4),                     # 12,6 s
        ("f08", "En el cuarenta y cinco, ardió.", 0.5),                                  # 15,4 s
        ("f09", "Funakoshi nunca bautizó su karate.", 0.4),                              # 17,8 s
        ("f10", "Y el mundo lo llamó Shotokan.", 0.4),                                   # 20,4 s
        ("f11", "Dices Shotokan, nombras una casa que ya no existe.", 0.0),              # 22,8 s
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
