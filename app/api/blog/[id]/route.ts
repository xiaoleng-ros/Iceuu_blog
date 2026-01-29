import { NextResponse } from 'next/server';
import { createClientWithToken } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Use generic client first. If auth is present, upgrade.
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const requestSupabase = token ? createClientWithToken(token) : supabase;

  const { data, error } = await requestSupabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .or('is_deleted.is.null,is_deleted.eq.false')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // Verify user
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Category validation
    const ALLOWED_CATEGORIES = ['生活边角料', '情绪随笔', '干货分享', '成长复盘'];
    if (body.category && !ALLOWED_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}` 
      }, { status: 400 });
    }

    // Filter allowed fields to avoid errors with missing columns like 'slug'
    const allowedFields = [
      'title', 'content', 'excerpt', 'cover_image', 
      'category', 'tags', 'draft', 'images', 'is_deleted', 'deleted_at'
    ];
    
    const updateData: any = { updated_at: new Date().toISOString() };
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const { data, error } = await requestSupabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // Verify user
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Category validation
    const ALLOWED_CATEGORIES = ['生活边角料', '情绪随笔', '干货分享', '成长复盘'];
    if (body.category && !ALLOWED_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}` 
      }, { status: 400 });
    }

    // Filter allowed fields
    const allowedFields = [
      'title', 'content', 'excerpt', 'cover_image', 
      'category', 'tags', 'draft', 'images', 'is_deleted', 'deleted_at'
    ];
    
    const updateData: any = { updated_at: new Date().toISOString() };
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const { data, error } = await requestSupabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get('permanent') === 'true';
  const restore = searchParams.get('restore') === 'true';
  
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // Verify user
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (restore) {
    // Restore from trash
    const { error } = await requestSupabase
      .from('blogs')
      .update({ is_deleted: false, deleted_at: null })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Restored' });
  }

  if (permanent) {
    // Permanent delete
    const { error } = await requestSupabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Soft delete (move to trash)
    const { error } = await requestSupabase
      .from('blogs')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
