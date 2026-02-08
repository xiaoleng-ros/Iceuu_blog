import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * 通用标签组件
 * @param {React.LabelHTMLAttributes<HTMLLabelElement>} props - 组件属性
 * @param {React.Ref<HTMLLabelElement>} ref - 转发的引用
 * @returns {JSX.Element} - 返回标签组件 JSX
 */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
