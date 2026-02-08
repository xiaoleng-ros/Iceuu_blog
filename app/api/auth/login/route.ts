import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * 处理用户登录请求
 * @param {Request} request - 请求对象，包含 email 和 password
 * @returns {Promise<NextResponse>} - 返回登录结果，成功则包含用户和会话信息
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码是必填项' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
