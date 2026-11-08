import { Schema } from 'mongoose';
import { AUDIENCE_SCOPES, MODELS, RECORD_DOCUMENT_KINDS } from './constants';
import { optionalRef, requiredRef } from './schema-helpers';

/** A categorised file attached to a profile (student, staff). The file's metadata lives in `documents`. */
export const attachedDocumentSchema = new Schema(
  {
    kind: { type: String, enum: RECORD_DOCUMENT_KINDS, required: true },
    document: requiredRef(MODELS.Document),
  },
  { _id: false },
);

/**
 * Who a notice or event is for. `all` means everyone; otherwise at least one target of the matching kind.
 * Targets are references, so renaming a class or deleting a role cannot leave stale copies behind.
 */
export const audienceSchema = new Schema(
  {
    scope: { type: String, enum: AUDIENCE_SCOPES, required: true, default: 'all' },
    roles: [optionalRef(MODELS.Role)],
    classes: [optionalRef(MODELS.Class)],
    sections: [optionalRef(MODELS.Section)],
  },
  { _id: false },
);

audienceSchema.pre('validate', function () {
  const scope = this.scope as (typeof AUDIENCE_SCOPES)[number];
  const lists = { roles: this.roles.length, classes: this.classes.length, sections: this.sections.length };

  if (scope === 'all') {
    if (lists.roles + lists.classes + lists.sections > 0) this.invalidate('scope', 'Audience "all" cannot list specific targets');
    return;
  }
  if (lists[scope] === 0) this.invalidate(scope, `Select at least one ${scope.slice(0, -1)} for this audience`);
  for (const other of ['roles', 'classes', 'sections'] as const) {
    if (other !== scope && lists[other] > 0) this.invalidate(other, `Only ${scope} may be listed for this audience`);
  }
});
