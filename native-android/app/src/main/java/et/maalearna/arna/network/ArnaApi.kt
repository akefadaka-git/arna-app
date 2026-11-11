package et.maalearna.arna.network

import com.google.gson.Gson
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Request
import retrofit2.HttpException
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

data class AndroidLoginRequest(
    val email: String,
    val password: String,
    val tenant_id: Long?,
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
data class ApiErrorEnvelope(val error: ApiErrorDto? = null)
data class ApiErrorDto(val code: String? = null, val message: String? = null)
data class LogoutData(val logged_out: Boolean? = null)
data class TenantDto(val id: Long, val slug: String, val name: String)
data class UserProfileData(
    val id: Long,
    val name: String?,
    val email: String?,
    val locale: String?,
    val default_tenant_id: Long?,
    val tenants: List<TenantDto> = emptyList()
)
data class TenantContextData(
    val tenant_id: Long?,
    val tenant_slug: String?,
    val tenant_name: String?,
    val is_active: Boolean,
    val is_member: Boolean,
    val resolution_source: String?
)

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

data class SessionListData(val sessions: List<DeviceSessionDto>)
data class RevokeSessionData(val revoked: Boolean)

class ArnaApiException(
    val httpStatus: Int,
    val errorCode: String?,
    val safeMessage: String
) : Exception(safeMessage)

class ArnaNetworkException(cause: Throwable) :
    Exception("ARNA network request failed.", cause)

internal fun HttpException.toArnaApiException(): ArnaApiException {
    val payload = try {
        response()?.errorBody()?.string()?.let {
            Gson().fromJson(it, ApiErrorEnvelope::class.java)
        }
    } catch (_: Exception) {
        null
    }
    val statusMessage = when (code()) {
        401 -> "Authentication is required or the session has expired."
        403 -> "You are not authorized to perform this action."
        404 -> "The requested ARNA resource was not found."
        409 -> "The request conflicts with the current session state."
        422 -> "Some submitted information is invalid."
        429 -> "Too many requests. Please wait and try again."
        in 500..599 -> "ARNA is temporarily unavailable. Please try again later."
        else -> "The request could not be completed."
    }
    val message = payload?.error?.message
        ?.takeIf { it.isNotBlank() && it.length <= 240 }
        ?: statusMessage
    return ArnaApiException(code(), payload?.error?.code, message)
}

/**
 * Retry only idempotent GET calls after transport failures. Authentication,
 * MFA, refresh, revoke and logout POST/DELETE requests are never replayed.
 */
private class SafeGetRetryInterceptor(private val retries: Int = 2) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): okhttp3.Response {
        val request = chain.request()
        if (request.method != "GET") return chain.proceed(request)

        var attempt = 0
        while (true) {
            try {
                return chain.proceed(request)
            } catch (error: java.io.IOException) {
                if (attempt >= retries) throw error
                val delayMillis = 250L * (1L shl attempt)
                try {
                    Thread.sleep(delayMillis)
                } catch (interrupted: InterruptedException) {
                    Thread.currentThread().interrupt()
                    throw java.io.IOException("Request retry interrupted.", interrupted)
                }
                attempt += 1
            }
        }
    }
}

interface ArnaApi {
    @POST("login")
    suspend fun login(@Body body: AndroidLoginRequest): ApiEnvelope<LoginData>

    @GET("profile")
    suspend fun profile(): ApiEnvelope<UserProfileData>

    @GET("tenant-context")
    suspend fun tenantContext(): ApiEnvelope<TenantContextData>

    @GET("auth/sessions")
    suspend fun sessions(): ApiEnvelope<SessionListData>

    @DELETE("auth/sessions/{sessionId}")
    suspend fun revokeSession(@Path("sessionId") sessionId: String): ApiEnvelope<RevokeSessionData>

    @POST("token/refresh")
    suspend fun refresh(): ApiEnvelope<LoginData>

    @POST("logout")
    suspend fun logout(): ApiEnvelope<LogoutData>
}

class ArnaApiFactory(
    private val baseUrl: String,
    private val tokenProvider: () -> String?,
    private val tenantProvider: () -> Long?
) {
    fun create(): ArnaApi {
        val auth = Interceptor { chain ->
            val request: Request.Builder = chain.request().newBuilder()
            tokenProvider()?.takeIf(String::isNotBlank)?.let {
                request.header("Authorization", "Bearer $it")
            }
            tenantProvider()?.let {
                request.header("X-Tenant-ID", it.toString())
            }
            chain.proceed(request.build())
        }
        val client = OkHttpClient.Builder()
            .retryOnConnectionFailure(false)
            .addInterceptor(auth)
            .addInterceptor(SafeGetRetryInterceptor())
            .build()
        return Retrofit.Builder()
            .baseUrl(baseUrl.trimEnd('/') + "/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()
            .create(ArnaApi::class.java)
    }
}
