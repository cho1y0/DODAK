import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

BASE_URL = "http://192.168.0.9:8083"
SAVE_DIR = os.path.dirname(os.path.abspath(__file__))

# Doctor pages
DOCTOR_PAGES = [
    ("doctor_01_home", "/doctor/home"),
    ("doctor_02_dashboard", "/doctor/dashboard"),
    ("doctor_03_patient_stats", "/doctor/patient-stats"),
    ("doctor_04_patient_diary_list", "/doctor/patient-diary-list"),
    ("doctor_05_mypage", "/doctor/mypage"),
]

# Member (regular user) pages
MEMBER_PAGES = [
    ("member_01_home", "/member/home"),
    ("member_02_diary_write", "/member/diary-write"),
    ("member_03_diary_list", "/member/diary-list"),
    ("member_04_mypage", "/member/mypage"),
]

# Public pages (no login needed)
PUBLIC_PAGES = [
    ("public_01_index", "/"),
    ("public_02_login", "/login"),
    ("public_03_signup", "/join"),
]


def setup_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument("--force-device-scale-factor=1")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--lang=ko-KR")
    return webdriver.Chrome(options=opts)


def login(driver, user_id, password):
    driver.get(f"{BASE_URL}/login")
    time.sleep(2)

    uid = driver.find_element(By.NAME, "username")
    pwd = driver.find_element(By.NAME, "password")
    uid.clear()
    uid.send_keys(user_id)
    pwd.clear()
    pwd.send_keys(password)

    form = driver.find_element(By.CSS_SELECTOR, "form")
    form.submit()
    time.sleep(3)
    print(f"  Logged in as '{user_id}'. Current URL: {driver.current_url}")


def take_screenshot(driver, filepath):
    total_h = driver.execute_script(
        "return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)"
    )
    driver.set_window_size(1920, min(total_h + 200, 10000))
    time.sleep(1)
    driver.save_screenshot(filepath)
    driver.set_window_size(1920, 1080)


def capture_pages(driver, pages, prefix=""):
    for name, path in pages:
        print(f"  [{name}] {path}")
        driver.get(f"{BASE_URL}{path}")
        time.sleep(3)
        fp = os.path.join(SAVE_DIR, f"{name}.png")
        take_screenshot(driver, fp)
        print(f"    -> Saved: {fp}")


def main():
    # === 1. Public pages (no login) ===
    print("\n=== Public Pages ===")
    driver = setup_driver()
    try:
        capture_pages(driver, PUBLIC_PAGES)
    finally:
        driver.quit()

    # === 2. Doctor account ===
    print("\n=== Doctor Pages (doctor4) ===")
    driver = setup_driver()
    try:
        login(driver, "doctor4", "!@admin12345678")
        capture_pages(driver, DOCTOR_PAGES)
    finally:
        driver.quit()

    # === 3. Member account ===
    print("\n=== Member Pages (dodak) ===")
    driver = setup_driver()
    try:
        login(driver, "dodak", "!@admin12345678")
        capture_pages(driver, MEMBER_PAGES)
    finally:
        driver.quit()

    print(f"\nDone! All screenshots saved to: {SAVE_DIR}")


if __name__ == "__main__":
    main()
