package et.maalearna.arna.network

import android.content.Context
import et.maalearna.arna.security.DeviceIdentity
import et.maalearna.arna.security.SessionStore
import et.maalearna.arna.security.TenantSelectionStore
import retrofit2.HttpException
import java.io.IOException

class ArnaRepository(context: Context, baseUrl: String, appVersion: String) {
    private val sessions = SessionStore(context)
    private val tenantSelection = TenantSelectionStore(context)
    private val identity = DeviceIdentity(context)
    private val api = ArnaApiFactory(baseUrl, { sessions.read() }, { tenantSelection.read() }).create()
    private val label = android.os.Build.MANUFACTURER + " " + android.os.Build.MODEL
    private val version = appVersion

    private suspend fun <T> execute(request: suspend () -> T): T {
        try {
            return request()
        } catch (error: HttpException) {
            throw error.toArnaApiException()
        } catch (error: IOException) {
            throw ArnaNetworkException(error)
        }
    }

    suspend fun login(
        identifier: String,
        password: String,
        tenantId: Long?,
        mfaChallenge: String? = null,
        mfaCode: String? = null
    ): LoginData = execute {
        // Do not let a previously authenticated account's tenant header
        // influence a new login or its MFA challenge binding.
        tenantSelection.clear()
        val response = api.login(
            AndroidLoginRequest(
                email = identifier.trim(),
                password = password,
                tenant_id = tenantId,
                device_installation_id = identity.getOrCreate(),
                device_label = label.take(100),
                app_version = version,
                mfa_challenge_token = mfaChallenge,
                mfa_code = mfaCode
            )
        )
        val data = response.data ?: error("The authentication response was empty.")
        if (!response.success) error("The authentication request was rejected.")
        if (!data.mfa_required) {
            val token = data.token ?: error("The API did not return an access token.")
            sessions.save(token)
            val profile = discoverTenants()
            val selected = tenantId
                ?: profile.default_tenant_id
                ?: profile.tenants.singleOrNull()?.id
            if (selected != null) selectTenant(selected)
        }
        data
    }

    suspend fun discoverTenants(): UserProfileData = execute {
        val response = api.profile()
        if (!response.success) error("The profile request was rejected.")
        response.data ?: error("The profile response was empty.")
    }

    suspend fun selectTenant(tenantId: Long): TenantContextData = execute {
        val previous = tenantSelection.read()
        tenantSelection.save(tenantId)
        try {
            val response = api.tenantContext()
            val context = response.data
            if (!response.success || context == null ||
                context.tenant_id != tenantId || !context.is_active || !context.is_member
            ) {
                error("The selected organization could not be verified for this account.")
            }
            context
        } catch (error: Exception) {
            if (previous == null) tenantSelection.clear() else tenantSelection.save(previous)
            throw error
        }
    }

    fun selectedTenantId(): Long? = tenantSelection.read()

    suspend fun launcherApps(): List<LauncherApplicationDto> = execute {
        val response = api.launcher()
        if (!response.success) error("The workspace catalog request was rejected.")
        response.data ?: emptyList()
    }

    suspend fun listSessions(): List<DeviceSessionDto> = execute {
        val response = api.sessions()
        if (!response.success) error("The session list request was rejected.")
        response.data?.sessions ?: emptyList()
    }

    suspend fun revokeSession(sessionId: String) = execute {
        val response = api.revokeSession(sessionId)
        if (!response.success || response.data?.revoked != true) {
            error("The API did not confirm session revocation.")
        }
    }

    suspend fun refresh(): LoginData = execute {
        val response = api.refresh()
        if (!response.success) error("The refresh request was rejected.")
        val data = response.data ?: error("The refresh response was empty.")
        sessions.save(data.token ?: error("The API did not return a replacement token."))
        data
    }

    suspend fun logout() = execute {
        val response = api.logout()
        if (!response.success) error("The API did not confirm logout.")
        // Clear local credentials only after the server confirms revocation.
        sessions.clear()
        tenantSelection.clear()
    }

    fun hasSession(): Boolean = sessions.read() != null

    fun clearSession() { sessions.clear(); tenantSelection.clear() }
}
