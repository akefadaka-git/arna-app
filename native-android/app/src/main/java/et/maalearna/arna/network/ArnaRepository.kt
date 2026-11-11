package et.maalearna.arna.network

import android.content.Context
import et.maalearna.arna.security.DeviceIdentity
import et.maalearna.arna.security.SessionStore
import retrofit2.HttpException
import java.io.IOException

class ArnaRepository(context: Context, baseUrl: String, appVersion: String) {
    private val sessions = SessionStore(context)
    private val identity = DeviceIdentity(context)
    private val api = ArnaApiFactory(baseUrl) { sessions.read() }.create()
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
        tenantId: Long,
        mfaChallenge: String? = null,
        mfaCode: String? = null
    ): LoginData = execute {
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
        }
        data
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
    }

    fun hasSession(): Boolean = sessions.read() != null

    fun clearSession() = sessions.clear()
}
