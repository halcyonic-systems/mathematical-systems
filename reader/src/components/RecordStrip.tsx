/**
 * The record's own identity, read before its material.
 *
 * A catalogue card leads with what identifies the record — accession,
 * citation, where it sits in the source, how well established it is, whether
 * the build could find it, who encoded it and when — one ledger header, every
 * field labelled, nothing floating. This replaces the entry's old standalone
 * "Provenance" section: encoded-by/on and the evidence grade are identifying
 * facts about the record, not a fourth thing to say about it further down the
 * page. Chrome throughout, so it wears the firewall rather than trusting
 * ambient inheritance.
 */
import type { ReactNode } from "react";

export function RecordField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="record-field">
      <p className="eyebrow record-field-label m-0">{label}</p>
      <div className="type-ui record-field-value">{children}</div>
    </div>
  );
}

export function RecordStrip({ children }: { children: ReactNode }) {
  return <div className="record-strip">{children}</div>;
}
