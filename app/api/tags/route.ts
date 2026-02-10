import { NextResponse } from 'next/server';
import { supabase, createClientWithToken } from '@/lib/supabase';

export const runtime = 'edge';

/**
 * 获取全部标签列表
 * @returns {Promise<NextResponse>} - 返回标签数据数组
 */
export async function GET() {
  const { data, error } = await supabase.from('tags').select('*').order('name');
  if (error) {
    console.error('获取标签失败:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

/**
 * 创建新标签
 * @param {Request} request - 包含标签名称的请求对象
 * @returns {Promise<NextResponse>} - 返回新创建的标签数据
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

  const requestSupabase = createClientWithToken(token);
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: '用户信息验证失败' }, { status: 401 });

  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: '标签名称不能为空' }, { status: 400 });
    
    const { data, error } = await requestSupabase.from('tags').insert({ name }).select().single();
    
    if (error) {
      console.error('创建标签失败:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '服务器内部错误';
    console.error('创建标签异常:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
