import { Environment } from '@/types/common';

export const storageRouter = async (request: Request, env: Environment): Promise<Response> => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  try {
    // GET /api/storage/:folder/:filename - Serve file from R2
    if (method === 'GET' && segments[0] === 'api' && segments[1] === 'storage') {
      // Extract the full path after /api/storage/
      const key = segments.slice(2).join('/');
      
      if (!key) {
        return new Response(JSON.stringify({ success: false, message: 'File key is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get file from R2
      const object = await env.STORAGE.get(key);

      if (!object) {
        return new Response(JSON.stringify({ success: false, message: 'File not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Return the file with appropriate headers
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('cache-control', 'public, max-age=31536000'); // Cache for 1 year

      return new Response(object.body, { headers });
    }

    return new Response(JSON.stringify({ success: false, message: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in storage router:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
