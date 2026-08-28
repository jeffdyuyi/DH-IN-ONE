import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { GlobalImportPanel } from "../global-import-panel"

describe("GlobalImportPanel", () => {
  it("shows one prominent file picker and user-oriented idle hints", () => {
    render(<GlobalImportPanel onImportFiles={vi.fn()} importing={false} results={[]} />)

    expect(screen.getByRole("button", { name: "选择文件" })).toBeInTheDocument()
    expect(screen.getByText(/支持 JSON 装备包/)).toBeInTheDocument()
    expect(screen.queryByText(/path/)).not.toBeInTheDocument()
  })

  it("renders grouped multi-file results", () => {
    render(
      <GlobalImportPanel
        importing={false}
        onImportFiles={vi.fn()}
        results={[
          {
            fileName: "weapons.json",
            kind: "equipment",
            success: true,
            summary: "导入 2 个装备模板",
            diagnostics: [],
          },
          {
            fileName: "bad.json",
            kind: "unknown",
            success: false,
            summary: "无法识别内容包类型",
            diagnostics: [
              {
                severity: "error",
                code: "UNKNOWN_CONTENT_PACK",
                path: "",
                message: "无法识别内容包类型",
              },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText("weapons.json")).toBeInTheDocument()
    expect(screen.getByText("bad.json")).toBeInTheDocument()
    expect(screen.getByText("无法识别内容包类型")).toBeInTheDocument()
  })

  it("folds diagnostic details, shows values, and offers show-all for long diagnostic lists", async () => {
    const diagnostics = Array.from({ length: 25 }, (_, index) => ({
      severity: "error" as const,
      code: `ERROR_${index}`,
      path: `/items/${index}`,
      message: `错误 ${index}`,
      value: { index },
    }))

    render(
      <GlobalImportPanel
        importing={false}
        onImportFiles={vi.fn()}
        results={[
          {
            fileName: "bad.json",
            kind: "unknown",
            success: false,
            summary: "导入失败",
            diagnostics,
          },
        ]}
      />,
    )

    await userEvent.click(screen.getByText(/查看问题明细/))
    expect(screen.getByText("错误 0")).toBeInTheDocument()
    expect(screen.queryByText("错误 24")).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /显示全部/ }))
    expect(screen.getByText("错误 24")).toBeInTheDocument()
  })

  it("renders a plain issue overview and detail table without exposing raw diagnostic codes", async () => {
    render(
      <GlobalImportPanel
        importing={false}
        onImportFiles={vi.fn()}
        results={[
          {
            fileName: "血猎人1031（作者：酸奶）.dhcb",
            kind: "card",
            success: false,
            summary: "卡牌包导入失败：发现 2 个阻碍导入的问题，1 个提醒",
            diagnostics: [
              {
                severity: "error",
                code: "TEMPLATE_ID_CONFLICT",
                path: "职业 / 第 1 张 / id",
                message: "血猎人：卡牌 ID 已存在",
                value: {
                  id: "blood-hunter",
                  conflictSource: "custom",
                  packId: "batch_1783654066792_ik1rft",
                  packLabel: "血猎人旧版",
                },
              },
              {
                severity: "error",
                code: "MISSING_FIELD",
                path: "领域 / 第 5 张 / 描述",
                message: "猎杀本能：缺少必填字段",
              },
              {
                severity: "warning",
                code: "LEGACY_FORMAT_ASSUMED",
                path: "",
                message: "未声明文件格式，已按旧版卡牌包格式读取",
              },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText("导入失败")).toBeInTheDocument()
    expect(screen.getByText("发现 2 个阻碍导入的问题，1 个提醒。请处理后重新导入。")).toBeInTheDocument()
    expect(screen.queryByText(/主要原因/)).not.toBeInTheDocument()
    expect(screen.getByText("问题概览")).toBeInTheDocument()
    expect(screen.getByText("与已安装卡牌包冲突")).toBeInTheDocument()
    expect(screen.getByText("卡牌内容不完整")).toBeInTheDocument()
    expect(screen.queryByText("提醒")).not.toBeInTheDocument()
    expect(screen.getByText("与已安装卡牌包“血猎人旧版”冲突：1 张卡牌 ID 已存在")).toBeInTheDocument()
    expect(screen.getByText("缺少字段：1")).toBeInTheDocument()
    expect(screen.queryByText("未声明格式，已按旧版卡牌包格式读取：1")).not.toBeInTheDocument()
    expect(screen.queryByText("血猎人：卡牌 ID 已存在")).not.toBeInTheDocument()

    await userEvent.click(screen.getByText(/查看问题明细/))

    expect(screen.getByText("血猎人：卡牌 ID 已存在")).toBeInTheDocument()
    expect(screen.getByText("职业 / 第 1 张 / id")).toBeInTheDocument()
    expect(screen.getByText("冲突卡包：血猎人旧版；ID：blood-hunter")).toBeInTheDocument()
    expect(screen.getByText("未声明文件格式，已按旧版卡牌包格式读取")).toBeInTheDocument()
    expect(screen.queryByText("TEMPLATE_ID_CONFLICT")).not.toBeInTheDocument()
  })

  it("renders equipment import conflicts with installed pack names and equipment wording", async () => {
    render(
      <GlobalImportPanel
        importing={false}
        onImportFiles={vi.fn()}
        results={[
          {
            fileName: "shadow-equipment.json",
            kind: "equipment",
            success: false,
            summary: "装备包导入失败：发现 2 个阻碍导入的问题，1 个提醒",
            diagnostics: [
              {
                severity: "error",
                code: "ID_CONFLICT",
                path: "武器 / 第 1 件 / 装备ID",
                message: "暗影刃：此装备 ID 已被现有装备占用",
                value: {
                  id: "weapon:shadow",
                  conflictSource: "custom",
                  packId: "pack_shadow_old",
                  packLabel: "旧版暗影装备包",
                },
              },
              {
                severity: "error",
                code: "MISSING_FIELD",
                path: "护甲 / 第 1 件 / 名称",
                message: "缺少必填字段",
              },
              {
                severity: "warning",
                code: "MISSING_TEMPLATE_DESCRIPTION",
                path: "武器 / 第 2 件 / 描述",
                message: "装备缺少描述",
              },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText("与已安装装备包冲突")).toBeInTheDocument()
    expect(screen.getByText("装备内容不完整")).toBeInTheDocument()
    expect(screen.queryByText("提醒")).not.toBeInTheDocument()
    expect(screen.getByText("与已安装装备包“旧版暗影装备包”冲突：1 件装备 ID 已存在")).toBeInTheDocument()
    expect(screen.getByText("缺少字段：1")).toBeInTheDocument()
    expect(screen.queryByText("暗影刃：此装备 ID 已被现有装备占用")).not.toBeInTheDocument()

    await userEvent.click(screen.getByText(/查看问题明细/))

    expect(screen.getByText("暗影刃：此装备 ID 已被现有装备占用")).toBeInTheDocument()
    expect(screen.getByText("武器 / 第 1 件 / 装备ID")).toBeInTheDocument()
    expect(screen.getByText("冲突装备包：旧版暗影装备包；ID：weapon:shadow")).toBeInTheDocument()
    expect(screen.queryByText("ID_CONFLICT")).not.toBeInTheDocument()
  })

  it("rejects file select and drop while importing", async () => {
    const onImportFiles = vi.fn()
    const { container } = render(<GlobalImportPanel onImportFiles={onImportFiles} importing={true} results={[]} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const dropTarget = screen.getByText("导入内容包").parentElement as HTMLElement
    const file = new File(["{}"], "pack.json", { type: "application/json" })

    await userEvent.upload(input, file)
    fireEvent.drop(dropTarget, { dataTransfer: { files: [file] } })

    expect(onImportFiles).not.toHaveBeenCalled()
  })

  it("clears the file input before opening the picker so the same file can be selected again", async () => {
    const { container } = render(<GlobalImportPanel onImportFiles={vi.fn()} importing={false} results={[]} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    Object.defineProperty(input, "value", {
      configurable: true,
      writable: true,
      value: "C:\\fakepath\\pack.json",
    })

    await userEvent.click(screen.getByRole("button", { name: "选择文件" }))

    expect(input.value).toBe("")
  })

  it("clears the file input before reopening the picker from a failed import result", async () => {
    const { container } = render(
      <GlobalImportPanel
        onImportFiles={vi.fn()}
        importing={false}
        results={[
          {
            fileName: "bad.json",
            kind: "unknown",
            success: false,
            summary: "导入失败",
            diagnostics: [
              {
                severity: "error",
                code: "CONTENT_PACK_IMPORT_FAILED",
                path: "",
                message: "文件导入失败，请检查文件内容",
              },
            ],
          },
        ]}
      />,
    )
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    Object.defineProperty(input, "value", {
      configurable: true,
      writable: true,
      value: "C:\\fakepath\\bad.json",
    })

    await userEvent.click(screen.getByText(/查看问题明细/))
    await userEvent.click(screen.getByRole("button", { name: "重新选择文件" }))

    expect(input.value).toBe("")
  })

  it("keeps diagnostics expansion isolated for files with the same name", async () => {
    render(
      <GlobalImportPanel
        importing={false}
        onImportFiles={vi.fn()}
        results={[
          {
            fileName: "pack.json",
            kind: "unknown",
            success: false,
            summary: "第一个失败",
            diagnostics: [
              {
                severity: "error",
                code: "FIRST_ERROR",
                path: "/first",
                message: "first",
              },
            ],
          },
          {
            fileName: "pack.json",
            kind: "unknown",
            success: false,
            summary: "第二个失败",
            diagnostics: [
              {
                severity: "error",
                code: "SECOND_ERROR",
                path: "/second",
                message: "second",
              },
            ],
          },
        ]}
      />,
    )

    await userEvent.click(screen.getAllByText(/查看问题明细/)[0])

    expect(screen.getByText("first")).toBeInTheDocument()
    expect(screen.queryByText("second")).not.toBeInTheDocument()
  })
})
