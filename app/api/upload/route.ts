import { NextResponse } from 'next/server';
import { createClientWithToken } from '@/lib/supabase';
import { uploadImageToGitHub, getJsDelivrUrl, deleteFileFromGitHub } from '@/lib/github';

export const runtime = 'edge';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let filePath = '';
  let uploadedToGithub = false;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'other'; // avatar, post, site
    const contextId = formData.get('contextId') as string; // e.g. articleId

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('base64');

    // Generate path based on type
    const ext = file.name.split('.').pop() || 'jpg';
    const uuid = crypto.randomUUID();
    
    const date = new Date();
    // YYYYMMDD
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    switch (type) {
      case 'avatar':
        // avatars/[user_uuid].[ext]
        // Note: This overwrites if extension is same. If different, we might have multiple.
        // But for now, following the requirement to use user_uuid.
        filePath = `avatars/${user.id}.${ext}`;
        break;
      case 'post':
        // posts/[article_id]-[date]/[uuid].[ext]
        // If contextId (articleId) is missing, use 'draft'
        const articlePart = contextId || 'draft';
        filePath = `posts/${articlePart}-${dateStr}/${uuid}.${ext}`;
        break;
      case 'site':
        // site/[uuid].[ext]
        filePath = `site/${uuid}.${ext}`;
        break;
      default:
        // others/[date]/[uuid].[ext]
        filePath = `others/${dateStr}/${uuid}.${ext}`;
        break;
    }

    // Upload to GitHub
    await uploadImageToGitHub(content, filePath, `Upload ${type} image: ${filePath}`);
    uploadedToGithub = true;
    
    // Get CDN URL
    const url = getJsDelivrUrl(filePath);

    // Save to Media table
    let { data: mediaData, error: dbError } = await requestSupabase
      .from('media')
      .insert({
        filename: file.name,
        url,
        path: filePath,
        size: file.size,
        type,
      })
      .select()
      .single();

    // Compatibility Fallback: If type check fails (e.g. 'site' or 'post' not allowed), try fallback
    if (dbError && dbError.message.includes('media_type_check')) {
      console.warn(`Database constraint violation for type '${type}'. Attempting fallback...`);
      let fallbackType = 'other';
      if (type === 'post') fallbackType = 'blog'; // 'blog' is in the old schema
      
      const { data: retryData, error: retryError } = await requestSupabase
        .from('media')
        .insert({
          filename: file.name,
          url,
          path: filePath,
          size: file.size,
          type: fallbackType,
        })
        .select()
        .single();
        
      if (!retryError) {
        mediaData = retryData;
        dbError = null; // Clear error
      } else {
        // If fallback also fails, keep the original error (or the new one)
        console.error('Fallback insert failed:', retryError);
      }
    }

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      throw new Error(`Failed to save media record: ${dbError.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        url,
        id: mediaData.id 
      }
    });

  } catch (e: any) {
    console.error('Upload error:', e);
    
    // If we uploaded to GitHub but failed subsequently (DB error or other), rollback
    if (uploadedToGithub && filePath) {
      try {
        await deleteFileFromGitHub(filePath, 'Rollback: Upload failed');
        console.info(`Rolled back file ${filePath} from GitHub due to error`);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }

    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
  }
}
