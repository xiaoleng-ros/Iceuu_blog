import { NextResponse } from 'next/server';
import { createClientWithToken } from '@/lib/supabase';

/**
 * 处理获取后台管理密码的 GET 请求
 * 从 site_config 表中获取配置的密码
 * @param {Request} request - 请求对象
 * @returns {Promise<NextResponse>} - 返回包含密码的 JSON 数据
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const supabase = createClientWithToken(token);
  
  // 验证用户身份，确保只有已登录管理员可以访问
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '用户信息验证失败' }, { status: 401 });
  }

  try {
    // 从 site_config 获取 admin_password 配置项
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 表示未找到记录
      return NextResponse.json({ error: '获取密码失败: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      password: data?.value || '',
      success: true 
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    console.error('获取密码异常:', err);
    return NextResponse.json({ error: '数据获取异常: ' + message }, { status: 500 });
  }
}

/**
 * 处理密码修改相关的 POST 请求
 * 同步更新 Supabase Auth 密码和 site_config 表中的备用密码
 * @param {Request} request - 包含 currentPassword 和 newPassword 的请求对象
 * @returns {Promise<NextResponse>} - 返回操作结果
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
    return NextResponse.json({ error: '用户信息验证失败' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '当前密码和新密码不能为空' }, { status: 400 });
    }

    if (!user.email) {
      return NextResponse.json({ error: '用户邮箱不存在' }, { status: 400 });
    }

    // 1. 验证旧密码是否正确
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: '当前密码错误' }, { status: 400 });
    }

    // 2. 更新 Supabase Auth 系统的密码
    const { error: updateAuthError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateAuthError) {
      return NextResponse.json({ error: '身份验证更新失败: ' + updateAuthError.message }, { status: 500 });
    }

    // 3. 同步更新 site_config 中的 admin_password（用于非 Auth 场景或展示）
    const { error: updateConfigError } = await supabase
      .from('site_config')
      .upsert({ key: 'admin_password', value: newPassword }, { onConflict: 'key' });

    if (updateConfigError) {
      console.warn('site_config 密码同步失败:', updateConfigError.message);
      // 注意：Auth 密码已更新，即使配置表同步失败也算核心成功
    }

    return NextResponse.json({ success: true, message: '密码更新成功' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    console.error('更新密码异常:', err);
    return NextResponse.json({ error: '更新密码异常: ' + message }, { status: 500 });
  }
}
