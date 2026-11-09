package et.maalearna.arna.network

import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Request
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Header

data class AndroidLoginRequest(
    val email: String,
    val password: String,
    val tenant_id: Long,
    val client_type: String = "android",
    val device_installation_id: String,
    val device_label: String,
    val app_version: String,
    val mfa_challenge_token: String? = null,
    val mfa_code: String? = null
)

data class LoginData(
    val token: String?,
    val token_type: String?,
    val session_id: String?,
    val expires_at: String?,
    val mfa_required: Boolean = false,
    val challenge_token: String? = null
)

data class ApiEnvelope<T>(val success: Boolean, val data: T? = null)

data class DeviceSessionDto(
    val session_id: String,
    val platform: String,
    val device_label: String?,
    val app_version: String?,
    val created_at: String?,
    val last_seen_at: String?,
    val expires_at: String?,
    val revoked_at: String?,
    val is_current: Boolean
)

data class SessionListData(val sessions: List<DeviceSessionDto> )
data class RevokeSessionData(val revoked: Boolean)

interface ArnaApi {
    @POST("login")
    suspend fun login(@Body body: AndroidLoginRequest): ApiEnvelope<LoginData>

    @GET("auth/sessions")
    suspend fun sessions(): ApiEnvelope<SessionListData>

    @DELETE("auth/sessions/{sessionId}")
    suspend fun revokeSession(@Path("sessionId") sessionId: String): ApiEnvelope<RevokeSessionData>

    @POST("token/refresh")
    suspend fun refresh(): ApiEnvelope<LoginData>
}

class ArnaApiFactory(
    private val baseUrl: String,
    private val tokenProvider: () -> String?
) {
    fun create(): ArnaApi {
        val auth = Interceptor { chain ->
            val request: Request.Builder = chain.request().newBuilder()
            tokenProvider()?.takeIf(String::isNotBlank)?.let {
                request.header("Authorization", "Bearer $it")
            }
            chain.proceed(request.build())
        }
        val client = OkHttpClient.Builder()
            .addInterceptor(auth)
            .build()
        return Retrofit.Builder()
            .baseUrl(baseUrl.trimEnd('/') + "/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()
            .create(ArnaApi::class.java)
    }
}
