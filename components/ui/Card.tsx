import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * 通用卡片容器组件
 * @param {React.HTMLAttributes<HTMLDivElement>} props - 组件属性
 * @param {React.Ref<HTMLDivElement>} ref - 转发的引用
 * @returns {JSX.Element} - 返回卡片容器 JSX
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * 卡片头部组件
 * @param {React.HTMLAttributes<HTMLDivElement>} props - 组件属性
 * @param {React.Ref<HTMLDivElement>} ref - 转发的引用
 * @returns {JSX.Element} - 返回卡片头部 JSX
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * 卡片标题组件
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - 组件属性
 * @param {React.Ref<HTMLParagraphElement>} ref - 转发的引用
 * @returns {JSX.Element} - 返回卡片标题 JSX
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * 卡片内容区组件
 * @param {React.HTMLAttributes<HTMLDivElement>} props - 组件属性
 * @param {React.Ref<HTMLDivElement>} ref - 转发的引用
 * @returns {JSX.Element} - 返回卡片内容区 JSX
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * 卡片底部组件
 * @param {React.HTMLAttributes<HTMLDivElement>} props - 组件属性
 * @param {React.Ref<HTMLDivElement>} ref - 转发的引用
 * @returns {JSX.Element} - 返回卡片底部 JSX
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardContent }
