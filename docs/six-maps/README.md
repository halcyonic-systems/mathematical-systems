# Six maps

`six-maps.pdf` (source `six-maps.tex`): the six directed maps between the Klir, Bunge and Mobus definitions of system, as propositions with proofs or proof sketches. Each result is tagged with its status: proved in Lean, proved in the note, or open.

It fixes the relational reading of Klir's Eq. (1.1) (R ⊆ T × T) for the six results, and sketches the product reading (R ⊆ ∏ Xᵢ, Mesarović/Joslyn) in §7. The two readings, and Klir's Chapter 2 examples that use both, are in §1.

§8 records what each author says the definition is for, quoted from Klir 2001, Mesarović and Takahara 1975, Bunge 1974–1979 and Mobus 2022, and restates losslessness relative to the invariant each purpose fixes: the realist content does not survive the map into Klir's relation, and the product reading's constraint does not survive the map to relations among things.

Lean citations are at `systems-science-foundations` commit `6ab7aba`. Results tagged *proof here* are not yet in Lean.

Build: `latexmk -pdf six-maps.tex`, then `latexmk -c`.
