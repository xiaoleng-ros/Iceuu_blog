import { NextResponse } from 'next/server';
import { supabase, createClientWithToken } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const { data, error } = await supabase
    .from('site_config')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform to object for easier consumption
  const config = data.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return NextResponse.json({ data: config });
}

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

  try {
    const body = await request.json();
    
    // Upsert each key-value pair
    const upserts = Object.entries(body)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({
        key,
        value: String(value),
      }));

    if (upserts.length === 0) {
      return NextResponse.json({ success: true, message: 'No changes to save' });
    }

    const { error } = await requestSupabase
      .from('site_config')
      .upsert(upserts, { onConflict: 'key' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 清除首页缓存，确保背景更新立即生效
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
