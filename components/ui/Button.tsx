import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

/**
 * 通用按钮组件
 * 采用日系动漫风格设计，柔和渐变与梦幻光影
 * @param {ButtonProps} props - 按钮属性
 * @param {string} [props.variant] - 样式变体: 'default' | 'outline' | 'ghost' | 'danger'
 * @param {string} [props.size] - 尺寸变体: 'default' | 'sm' | 'lg' | 'icon'
 * @param {React.Ref<HTMLButtonElement>} ref - 转发的引用
 * @returns {JSX.Element} - 返回按钮组件 JSX
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB6E8]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
          {
            'bg-gradient-to-r from-[#7EB6E8] to-[#5A9BD5] text-white hover:shadow-lg hover:shadow-[#7EB6E8]/25 active:scale-[0.98]': variant === 'default',
            'border border-[#E8E8E8] bg-white/50 backdrop-blur-sm hover:bg-white hover:text-[#7EB6E8] hover:border-[#7EB6E8]/30': variant === 'outline',
            'hover:bg-[#7EB6E8]/10 hover:text-[#7EB6E8]': variant === 'ghost',
            'bg-gradient-to-r from-[#FF9B9B] to-[#FF7B7B] text-white hover:shadow-lg hover:shadow-[#FF9B9B]/25 active:scale-[0.98]': variant === 'danger',
            'h-10 px-5 py-2': size === 'default',
            'h-9 rounded-xl px-4 text-xs': size === 'sm',
            'h-12 rounded-xl px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
