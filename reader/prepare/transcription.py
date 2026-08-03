"""Locate each entry's verbatim in the primary text, and pull its context.

WHY THIS EXISTS: `atlas:HVP` means "a human read the primary source and confirmed
the verbatim against it". That is an assertion by the encoder. The vault carries
the full text of every source the catalogue cites, so the assertion can be
CHECKED -- turning an evidence code into something the build verifies rather than
something the reader takes on trust. Same move as the two-variant reasoning gate:
a claim the artefact makes about itself, tested.

WHY IT IS NOT A STRING COMPARISON: the vault's editions are digitisations, and
they disagree with the printed page in ways that are not transcription errors.

  Bunge is LaTeX:  \\(\\sigma=\\langle C, E, S\\rangle\\)   \\(C \\cap E=\\varnothing\\)
  the atlas is Unicode:  σ = ⟨C, E, S⟩              C ∩ E = ∅
  Klir carries OCR furniture: code fences, italic underscores, and a running
  page header ("What Is Systems Science? 5") dropped INTO the middle of a
  sentence.

Both transcriptions are faithful to the book and neither is byte-equal to the
other. So the comparison normalises notation and layout on both sides, and every
match REPORTS what it had to ignore. A gate that quietly normalises until things
match proves nothing; the `normalisations` field is what keeps this honest.
"""

import re
import unicodedata

# LaTeX commands that appear in these editions, and the character each denotes.
# Deliberately explicit: a generic \\command -> guess would silently equate things
# that are not equal.
LATEX = {
    r"\sigma": "σ", r"\Sigma": "Σ", r"\Theta": "Θ", r"\theta": "θ",
    r"\langle": "⟨", r"\rangle": "⟩",
    r"\cap": "∩", r"\cup": "∪", r"\varnothing": "∅", r"\emptyset": "∅",
    r"\subseteq": "⊆", r"\subset": "⊂", r"\supseteq": "⊇",
    r"\in": "∈", r"\notin": "∉", r"\neq": "≠", r"\leq": "≤", r"\geq": "≥",
    r"\times": "×", r"\vdash": "⊢", r"\exists": "∃", r"\forall": "∀",
    r"\vee": "∨", r"\wedge": "∧", r"\sqsubset": "⊏", r"\triangleright": "▷",
    r"\mid": "|", r"\prime": "′", r"\ldots": "…", r"\cdot": "·",
}
SCRIPT = {"C": "𝒞", "E": "ℰ", "S": "𝒮", "B": "𝔅", "N": "𝒩", "A": "𝒜", "L": "ℒ", "T": "𝒯"}

# Running heads and page numbers the digitisation drops mid-sentence.
MATH_TIGHT = set("=∩∪⊆⊂⊃∈∉≠×⟨⟩⊢∅")
# Stripping \( \) delimiters leaves "E ." where the page reads "E." — spacing
# against punctuation is likewise typography, not content.
CLOSE_TIGHT = set(".,;:!?)")

PAGE_FURNITURE = re.compile(r"^\s*(What Is Systems Science\?|Chapter \d+|\d+)\s*$", re.M)


MARKDOWN_IMAGE = re.compile(r"!\[[^\]]*\]\([^)]*\)")


def delatex(text):
    """LaTeX math -> the Unicode the printed page shows."""
    text = MARKDOWN_IMAGE.sub(" ", text)
    text = re.sub(r"\\mathscr\{([A-Z])\}", lambda m: SCRIPT.get(m.group(1), m.group(1)), text)
    text = re.sub(r"\\(left|right|,|;|!|quad|qquad)\b", " ", text)
    for cmd, char in sorted(LATEX.items(), key=lambda kv: -len(kv[0])):
        text = text.replace(cmd, char)
    text = re.sub(r"\\[a-zA-Z]+", " ", text)          # any command we did not name
    text = text.replace(r"\(", " ").replace(r"\)", " ").replace("$", " ")
    text = re.sub(r"\\([|&,;:!#%_ ])", r"\1", text)   # escaped delimiters
    text = re.sub(r"\\\\", " ", text)                    # line breaks
    return re.sub(r"[{}]", "", text)


