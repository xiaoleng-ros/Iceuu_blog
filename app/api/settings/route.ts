import { NextResponse } from 'next/server';
import { supabase, createClientWithToken } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * 处理获取系统配置的 GET 请求
 * @returns {Promise<NextResponse>} - 返回所有配置项的对象格式
 */
export async function GET() {
  const { data, error } = await supabase
    .from('site_config')
    .select('*');

  if (error) {
    console.error('获取系统配置失败:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 将数组转换为键值对对象格式，方便前端消费
  const config = data.reduce((acc: Record<string, string>, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return NextResponse.json({ data: config });
}

/**
 * 处理保存系统配置的 POST 请求
 * @param {Request} request - 包含配置项键值对的请求对象
 * @returns {Promise<NextResponse>} - 返回操作结果
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // 验证管理员身份
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '用户信息验证失败' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // 将提交的对象转换为 upsert 要求的数组格式
    const upserts = Object.entries(body)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({
        key,
        value: String(value),
      }));

    if (upserts.length === 0) {
      return NextResponse.json({ success: true, message: '没有需要保存的更改' });
    }

    const { error } = await requestSupabase
      .from('site_config')
      .upsert(upserts, { onConflict: 'key' });

    if (error) {
      console.error('保存系统配置失败:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 清除首页缓存，确保背景、站点标题等更新立即生效
    revalidatePath('/');

    return NextResponse.json({ success: true, message: '配置保存成功' });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '服务器内部错误';
    console.error('保存配置异常:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
