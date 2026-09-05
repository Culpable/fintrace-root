import assert from 'node:assert/strict';
import test from 'node:test';

import { handleNegotiatedDocument } from '../src/lib/agent-readable-http/shared.ts';


test('Markdown negotiation does not apply an HTML validator to the selected representation', async () => {
  const request = new Request('https://example.com/', {
    headers: {
      accept: 'text/markdown',
      'if-none-match': '"html-validator"',
    },
  });
  let publicAssetRequest: Request | undefined;

  const response = await handleNegotiatedDocument({
    request,
    fetchPublicAsset: async (assetRequest) => {
      publicAssetRequest = assetRequest;
      if (assetRequest.headers.get('if-none-match') === '"html-validator"') {
        return new Response(null, { status: 304, headers: { etag: '"html-validator"' } });
      }
      return new Response('<!doctype html><title>Home</title>', { status: 200 });
    },
    fetchInternalAsset: async () => new Response('# Home\n', { status: 200 }),
  });

  assert.equal(publicAssetRequest?.headers.get('if-none-match'), null);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(await response.text(), '# Home\n');
});


test('HTML negotiation preserves conditional request handling for the HTML representation', async () => {
  const request = new Request('https://example.com/', {
    headers: {
      accept: 'text/html',
      'if-none-match': '"html-validator"',
    },
  });

  const response = await handleNegotiatedDocument({
    request,
    fetchPublicAsset: async (assetRequest) => {
      assert.equal(assetRequest.headers.get('if-none-match'), '"html-validator"');
      return new Response(null, { status: 304, headers: { etag: '"html-validator"' } });
    },
    fetchInternalAsset: async () => {
      assert.fail('HTML negotiation must not fetch the internal Markdown asset.');
    },
  });

  assert.equal(response.status, 304);
  assert.equal(response.headers.get('etag'), '"html-validator"');
  assert.equal(await response.text(), '');
});


test('Markdown negotiation preserves an empty public redirect without fetching Markdown', async () => {
  const request = new Request('https://example.com/engagement', {
    headers: { accept: 'text/markdown' },
  });
  let internalFetchCount = 0;

  const response = await handleNegotiatedDocument({
    request,
    fetchPublicAsset: async () => new Response(null, {
      status: 307,
      headers: { location: '/engagement/' },
    }),
    fetchInternalAsset: async () => {
      internalFetchCount += 1;
      return new Response('# Pricing\n', { status: 200 });
    },
  });

  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), '/engagement/');
  assert.equal(await response.text(), '');
  assert.equal(internalFetchCount, 0);
});
