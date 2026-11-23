import { expect, test } from '@playwright/test';

const appUrl = process.env.AUTH_LOGIN_APP_URL ?? 'http://localhost:4178/workspace-entry/';

const authenticatedUser = {
  id: 41,
  name: 'Browser OTP Test',
  email: 'browser-otp@example.test',
  locale: 'en',
  default_tenant_id: 7,
  roles: [],
  permissions: [],
  tenants: [],
};

const envelope = (data) => ({ success: true, data });

test.describe('ARNA returning-user OTP login', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
      if (window.location.pathname === '/workspace-entry/') {
        window.history.replaceState({}, '', '/login');
      }
    });

    await page.route('**/sanctum/csrf-cookie', (route) => route.fulfill({
      status: 204,
      headers: {
        'set-cookie': 'XSRF-TOKEN=browser-csrf-token; Path=/; SameSite=Lax',
      },
    }));

    await page.route('**/api/user', async (route) => {
      const cookie = route.request().headers().cookie ?? '';
      if (cookie.includes('arna_sso_token=browser-otp-session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(envelope(authenticatedUser)),
        });
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'AUTH_UNAUTHENTICATED', message: 'Unauthenticated.' },
        }),
      });
    });

    await page.goto(appUrl);
    await expect(page.getByTestId('login-form-root')).toBeVisible();
  });

  test('requests OTP, verifies it, receives SSO cookie, and restores the browser session', async ({ page }) => {
    let challengeRequest;
    let authenticatorRequest;
    let authenticatedUserCookie = '';

    await page.route('**/api/login/otp/challenge', async (route) => {
      challengeRequest = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope({
          challenge_required: true,
          challenge_token: 'a'.repeat(64),
          methods: ['otp'],
        })),
      });
    });

    await page.route('**/api/login/authenticator', async (route) => {
      authenticatorRequest = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'set-cookie': 'arna_sso_token=browser-otp-session; Path=/; HttpOnly; Secure; SameSite=Lax',
        },
        body: JSON.stringify(envelope({
          user: {
            id: authenticatedUser.id,
            name: authenticatedUser.name,
            email: authenticatedUser.email,
            locale: authenticatedUser.locale,
            default_tenant_id: authenticatedUser.default_tenant_id,
          },
          token: 'browser-test-bearer-token',
          token_type: 'Bearer',
        })),
      });
    });

    await page.route('**/api/user', async (route) => {
      const cookie = route.request().headers().cookie ?? '';
      if (cookie.includes('arna_sso_token=browser-otp-session')) {
        authenticatedUserCookie = cookie;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(envelope(authenticatedUser)),
        });
        return;
      }
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'AUTH_UNAUTHENTICATED', message: 'Unauthenticated.' },
        }),
      });
    });

    await page.locator('#login-identifier').fill('EMP-000041');
    await page.locator('#login-otp-channel').selectOption('sms');
    await page.getByTestId('login-form-request-otp').click();

    expect(challengeRequest).toMatchObject({
      identifier: 'EMP-000041',
      channel: 'sms',
    });
    await expect(page.getByTestId('login-form-otp')).toBeVisible();

    await page.locator('#login-otp-code').fill('482913');
    const loginResponsePromise = page.waitForResponse((response) =>
      response.url().endsWith('/api/login/authenticator'),
    );
    await page.getByTestId('login-form-submit').click();
    const loginResponse = await loginResponsePromise;

    expect(authenticatorRequest).toMatchObject({
      identifier: 'EMP-000041',
      authenticator: 'otp',
      code: '482913',
      challenge_token: 'a'.repeat(64),
    });

    const setCookie = await loginResponse.headerValue('set-cookie');
    expect(setCookie).toContain('arna_sso_token=browser-otp-session');
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/Secure/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);

    await expect.poll(() => authenticatedUserCookie).toContain('arna_sso_token=browser-otp-session');
    await page.waitForURL(/\/launcher(?:[/?#]|$)/);
    const storedValues = await page.evaluate(() => Object.values(localStorage));
    expect(storedValues).not.toContain('482913');
    expect(storedValues).not.toContain('a'.repeat(64));
  });

  test('keeps the user unauthenticated and shows a generic error when OTP verification fails', async ({ page }) => {
    await page.route('**/api/login/otp/challenge', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope({
        challenge_required: true,
        challenge_token: 'b'.repeat(64),
        methods: ['otp'],
      })),
    }));

    await page.route('**/api/login/authenticator', (route) => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid authenticator.' },
      }),
    }));

    await page.locator('#login-identifier').fill('wallet-000041');
    await page.getByTestId('login-form-request-otp').click();
    await expect(page.getByTestId('login-form-otp')).toBeVisible();
    await page.locator('#login-otp-code').fill('000000');
    const failureResponsePromise = page.waitForResponse((response) =>
      response.url().endsWith('/api/login/authenticator'),
    );
    await page.getByTestId('login-form-submit').click();
    const failureResponse = await failureResponsePromise;

    await expect(page.getByTestId('login-form-banner')).toBeVisible();
    await expect(page.getByTestId('login-form-banner')).toContainText('Invalid sign-in details');
    await expect(page).toHaveURL(/\/login(?:[/?#]|$)/);
    expect(await failureResponse.headerValue('set-cookie')).toBeNull();
    await expect(page.getByTestId('login-form-otp')).toBeVisible();
  });
});
