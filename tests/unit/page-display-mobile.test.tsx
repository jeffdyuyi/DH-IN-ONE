import { describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, within } from "@testing-library/react"
import type { ComponentProps } from "react"
import { PageDisplay } from "@/components/layout/page-display"
import type { SheetData } from "@/lib/sheet-data"

vi.mock("@/lib/page-registry", () => ({
  getTabPages: () => [
    {
      id: "page1",
      label: "第一页",
      component: () => <div>页面内容</div>,
    },
    {
      id: "page2",
      label: "第二页",
      component: () => <div>第二页内容</div>,
    },
  ],
}))

const renderPageDisplay = (
  isMobile: boolean,
  overrides: Partial<ComponentProps<typeof PageDisplay>> = {},
) => {
  render(
    <PageDisplay
      isDualPageMode={false}
      isMobile={isMobile}
      leftPageId="page1"
      rightPageId="page2"
      leftTabValue="page1"
      rightTabValue="page2"
      currentTabValue="page1"
      formData={{} as SheetData}
      onSetLeftTab={vi.fn()}
      onSetRightTab={vi.fn()}
      onSetCurrentTab={vi.fn()}
      onSwitchToPrevPage={vi.fn()}
      onSwitchToNextPage={vi.fn()}
      {...overrides}
    />,
  )
}

describe("PageDisplay mobile navigation affordances", () => {
  it("does not render desktop side page switchers on mobile", () => {
    renderPageDisplay(true)

    expect(screen.queryByTitle("上一页 (←) - 循环切换")).not.toBeInTheDocument()
    expect(screen.queryByTitle("下一页 (→) - 循环切换")).not.toBeInTheDocument()
  })

  it("renders desktop side page switchers outside mobile", () => {
    renderPageDisplay(false)

    expect(screen.getByTitle("上一页 (←) - 循环切换")).toBeInTheDocument()
    expect(screen.getByTitle("下一页 (→) - 循环切换")).toBeInTheDocument()
  })

  it("fills the available tab area and reserves a fixed page management column", () => {
    renderPageDisplay(false)

    const tabList = screen.getByRole("tablist", { name: "角色卡页面" })
    const tabPanel = screen.getByRole("tabpanel")
    expect(tabList).toHaveStyle({
      gridTemplateColumns: "repeat(2, minmax(0, 1fr)) 2.75rem",
    })
    expect(tabList).toHaveClass("rounded-t-lg", "rounded-b-none", "border-b-0")
    expect(tabPanel).toHaveClass("mt-0", "[&_.a4-page]:rounded-t-none")
    expect(within(tabList).getAllByRole("tab")).toHaveLength(2)
    expect(within(tabList).getByRole("button", { name: "页面管理" })).toBeInTheDocument()
  })

  it("uses the same filled navigation layout for both sides in dual-page mode", () => {
    renderPageDisplay(false, { isDualPageMode: true })

    const tabLists = screen.getAllByRole("tablist")
    expect(tabLists).toHaveLength(2)
    tabLists.forEach((tabList) => {
      expect(tabList).toHaveStyle({
        gridTemplateColumns: "repeat(2, minmax(0, 1fr)) 2.75rem",
      })
      expect(within(tabList).getAllByRole("tab")).toHaveLength(2)
    })
    expect(screen.getAllByRole("button", { name: "页面管理" })).toHaveLength(2)
  })
})
