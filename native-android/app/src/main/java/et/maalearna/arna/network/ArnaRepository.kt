package et.maalearna.arna.network

import android.content.Context
import et.maalearna.arna.security.DeviceIdentity
import et.maalearna.arna.security.SessionStore

class ArnaRepository(context: Context, baseUrl: String, appVersion: String) {
    private val sessions = SessionStore(context)
    private val identity = DeviceIdentity(context)
    private val api = ArnaApiFactory(baseUrl) { sessions.read() }.create()
    private val label = android.os.Build.MANUFACTURER + " " + android.os.Build.MODEL
    private val version = appVersion

    suspend fun login(
        identifier: String,
        password: String,
        tenantId: Long,
        mfaChallenge: String? = null,
        mfaCode: String? = null
    ): LoginData {
        val response = api.login(
            AndroidLoginRequest(
                email = identifier,
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
        if (!data.mfa_required) {
            val token = data.token ?: error("The API did not return an access token.")
            sessions.save(token)
        }
        return data
    }

    suspend fun listSessions(): List<DeviceSessionDto> =
        api.sessions().data?.sessions ?: emptyList()

    suspend fun revokeSession(sessionId: String) {
        val result = api.revokeSession(sessionId)
        if (!result.success) error("The session could not be revoked.")
        if (result.data?.revoked != true) error("The API did not confirm session revocation.")
    }

    suspend fun refresh(): LoginData {
        val data = api.refresh().data ?: error("The refresh response was empty.")
        sessions.save(data.token ?: error("The API did not return a replacement token."))
        return data
    }

    fun hasSession(): Boolean = sessions.read() != null

    fun clearSession() = sessions.clear()
}
