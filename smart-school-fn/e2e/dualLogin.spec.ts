import { test, expect } from "@playwright/test";

test.describe("Dual Login E2E Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all storage before each test
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should complete personal user login flow", async ({ page }) => {
    // 1. Navigate to login page
    await page.goto("http://localhost:5173/login");

    // 2. Verify Personal Login tab is visible and active
    const personalTab = page.locator("text=Personal Login");
    await expect(personalTab).toBeVisible();

    // 3. Fill in personal login form
    const emailInput = page.locator('input[placeholder*="email"]');
    const passwordInput = page.locator('input[placeholder*="password"]');

    await emailInput.fill("admin@smartschool.com");
    await passwordInput.fill("SecurePass123!");

    // 4. Submit login
    const loginButton = page.locator("button:has-text('Login')").first();
    await loginButton.click();

    // 5. Wait for redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // 6. Verify token stored in localStorage
    const userToken = await page.evaluate(() =>
      localStorage.getItem("accessToken_user")
    );
    expect(userToken).toBeTruthy();

    // 7. Verify user data in localStorage
    const userData = await page.evaluate(() => {
      const data = localStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    });
    expect(userData).toBeTruthy();
    expect(userData.email).toBe("admin@smartschool.com");

    // 8. Verify dashboard is rendered
    const dashboardTitle = page.locator("text=Dashboard");
    await expect(dashboardTitle).toBeVisible({ timeout: 5000 });
  });

  test("should complete student login flow", async ({ page }) => {
    // 1. Navigate to login page
    await page.goto("http://localhost:5173/login");

    // 2. Click on Student Login tab
    const studentTab = page.locator("text=Student Login");
    await studentTab.click();

    // 3. Verify Student Login form is visible
    const schoolCodeInput = page.locator('input[placeholder*="school code"]');
    await expect(schoolCodeInput).toBeVisible();

    // 4. Fill in student login form
    const studentIdInput = page.locator('input[placeholder*="student"]');
    const pinInput = page.locator('input[placeholder*="PIN"]');

    await schoolCodeInput.fill("PS-2024");
    await studentIdInput.fill("STU-2024-001");
    await pinInput.fill("1234");

    // 5. Submit student login
    const studentLoginButton = page
      .locator("button:has-text('Student Login')")
      .first();
    await studentLoginButton.click();

    // 6. Wait for redirect to student dashboard
    await page.waitForURL("**/student/dashboard", { timeout: 10000 });

    // 7. Verify student token stored separately
    const studentToken = await page.evaluate(() =>
      localStorage.getItem("accessToken_student")
    );
    expect(studentToken).toBeTruthy();

    // 8. Verify student data in localStorage
    const studentData = await page.evaluate(() => {
      const data = localStorage.getItem("student");
      return data ? JSON.parse(data) : null;
    });
    expect(studentData).toBeTruthy();
    expect(studentData.studentId).toBe("STU-2024-001");

    // 9. Verify student dashboard is rendered
    const dashboardTitle = page.locator("text=Student Dashboard");
    await expect(dashboardTitle).toBeVisible({ timeout: 5000 });
  });

  test("should handle student login with invalid credentials", async ({
    page,
  }) => {
    // 1. Navigate to login page
    await page.goto("http://localhost:5173/login");

    // 2. Switch to Student Login tab
    const studentTab = page.locator("text=Student Login");
    await studentTab.click();

    // 3. Fill with invalid credentials
    const schoolCodeInput = page.locator('input[placeholder*="school code"]');
    const studentIdInput = page.locator('input[placeholder*="student"]');
    const pinInput = page.locator('input[placeholder*="PIN"]');

    await schoolCodeInput.fill("INVALID");
    await studentIdInput.fill("INVALID");
    await pinInput.fill("9999");

    // 4. Submit login
    const studentLoginButton = page
      .locator("button:has-text('Student Login')")
      .first();
    await studentLoginButton.click();

    // 5. Verify error message appears
    const errorMessage = page.locator("text=/invalid|error/i");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // 6. Verify no token stored
    const studentToken = await page.evaluate(() =>
      localStorage.getItem("accessToken_student")
    );
    expect(studentToken).toBeNull();

    // 7. Verify still on login page
    await expect(page).toHaveURL("**/login");
  });

  test("should switch between login tabs without losing data", async ({
    page,
  }) => {
    // 1. Navigate to login page
    await page.goto("http://localhost:5173/login");

    // 2. Fill personal login form
    const emailInput = page.locator('input[placeholder*="email"]');
    const passwordInput = page.locator('input[placeholder*="password"]');

    await emailInput.fill("test@example.com");
    await passwordInput.fill("TestPass123!");

    // 3. Verify filled data is visible
    expect(await emailInput.inputValue()).toBe("test@example.com");
    expect(await passwordInput.inputValue()).toBe("TestPass123!");

    // 4. Switch to Student tab
    const studentTab = page.locator("text=Student Login");
    await studentTab.click();

    // 5. Fill student form
    const schoolCodeInput = page.locator('input[placeholder*="school code"]');
    const studentIdInput = page.locator('input[placeholder*="student"]');

    await schoolCodeInput.fill("PS-2024");
    await studentIdInput.fill("STU-001");

    expect(await schoolCodeInput.inputValue()).toBe("PS-2024");
    expect(await studentIdInput.inputValue()).toBe("STU-001");

    // 6. Switch back to Personal tab
    const personalTab = page.locator("text=Personal Login");
    await personalTab.click();

    // 7. Verify personal data is preserved
    const emailValue = await emailInput.inputValue();
    const passwordValue = await passwordInput.inputValue();

    expect(emailValue).toBe("test@example.com");
    expect(passwordValue).toBe("TestPass123!");
  });

  test("should prevent access to student dashboard without valid token", async ({
    page,
  }) => {
    // 1. Try to navigate directly to student dashboard
    await page.goto("http://localhost:5173/student/dashboard");

    // 2. Should be redirected to login
    await page.waitForURL("**/login");

    // 3. Verify on login page
    const loginTitle = page.locator("text=/login/i");
    await expect(loginTitle).toBeVisible();
  });

  test("should logout student and return to login page", async ({ page }) => {
    // 1. Navigate to login page
    await page.goto("http://localhost:5173/login");

    // 2. Switch to Student Login
    const studentTab = page.locator("text=Student Login");
    await studentTab.click();

    // 3. Fill and submit student login
    const schoolCodeInput = page.locator('input[placeholder*="school code"]');
    const studentIdInput = page.locator('input[placeholder*="student"]');
    const pinInput = page.locator('input[placeholder*="PIN"]');

    await schoolCodeInput.fill("PS-2024");
    await studentIdInput.fill("STU-2024-001");
    await pinInput.fill("1234");

    const studentLoginButton = page
      .locator("button:has-text('Student Login')")
      .first();
    await studentLoginButton.click();

    // 4. Wait for student dashboard
    await page.waitForURL("**/student/dashboard", { timeout: 10000 });

    // 5. Find and click logout button
    const logoutButton = page.locator("button:has-text('Logout')");
    await logoutButton.click();

    // 6. Verify redirected to login
    await page.waitForURL("**/login");

    // 7. Verify tokens cleared
    const studentToken = await page.evaluate(() =>
      localStorage.getItem("accessToken_student")
    );
    const studentData = await page.evaluate(() =>
      localStorage.getItem("student")
    );

    expect(studentToken).toBeNull();
    expect(studentData).toBeNull();
  });

  test("should maintain separate sessions for user and student", async ({
    page: page1,
    context,
  }) => {
    const page2 = await context.newPage();

    try {
      // 1. Login as personal user in first page
      await page1.goto("http://localhost:5173/login");

      const emailInput1 = page1.locator('input[placeholder*="email"]');
      const passwordInput1 = page1.locator('input[placeholder*="password"]');

      await emailInput1.fill("admin@smartschool.com");
      await passwordInput1.fill("SecurePass123!");

      const loginButton1 = page1
        .locator("button:has-text('Login')")
        .first();
      await loginButton1.click();

      await page1.waitForURL("**/dashboard");

      // 2. Login as student in second page
      await page2.goto("http://localhost:5173/login");

      const studentTab = page2.locator("text=Student Login");
      await studentTab.click();

      const schoolCodeInput = page2.locator('input[placeholder*="school code"]');
      const studentIdInput = page2.locator('input[placeholder*="student"]');
      const pinInput = page2.locator('input[placeholder*="PIN"]');

      await schoolCodeInput.fill("PS-2024");
      await studentIdInput.fill("STU-2024-001");
      await pinInput.fill("1234");

      const studentLoginButton = page2
        .locator("button:has-text('Student Login')")
        .first();
      await studentLoginButton.click();

      await page2.waitForURL("**/student/dashboard");

      // 3. Verify separate tokens in each page
      const userToken = await page1.evaluate(() =>
        localStorage.getItem("accessToken_user")
      );
      const studentToken = await page2.evaluate(() =>
        localStorage.getItem("accessToken_student")
      );

      expect(userToken).toBeTruthy();
      expect(studentToken).toBeTruthy();

      // 4. Verify different token values
      expect(userToken).not.toBe(studentToken);
    } finally {
      await page2.close();
    }
  });
});
