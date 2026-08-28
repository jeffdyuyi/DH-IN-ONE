import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SaveSwitcher } from "@/components/ui/save-switcher"
import type { CharacterMetadata } from "@/lib/sheet-data"

const characterList: CharacterMetadata[] = [
  {
    id: "character-1",
    saveName: "我的存档",
    createdAt: "2026-08-09T00:00:00.000Z",
    lastModified: "2026-08-09T00:00:00.000Z",
    order: 0,
  },
]

describe("SaveSwitcher", () => {
  it("centers the borderless save title without site-level actions", () => {
    render(
      <SaveSwitcher
        characterList={characterList}
        currentCharacterId="character-1"
        onOpenCharacterManagement={vi.fn()}
      />,
    )

    const toolbar = screen.getByRole("heading", {
      name: "DaggerHeart 角色卡：我的存档",
    }).parentElement
    const saveButton = screen.getByRole("button", { name: /打开存档管理/ })

    expect(toolbar).toHaveClass("justify-center")
    expect(toolbar).toHaveClass("h-12", "md:h-10")
    expect(toolbar).not.toHaveClass("border", "shadow-sm")
    expect(saveButton).toHaveClass("h-full", "w-full", "justify-center")
    expect(saveButton).not.toHaveClass("border")
    expect(toolbar?.querySelectorAll("a, button")[0]).toHaveAccessibleName(/打开存档管理/)
    expect(screen.queryByRole("link", { name: /支持正版/ })).not.toBeInTheDocument()
  })

  it("opens character management from the current save entry", () => {
    const onOpenCharacterManagement = vi.fn()
    const promptSpy = vi.spyOn(window, "prompt")

    render(
      <SaveSwitcher
        characterList={characterList}
        currentCharacterId="character-1"
        onOpenCharacterManagement={onOpenCharacterManagement}
      />,
    )

    const saveButton = screen.getByRole("button", {
      name: "打开存档管理，当前存档：我的存档",
    })

    expect(saveButton).toHaveClass("justify-center", "text-center")
    expect(saveButton.querySelector(".lucide-folder-open")).not.toBeInTheDocument()
    expect(saveButton.querySelector(".lucide-chevron-right")).not.toBeInTheDocument()
    fireEvent.click(saveButton)

    expect(screen.queryByText("当前存档")).not.toBeInTheDocument()
    expect(onOpenCharacterManagement).toHaveBeenCalledTimes(1)
    expect(promptSpy).not.toHaveBeenCalled()
    promptSpy.mockRestore()
  })
})