def canon(text):
    """Everything that must not count as a difference: layout, emphasis, quotes."""
    text = unicodedata.normalize("NFKC", text)
    text = PAGE_FURNITURE.sub(" ", text)
    text = text.replace("```", " ").replace("`", " ")
    text = re.sub(r"[_*]", "", text)                   # markdown emphasis
    text = text.replace("\u2019", "'").replace("\u2018", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = re.sub(r"[\u2010-\u2015]", "-", text)       # dash family
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s*([" + re.escape("".join(MATH_TIGHT)) + r"])\s*", r"\1", text)
    text = re.sub(r"\s+([" + re.escape("".join(CLOSE_TIGHT)) + r"])", r"\1", text)
    text = re.sub(r"\(\s+", "(", text)
    return text.strip().lower()


def prepare_source(raw):
    """The source as a searchable string, plus a map back to raw offsets.

    Canonicalisation deletes and rewrites characters, so an offset in the
    canonical string does not point anywhere in the file. The index is built
    character by character to keep the correspondence, which is what lets the
    context view quote the ORIGINAL text rather than the normalised one.
    """
    latexed = delatex(raw)
    out, index = [], []
    prev_space = True
    for i, ch in enumerate(latexed):
        c = unicodedata.normalize("NFKC", ch)
        if c in "_*`{}" or c in "\u201c\u201d":
            continue
        if c.isspace():
            if prev_space:
                continue
            out.append(" ")
            index.append(i)
            prev_space = True
            continue
        prev_space = False
        for sub in c:
            sub = {"\u2019": "'", "\u2018": "'"}.get(sub, sub)
            if "\u2010" <= sub <= "\u2015":
                sub = "-"
            out.append(sub.lower())
            index.append(i)   # every char of an expanded ligature maps to its source char

    # LaTeX sets operator spacing itself, so the source reads "σ=⟨C,E,S⟩" where
    # the printed page -- and therefore the transcription -- reads "σ = ⟨C, E, S⟩".
    # Whitespace touching an operator is typography, not content. Dropped from
    # `out` and `index` in lockstep so raw offsets stay correct.
    keep_out, keep_index = [], []
    for j, c in enumerate(out):
        if c == " ":
            before = keep_out[-1] if keep_out else ""
            after = out[j + 1] if j + 1 < len(out) else ""
            if before in MATH_TIGHT or after in MATH_TIGHT:
                continue
            if after in CLOSE_TIGHT or before == "(":
                continue
        keep_out.append(c)
        keep_index.append(index[j])
    return "".join(keep_out), keep_index, latexed


def for_display(text):
    """The source passage as prose, with the digitisation's markup taken off.

    Emphasis underscores, code fences and stray backslashes are artefacts of how
    the book was scanned, not of how it was printed. Stripping them is cleaning a
    RENDERING of the source -- distinct from the atlas verbatim, which is a
    transcription and is never touched.
    """
    text = re.sub(r"`+", " ", text)
    text = re.sub(r"(?<=\w)_(?=\W)|(?<=\W)_(?=\w)|^_|_$", "", text)
    text = text.replace("_", " ").replace("*", "")
    text = re.sub(r"\\(?=[a-zA-Z|])", " ", text)
    return re.sub(r"[ \t]{2,}", " ", text).strip()


# How much of the book a published page may quote around a definition, per side.
# Chosen so the surround reaches Klir's ordered-books example -- the separating
# instance against Bunge sits roughly 500 characters past eq. (1.1) -- while
# staying short quotation for criticism and comment, with full citation.
PUBLISHABLE_CONTEXT = 800


# The budget is a target, not a cut. Quoting "we obtain a system si" helps nobody
# and reads as carelessness; a quotation ends where a sentence ends. Up to this
# many characters of overrun are allowed to reach the stop.
SENTENCE_OVERRUN = 160
SENTENCE_END = re.compile(r"[.!?]['\")\]]?\s")


def _close_at_sentence(text, start, budget):
    window = text[start : start + budget + SENTENCE_OVERRUN]
    ends = [m.end() for m in SENTENCE_END.finditer(window)]
    past = [e for e in ends if e >= budget]
    return window[: past[0]] if past else (window[:budget] if ends else window)


def _open_at_sentence(text, end, budget):
    window = text[max(0, end - budget - SENTENCE_OVERRUN) : end]
    starts = [m.end() for m in SENTENCE_END.finditer(window)]
    early = [s for s in starts if len(window) - s <= budget]
    return window[early[0] :] if early else window[-budget:]


def locate(verbatim, raw, probe_len=120, context_chars=PUBLISHABLE_CONTEXT):
    """Find `verbatim` in `raw`. Returns a verdict, never a bare boolean."""
    hay, index, latexed = prepare_source(raw)
    needle = canon(verbatim)
    if not needle:
        return {"status": "no-verbatim"}

    notes = []
    if delatex(raw) != raw:
        notes.append("LaTeX math in source rendered to Unicode")
    if PAGE_FURNITURE.search(raw):
        notes.append("running heads / page numbers removed")
    notes.append("whitespace around operators ignored")

    pos = hay.find(needle)
    matched = len(needle)
    if pos == -1:
        # The whole passage is not contiguous in this edition (a page break, a
        # figure, a footnote can split it). Fall back to the opening probe so the
        # report can say WHERE it diverges instead of only that it did.
        probe = needle[:probe_len]
        pos = hay.find(probe)
        matched = len(probe) if pos != -1 else 0
        if pos == -1:
            return {"status": "not-found", "normalisations": notes}
        status = "partial"
    else:
        status = "located"

    start_raw = index[pos]
    end_raw = index[min(pos + matched - 1, len(index) - 1)] + 1
    return {
        "status": status,
        "normalisations": notes,
        "matchedChars": matched,
        "verbatimChars": len(needle),
        "context": {
            "before": for_display(_open_at_sentence(latexed, start_raw, context_chars)),
            "match": for_display(latexed[start_raw:end_raw]),
            "after": for_display(_close_at_sentence(latexed, end_raw, context_chars)),
        },
    }
