import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

/**
 * 通用输入框组件
 * 采用日系动漫风格设计，柔和边框与梦幻光影
 * @param {InputProps} props - 输入框属性
 * @param {React.Ref<HTMLInputElement>} ref - 转发的引用
 * @returns {JSX.Element} - 返回输入框组件 JSX
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[#E8E8E8] bg-white/50 backdrop-blur-sm px-4 py-2 text-sm text-[#4A4A4A] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#B0B0B0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB6E8]/20 focus-visible:border-[#7EB6E8] focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
