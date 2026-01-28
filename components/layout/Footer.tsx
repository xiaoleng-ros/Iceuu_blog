import Image from 'next/image';

/**
 * 网站页脚组件
 * 仅显示小动物装饰图片，移除所有文本内容
 */
export default function Footer() {
  return (
    <footer className="mt-auto bg-white">
      <div className="w-full overflow-hidden select-none pointer-events-none">
        <Image 
          src="/animals.webp" 
          alt="Footer Animals" 
          width={1920} 
          height={300} 
          className="w-full h-auto transform translate-y-[1px]"
          priority
        />
      </div>
    </footer>
  );
}
