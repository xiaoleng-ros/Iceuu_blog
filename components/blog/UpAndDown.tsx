import React from 'react'; 
import Link from 'next/link'; 

interface Info { 
    id: string; 
    title: string; 
    cover_image?: string;
    content?: string;
} 

interface Props { 
    id: string; 
    prev: Info | null; 
    next: Info | null; 
} 

/**
 * 从 Markdown 内容中提取第一张图片的 URL
 * @param {string} [content] - Markdown 内容
 * @returns {string | undefined} - 返回第一张图片的 URL 或 undefined
 */
const extractFirstImage = (content?: string): string | undefined => {
    if (!content) return undefined;
    // 匹配 Markdown 图片格式 ![alt](url) 或 HTML 图片格式 <img src="url" />
    const mdImgRegex = /!\[.*?\]\((.*?)\)/;
    const htmlImgRegex = /<img.*?src=["'](.*?)["']/;
    
    const mdMatch = content.match(mdImgRegex);
    if (mdMatch) return mdMatch[1];
    
    const htmlMatch = content.match(htmlImgRegex);
    if (htmlMatch) return htmlMatch[1];
    
    return undefined;
};

/**
 * 上一篇文章和下一篇文章导航组件
 * 提供博客文章详情页的快速跳转功能
 * @param {Props} props - 组件属性
 * @param {string} props.id - 当前文章 ID
 * @param {Info | null} props.prev - 上一篇文章信息
 * @param {Info | null} props.next - 下一篇文章信息
 * @returns {JSX.Element} - 返回导航组件 JSX
 */
const UpAndDown = ({ id, prev, next }: Props) => { 
    const baseBtnSty = 'group w-full border border-gray-200 transition-all duration-300 rounded-md overflow-hidden relative h-24 sm:h-28 flex flex-col items-center justify-center hover:shadow-md';
    
    /**
     * 渲染单个导航链接
     * @param {Info | null} item - 文章信息
     * @param {string} label - 按钮标签（上一篇/下一篇）
     * @returns {JSX.Element} - 返回链接 JSX
     */
    const renderLink = (item: Info | null, label: string) => {
        const firstImage = extractFirstImage(item?.content);
        const displayImage = item?.cover_image || firstImage;
        const hasImage = !!displayImage;
        
        return (
            <Link 
                href={item ? `/blog/${item.id}` : `/blog/${id}`} 
                className={`${baseBtnSty} ${!item ? 'pointer-events-none opacity-50' : 'hover:border-[#165DFF]'}`}
            >
                {/* 背景图片 */}
                {hasImage && (
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={displayImage} 
                            alt="" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors" />
                    </div>
                )}

                {/* 内容 */}
                <div className="relative z-10 w-full px-4 flex flex-col items-center justify-center text-center">
                    <p 
                        className={`w-full !text-center text-sm sm:text-base mb-0.5 sm:mb-1 transition-colors font-bold italic font-mono antialiased tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] ${hasImage ? '!text-white' : 'text-gray-800 dark:text-[#8c9ab1]'}`}
                        style={hasImage ? { color: '#ffffff' } : {}}
                    >
                        {label}
                    </p> 
                    <p 
                        className={`w-full !text-center text-base sm:text-lg font-bold truncate italic font-mono antialiased tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] ${hasImage ? '!text-white' : 'text-gray-400 group-hover:text-[#165DFF]'}`}
                        style={hasImage ? { color: '#ffffff' } : {}}
                    >
                        {item ? item.title : `没有${label}文章了~`}
                    </p>
                </div>
            </Link>
        );
    };

    return ( 
        <div className="mt-8"> 
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-6"> 
                {renderLink(prev, '上一篇')}
                {renderLink(next, '下一篇')}
            </div> 
        </div> 
    ); 
};

export default UpAndDown;
