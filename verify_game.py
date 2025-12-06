from playwright.sync_api import sync_playwright

def verify_game_visuals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a mobile device in landscape
        context = browser.new_context(
            viewport={'width': 800, 'height': 400},
            user_agent='Mozilla/5.0 (Linux; Android 10; Mobile)'
        )
        page = context.new_page()

        try:
            # Go to the preview server
            page.goto("http://localhost:4173")

            # Wait for canvas to load (GameScene)
            page.wait_for_selector("canvas", timeout=10000)

            # Allow time for assets to load and render
            page.wait_for_timeout(3000)

            # Interact to unlock audio context (simulated tap)
            page.mouse.click(400, 200)

            # Take screenshot of the initial state (Character + Background)
            page.screenshot(path="game_verification_v3.png")
            print("Screenshot saved to game_verification_v3.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_game_visuals()
