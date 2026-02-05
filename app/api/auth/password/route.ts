import { NextResponse } from 'next/server';
import { createClientWithToken } from '@/lib/supabase';

export const runtime = 'edge';

/**
 * 获取当前用户的真实密码（从 site_config 表）
 * @param request 请求对象
 * @returns 包含密码的数据或错误信息
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const supabase = createClientWithToken(token);
  
  // 验证用户身份
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    // 从 site_config 获取密码
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return NextResponse.json({ error: '数据库连接失败' }, { status: 500 });
    }

    return NextResponse.json({ 
      password: data?.value || '',
      success: true 
    });
  } catch (err: any) {
    return NextResponse.json({ error: '数据获取异常: ' + err.message }, { status: 500 });
  }
}

/**
 * 更新用户密码（同步更新 Supabase Auth 和 site_config 表）
 * @param request 请求对象
 * @returns 成功或错误信息
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const supabase = createClientWithToken(token);
  
  // 验证用户身份
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '密码不能为空' }, { status: 400 });
    }

    // 1. 验证旧密码
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: '当前密码错误' }, { status: 400 });
    }

    // 2. 更新 Supabase Auth 密码
    const { error: updateAuthError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateAuthError) {
      return NextResponse.json({ error: '身份验证更新失败: ' + updateAuthError.message }, { status: 500 });
    }

    // 3. 同步更新 site_config 中的 admin_password
    const { error: updateConfigError } = await supabase
      .from('site_config')
      .upsert({ key: 'admin_password', value: newPassword }, { onConflict: 'key' });

    if (updateConfigError) {
      return NextResponse.json({ error: '配置同步失败: ' + updateConfigError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '密码已成功更新并同步' });
  } catch (err: any) {
    return NextResponse.json({ error: '服务器处理异常: ' + err.message }, { status: 500 });
  }
}
