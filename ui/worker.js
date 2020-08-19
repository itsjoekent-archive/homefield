import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler';

const DEBUG = process.env.NODE_ENV === 'production' ? false : true;

function makeErrorResponse(error) {
  if (DEBUG) {
    const debugErrorResponse = new Response(error.message || error.toString(), {
      status: 500,
    });

    return debugErrorResponse;
  }

  return new Response('Internal Error', { status: 500 });
}

addEventListener('fetch', function (event) {
  try {
    event.respondWith(handleEvent(event));
  } catch (error) {
    event.respondWith(makeErrorResponse(error));
  }
});

async function handleEvent(event) {
  const url = new URL(event.request.url);
  const options = {};

  try {
    if (DEBUG) {
      options.cacheControl = {
        bypassCache: true,
      };
    }

    return await getAssetFromKV(event, { ...options, mapRequestToAsset: serveSinglePageApp });
  } catch (error) {
    return makeErrorResponse(error);
  }
}
