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
 * 颜色与排版规范：
 * - ***标题/重要特性*** → 琥珀金加粗 + 直角引号包裹
 * - **常规加粗** → 琥珀金加粗
 * - *斜体/强调* → 直角引号「...」包裹
 */
function sanitizeMarkdownText(text: string): string {
    if (!text) return ""

    let processed = text

    // 1. 优先处理三连星号 ***内容*** (必须优先于双星号处理，避免被误伤拆散)
    // 并在闭合 *** 后若紧跟非空格非标点字符时补充空格，帮助 CommonMark 正确识别 delimiter 闭合
    processed = processed.replace(/\*{3,}\s*([^\*]+?)\s*\*{3,}/g, (match, content) => {
        return `***${content.trim()}*** `
    })

    // 2. 处理双连星号 **内容**
    processed = processed.replace(/\*{2}\s*([^\*]+?)\s*\*{2}/g, (match, content) => {
        return `**${content.trim()}**`
    })

    // 3. 处理单星号 *内容*
    processed = processed.replace(/(?<!\*)\*\s*([^\*]+?)\s*\*(?!\*)/g, (match, content) => {
        return `*${content.trim()}*`
    })

    return processed
}

export function CardMarkdown({ children, className = "", rehypePlugins, customComponents }: CardMarkdownProps) {
    // 默认组件配置
    const defaultComponents: Components = {
        p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-outside list-disc pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-outside list-decimal pl-5">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        strong: ({ children }) => {
            return <strong className="font-black text-amber-600 dark:text-amber-400">{children}</strong>;
        },
        em: ({ children }) => {
            return <span className="font-bold text-amber-600 dark:text-amber-400">「{children}」</span>;
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
