from playwright.sync_api import sync_playwright

def verify_game_load():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the Vite dev server
        # Assuming Vite runs on port 5173 by default
        page.goto("http://localhost:5173")

        # Wait for the game container to be present
        page.wait_for_selector("#game-container")

        # Wait a bit for Phaser to initialize and render the scene
        page.wait_for_timeout(3000)

        # Take a screenshot
        page.screenshot(path="verification/game_screenshot_v2.png")

        browser.close()

if __name__ == "__main__":
    verify_game_load()
