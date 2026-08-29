"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

interface CardMarkdownProps {
    children: string
    className?: string
    rehypePlugins?: any[]
    customComponents?: Partial<Components>
}

/**
 * 统一的卡牌 Markdown 渲染组件
 *
 * 颜色方案：
 * - **粗体** → text-gray-800（深灰加粗 #1F2937）
 * - *直角引号* → 「text-amber-900」（琥珀色，使用直角引号包裹）
 * - ***重要*** → text-amber-800（琥珀色加粗 #92400E）
 */
function sanitizeMarkdownText(text: string): string {
    if (!text) return ""
    return text
        .replace(/\*\*\s*([^\*]+?)\s*\*\*/g, '**$1**')
        .replace(/\*\*\s+/g, '**')
        .replace(/\s+\*\*/g, '**')
}

export function CardMarkdown({ children, className = "", rehypePlugins, customComponents }: CardMarkdownProps) {
    // 默认组件配置
    const defaultComponents: Components = {
        p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-outside list-disc pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-outside list-decimal pl-5">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        strong: ({ children }) => {
            // 检查子节点类型
            const childArray = React.Children.toArray(children);
            const hasEmElement = childArray.some(
                child => React.isValidElement(child) && typeof child.type === 'function' && child.type.name === 'em'
            );

            if (hasEmElement) {
                // *** 情况：琥珀色加粗
                return <strong className="font-black text-amber-500">{children}</strong>;
            }
            // ** 情况：加粗并继承当前主题颜色，确保深浅色清晰可见
            return <strong className="font-black text-inherit underline-offset-2">{children}</strong>;
        },
        em: ({ children }) => {
            const childArray = React.Children.toArray(children);
            const hasStrongElement = childArray.some(
                child => React.isValidElement(child) && typeof child.type === 'function' && child.type.name === 'strong'
            );

            if (hasStrongElement) {
                // *** 的情况：em 包含 strong，琥珀色加粗
                const extractText = (child: any): string => {
                    if (typeof child === 'string') return child;
                    if (React.isValidElement(child) && (child.props as any).children) {
                        return React.Children.toArray((child.props as any).children).map(extractText).join('');
                    }
                    return '';
                };
                const textContent = childArray.map(extractText).join('');
                return <span className="font-black text-amber-500">{textContent}</span>;
            }
            // * 情况：直角引号
            return <span>「{children}」</span>;
        },
    };

    // 合并自定义组件配置
    const mergedComponents = customComponents
        ? { ...defaultComponents, ...customComponents }
        : defaultComponents;

    const cleanedText = typeof children === 'string' ? sanitizeMarkdownText(children) : children;

    return (
        <div className={className}>
            <ReactMarkdown
                components={mergedComponents}
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={rehypePlugins}
            >
                {cleanedText}
            </ReactMarkdown>
        </div>
    );
}
