package et.maalearna.arna

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import et.maalearna.arna.network.ArnaRepository
import et.maalearna.arna.network.DeviceSessionDto
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val repository = ArnaRepository(this, BuildConfig.ARNA_API_BASE_URL, BuildConfig.VERSION_NAME)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    ArnaAuthScreen(repository)
                }
            }
        }
    }
}

@Composable
private fun ArnaAuthScreen(repository: ArnaRepository) {
    val scope = rememberCoroutineScope()
    var identifier by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var tenantId by remember { mutableStateOf("") }
    var mfaCode by remember { mutableStateOf("") }
    var challenge by remember { mutableStateOf<String?>(null) }
    var status by remember { mutableStateOf(if (repository.hasSession()) "የተጠበቀ ክፍለ ጊዜ ተገኝቷል" else "ወደ ARNA ይግቡ") }
    var sessions by remember { mutableStateOf<List<DeviceSessionDto>>(emptyList()) }
    var busy by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("ARNA", style = MaterialTheme.typography.headlineLarge)
        Text("እንኳን ወደ ARNA በደህና መጡ", style = MaterialTheme.typography.titleLarge)
        Text("One Intelligence. Infinite Possibilities.")
        OutlinedTextField(identifier, { identifier = it }, label = { Text("Email / Phone / Username") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(password, { password = it }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
        OutlinedTextField(tenantId, { tenantId = it.filter(Char::isDigit) }, label = { Text("Tenant ID") }, modifier = Modifier.fillMaxWidth())
        if (challenge != null) {
            OutlinedTextField(mfaCode, { mfaCode = it }, label = { Text("MFA code") }, modifier = Modifier.fillMaxWidth())
        }
        Button(
            enabled = !busy && identifier.isNotBlank() && password.isNotBlank() && tenantId.isNotBlank(),
            onClick = {
                busy = true
                scope.launch {
                    try {
                        val result = repository.login(
                            identifier, password, tenantId.toLong(),
                            challenge, if (challenge != null) mfaCode else null
                        )
                        if (result.mfa_required) {
                            challenge = result.challenge_token
                            status = "MFA ያስፈልጋል፤ የማረጋገጫ ኮድ ያስገቡ"
                        } else {
                            challenge = null
                            mfaCode = ""
                            status = "በተሳካ ሁኔታ ገብተዋል"
                            sessions = repository.listSessions()
                        }
                    } catch (error: Exception) {
                        status = "መግባት አልተሳካም፤ የግንኙነት ወይም የመረጃ ስህተት"
                    } finally {
                        busy = false
                    }
                }
            }
        ) { Text(if (busy) "..." else if (challenge != null) "Verify MFA" else "Sign in") }
        Text(status, style = MaterialTheme.typography.bodyMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(enabled = !busy && repository.hasSession(), onClick = {
                busy = true
                scope.launch {
                    try {
                        repository.refresh()
                        status = "የዚህ መሣሪያ ክፍለ ጊዜ ታድሷል"
                        sessions = repository.listSessions()
                    } catch (error: Exception) {
                        status = "ክፍለ ጊዜውን ማደስ አልተቻለም"
                    } finally { busy = false }
                }
            }) { Text("Refresh") }
            Button(enabled = !busy && repository.hasSession(), onClick = {
                busy = true
                scope.launch {
                    try {
                        sessions = repository.listSessions()
                        status = "የመሣሪያ ክፍለ ጊዜዎች"
                    } catch (error: Exception) {
                        status = "ክፍለ ጊዜዎችን ማምጣት አልተቻለም"
                    } finally { busy = false }
                }
            }) { Text("Devices") }
        }
        Text("Device sessions", style = MaterialTheme.typography.titleMedium)
        LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(sessions, key = { it.session_id }) { item ->
                SessionRow(item) {
                    scope.launch {
                        try {
                            repository.revokeSession(item.session_id)
                            if (item.is_current) {
                                repository.clearSession()
                                sessions = emptyList()
                                status = "ከዚህ መሣሪያ ወጥተዋል"
                            } else {
                                sessions = repository.listSessions()
                                status = "የመሣሪያ ክፍለ ጊዜ ተሰርዟል"
                            }
                        } catch (error: Exception) {
                            status = "ክፍለ ጊዜውን መሰረዝ አልተቻለም"
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SessionRow(session: DeviceSessionDto, onRevoke: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
        Text(session.device_label ?: session.platform)
        Text(when {
            session.revoked_at != null -> "Revoked"
            session.is_current -> "Current device"
            else -> "Other device"
        })
        Text(session.last_seen_at ?: "Last activity unavailable", style = MaterialTheme.typography.bodySmall)
        Text(session.expires_at ?: "Expiry unavailable", style = MaterialTheme.typography.bodySmall)
        Button(enabled = session.revoked_at == null, onClick = onRevoke) { Text("Revoke session") }
    }
}
