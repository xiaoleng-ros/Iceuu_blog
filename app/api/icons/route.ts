import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/icons
 * 自动读取 public/svg 目录下的所有 .svg 文件
 */
export async function GET() {
  try {
    const svgDirectory = path.join(process.cwd(), 'public', 'svg');
    
    // 检查目录是否存在
    if (!fs.existsSync(svgDirectory)) {
      return NextResponse.json([]);
    }

    // 读取目录下所有文件
    const files = fs.readdirSync(svgDirectory);
    
    // 过滤出 .svg 文件
    const svgFiles = files.filter(file => file.toLowerCase().endsWith('.svg'));

    return NextResponse.json(svgFiles);
  } catch (error) {
    console.error('Failed to read icons directory:', error);
    return NextResponse.json({ error: 'Failed to read icons' }, { status: 500 });
  }
}
