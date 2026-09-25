/**
 * api.js — Qutrub API client
 * Wraps fetch calls to /ajaxGet. Guards against stale responses.
 */

let _requestId = 0;

/**
 * Conjugate a verb via POST /ajaxGet.
 * Returns { data, requestId } so callers can discard stale responses.
 *
 * @param {Object} params
 * @param {string}  params.text
 * @param {boolean} params.all
 * @param {boolean} params.transitive
 * @param {boolean} params.past
 * @param {boolean} params.future
 * @param {boolean} params.imperative
 * @param {boolean} params.passive
 * @param {boolean} params.future_moode
 * @param {boolean} params.confirmed
 * @param {string}  params.future_type   e.g. "فتحة" | "ضمة" | "كسرة"
 * @returns {Promise<{data: Object, id: number}>}
 */
export async function conjugate(params) {
  const id = ++_requestId;
  const body = {
    data: {
      action: 'Conjugate',
      text:          params.text         ?? '',
      all:           params.all          ?? true,
      transitive:    params.transitive   ?? true,
      past:          params.past         ?? false,
      future:        params.future       ?? false,
      imperative:    params.imperative   ?? false,
      passive:       params.passive      ?? false,
      future_moode:  params.future_moode ?? false,
      confirmed:     params.confirmed    ?? false,
      future_type:   params.future_type  ?? 'فتحة',
    },
  };

  const res = await fetch('/ajaxGet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return { data, id };
}

/**
 * Fetch a random verb text.
 * @returns {Promise<string>}
 */
export async function getRandomVerb() {
  const res = await fetch('/ajaxGet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { response_type: 'get_random_text' } }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.text ?? '';
}

/** Returns the last issued request ID (for stale-response checks). */
export function currentRequestId() {
  return _requestId;
}
