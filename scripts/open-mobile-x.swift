import ApplicationServices
import CoreGraphics
import Foundation

let profileId = CommandLine.arguments.dropFirst().first ?? ""
let promptForAccess = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary

guard AXIsProcessTrustedWithOptions(promptForAccess) else {
  fputs("macOS Accessibility permission is required for the mobile X opener.\n", stderr)
  exit(2)
}

func allWindows() -> [[String: Any]] {
  let options: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
  return CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] ?? []
}

func number(_ value: Any?) -> CGFloat {
  if let value = value as? CGFloat { return value }
  if let value = value as? Double { return CGFloat(value) }
  if let value = value as? Int { return CGFloat(value) }
  if let value = value as? NSNumber { return CGFloat(truncating: value) }
  return 0
}

func rectFromBounds(_ value: Any?) -> CGRect {
  guard let bounds = value as? [String: Any] else { return .zero }
  return CGRect(
    x: number(bounds["X"]),
    y: number(bounds["Y"]),
    width: number(bounds["Width"]),
    height: number(bounds["Height"])
  )
}

func findMultiloginWindow() -> CGRect? {
  let windows = allWindows().filter { window in
    let owner = String(describing: window[kCGWindowOwnerName as String] ?? "").lowercased()
    let title = String(describing: window[kCGWindowName as String] ?? "").lowercased()
    let layer = window[kCGWindowLayer as String] as? Int ?? -1
    guard layer == 0, owner.contains("multilogin") else { return false }
    return profileId.isEmpty || title.contains(profileId.lowercased()) || owner.contains("multilogin")
  }

  return windows
    .map { rectFromBounds($0[kCGWindowBounds as String]) }
    .filter { $0.width > 250 && $0.height > 400 }
    .sorted { $0.width * $0.height > $1.width * $1.height }
    .first
}

func postMouse(_ type: CGEventType, at point: CGPoint) {
  let event = CGEvent(mouseEventSource: nil, mouseType: type, mouseCursorPosition: point, mouseButton: .left)
  event?.post(tap: .cghidEventTap)
}

func move(_ point: CGPoint) {
  postMouse(.mouseMoved, at: point)
}

func click(_ point: CGPoint) {
  move(point)
  usleep(60_000)
  postMouse(.leftMouseDown, at: point)
  usleep(80_000)
  postMouse(.leftMouseUp, at: point)
}

func drag(from start: CGPoint, to end: CGPoint) {
  move(start)
  usleep(80_000)
  postMouse(.leftMouseDown, at: start)
  let steps = 18
  for index in 1...steps {
    let progress = CGFloat(index) / CGFloat(steps)
    let point = CGPoint(
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress
    )
    postMouse(.leftMouseDragged, at: point)
    usleep(18_000)
  }
  postMouse(.leftMouseUp, at: end)
}

guard let window = findMultiloginWindow() else {
  fputs("Could not find an open Multilogin mobile phone window.\n", stderr)
  exit(1)
}

let phoneLeft = window.minX + 8
let phoneTop = window.minY + 46
let phoneWidth = max(260, window.width - 54)
let phoneHeight = max(480, window.height - 62)

let homeButton = CGPoint(x: phoneLeft + phoneWidth * 0.50, y: phoneTop + phoneHeight * 0.965)
let swipeY = phoneTop + phoneHeight * 0.52
let rightSwipeStart = CGPoint(x: phoneLeft + phoneWidth * 0.20, y: swipeY)
let rightSwipeEnd = CGPoint(x: phoneLeft + phoneWidth * 0.82, y: swipeY)
let leftSwipeStart = CGPoint(x: phoneLeft + phoneWidth * 0.82, y: swipeY)
let leftSwipeEnd = CGPoint(x: phoneLeft + phoneWidth * 0.20, y: swipeY)
let xIcon = CGPoint(x: phoneLeft + phoneWidth * 0.145, y: phoneTop + phoneHeight * 0.065)

click(homeButton)
usleep(350_000)
drag(from: rightSwipeStart, to: rightSwipeEnd)
usleep(350_000)
drag(from: leftSwipeStart, to: leftSwipeEnd)
usleep(450_000)
click(xIcon)
print("X opener macro completed.")
