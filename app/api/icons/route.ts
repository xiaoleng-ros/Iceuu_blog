import { NextResponse } from 'next/server';

const SVG_ICONS = [
  '34 - Adobe Premiere Pro (Flat).svg',
  'Angular.svg',
  'Docker.svg',
  'JavaScript.svg',
  'MYSQL.svg',
  'Node.js.svg',
  'Pycharm.svg',
  'Python.svg',
  'QQ.svg',
  'React.svg',
  'Vue.svg',
  'adobe after-effects.svg',
  'apifox.svg',
  'clash.svg',
  'css.svg',
  'gemini-ai.svg',
  'gitee.svg',
  'github.svg',
  'html.svg',
  'icons8-intellij-idea.svg',
  'java.svg',
  'nginx.svg',
  'postman.svg',
  'splayer.svg',
  'spring-boot.svg',
  'supabase.svg',
  'typescript.svg',
  'vscode.svg',
  'webstorm.svg',
  'weixin.svg',
  '传输.svg',
  '剪映.svg',
  '抖音.svg',
  '网易云音乐.svg',
  '羽毛球.svg'
];

export async function GET() {
  return NextResponse.json(SVG_ICONS);
}
