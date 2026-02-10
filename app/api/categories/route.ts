import { NextResponse } from 'next/server';
import { supabase, createClientWithToken } from '@/lib/supabase';

/**
 * 获取全部分类列表
 * @returns {Promise<NextResponse>} - 返回分类数据数组
 */
export async function GET() {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) {
    console.error('获取分类失败:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

/**
 * 创建新分类
 * @param {Request} request - 包含分类名称的请求对象
 * @returns {Promise<NextResponse>} - 返回新创建的分类数据
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
    if (!name) return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });

    const { data, error } = await requestSupabase.from('categories').insert({ name }).select().single();
    
    if (error) {
      console.error('创建分类失败:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '服务器内部错误';
    console.error('创建分类异常:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
