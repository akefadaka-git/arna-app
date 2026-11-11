package et.maalearna.arna

import android.os.Bundle
import android.content.Intent
import android.net.Uri
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.clickable
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
import androidx.compose.material3.Card
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import et.maalearna.arna.network.ArnaRepository
import et.maalearna.arna.network.DeviceSessionDto
import et.maalearna.arna.network.LauncherApplicationDto
import et.maalearna.arna.network.TenantDto
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
    var tenantOptions by remember { mutableStateOf<List<TenantDto>>(emptyList()) }
    var selectedTenantId by remember { mutableStateOf(repository.selectedTenantId()) }
    var tenantMenuExpanded by remember { mutableStateOf(false) }
    var workspaceApps by remember { mutableStateOf<List<LauncherApplicationDto>>(emptyList()) }
    var locale by remember { mutableStateOf("am") }
    var busy by remember { mutableStateOf(false) }

    LaunchedEffect(repository) {
        if (repository.hasSession()) {
            try {
                val profile = repository.discoverTenants()
                tenantOptions = profile.tenants
                locale = profile.locale ?: "am"
                val candidate = repository.selectedTenantId()
                    ?: profile.default_tenant_id
                    ?: profile.tenants.singleOrNull()?.id
                if (candidate != null && profile.tenants.any { it.id == candidate }) {
                    repository.selectTenant(candidate)
                    selectedTenantId = candidate
                    workspaceApps = repository.launcherApps()
                }
                sessions = repository.listSessions()
            } catch (error: Exception) {
                status = error.toArnaUserMessage()
            }
        }
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("ARNA", style = MaterialTheme.typography.headlineLarge)
        Text("እንኳን ወደ ARNA በደህና መጡ", style = MaterialTheme.typography.titleLarge)
        Text("One Intelligence. Infinite Possibilities.")
        OutlinedTextField(identifier, { identifier = it }, label = { Text("Email / Phone / Username") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(password, { password = it }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
        OutlinedTextField(tenantId, { tenantId = it.filter(Char::isDigit) }, label = { Text("Initial organization ID (only if required)") }, modifier = Modifier.fillMaxWidth())
        if (challenge != null) {
            OutlinedTextField(mfaCode, { mfaCode = it }, label = { Text("MFA code") }, modifier = Modifier.fillMaxWidth())
        }
        Button(
            enabled = !busy && identifier.isNotBlank() && password.isNotBlank(),
            onClick = {
                busy = true
                scope.launch {
                    try {
                        val result = repository.login(
                            identifier, password, tenantId.toLongOrNull(),
                            challenge, if (challenge != null) mfaCode else null
                        )
                        if (result.mfa_required) {
                            challenge = result.challenge_token
                            status = "MFA ያስፈልጋል፤ የማረጋገጫ ኮድ ያስገቡ"
                        } else {
                            challenge = null
                            mfaCode = ""
                            val profile = repository.discoverTenants()
                            tenantOptions = profile.tenants
                            locale = profile.locale ?: "am"
                            selectedTenantId = repository.selectedTenantId()
                            workspaceApps = if (selectedTenantId != null) repository.launcherApps() else emptyList()
                            status = "በተሳካ ሁኔታ ገብተዋል"
                            sessions = repository.listSessions()
                        }
                    } catch (error: Exception) {
                        status = error.toArnaUserMessage()
                    } finally {
                        busy = false
                    }
                }
            }
        ) { Text(if (busy) "..." else if (challenge != null) "Verify MFA" else "Sign in") }
        Text(status, style = MaterialTheme.typography.bodyMedium)
        if (repository.hasSession()) {
            val selectedTenant = tenantOptions.firstOrNull { it.id == selectedTenantId }
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Organization / Tenant", style = MaterialTheme.typography.titleMedium)
                Button(
                    enabled = !busy && tenantOptions.isNotEmpty(),
                    onClick = { tenantMenuExpanded = true },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(selectedTenant?.name ?: "Select an organization")
                }
                DropdownMenu(
                    expanded = tenantMenuExpanded,
                    onDismissRequest = { tenantMenuExpanded = false }
                ) {
                    tenantOptions.forEach { tenant ->
                        DropdownMenuItem(
                            text = { Text(tenant.name + " (" + tenant.slug + ")") },
                            onClick = {
                                tenantMenuExpanded = false
                                busy = true
                                scope.launch {
                                    try {
                                        repository.selectTenant(tenant.id)
                                        selectedTenantId = tenant.id
                                        workspaceApps = repository.launcherApps()
                                        status = "የድርጅት ምርጫው ተረጋግጧል"
                                    } catch (error: Exception) {
                                        status = error.toArnaUserMessage()
                                    } finally {
                                        busy = false
                                    }
                                }
                            }
                        )
                    }
                }
                Text(
                    selectedTenant?.let { it.name + " · " + it.slug }
                        ?: "Choose an organization to establish a verified tenant context.",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(enabled = !busy && repository.hasSession(), onClick = {
                busy = true
                scope.launch {
                    try {
                        repository.refresh()
                        status = "የዚህ መሣሪያ ክፍለ ጊዜ ታድሷል"
                        sessions = repository.listSessions()
                    } catch (error: Exception) {
                        status = error.toArnaUserMessage()
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
                        status = error.toArnaUserMessage()
                    } finally { busy = false }
                }
            }) { Text("Devices") }
        }
        Button(
            enabled = !busy && repository.hasSession(),
            onClick = {
                busy = true
                scope.launch {
                    try {
                        repository.logout()
                        sessions = emptyList()
                        tenantOptions = emptyList()
                        selectedTenantId = null
                        workspaceApps = emptyList()
                        challenge = null
                        mfaCode = ""
                        status = "ከዚህ መሣሪያ በተሳካ ሁኔታ ወጥተዋል"
                    } catch (error: Exception) {
                        status = error.toArnaUserMessage()
                    } finally {
                        busy = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) { Text("Sign out this device") }
        LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (selectedTenantId != null) {
                item { Text("ARNA Workspace", style = MaterialTheme.typography.titleLarge) }
                if (workspaceApps.isEmpty()) {
                    item {
                        Text(
                            if (locale.lowercase().startsWith("am")) "ለዚህ መለያ የተፈቀዱ መተግበሪያዎች አሁን አልተገኙም"
                            else "No applications are currently available for this account.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
                items(workspaceApps, key = { it.slug }) { application ->
                    LauncherApplicationCard(application, locale)
                }
            }
            item { Text("Device sessions", style = MaterialTheme.typography.titleMedium) }
            items(sessions, key = { it.session_id }) { item ->
                SessionRow(item) {
                    scope.launch {
                        try {
                            repository.revokeSession(item.session_id)
                            if (item.is_current) {
                                repository.clearSession()
                                sessions = emptyList()
                                tenantOptions = emptyList()
                                selectedTenantId = null
                                workspaceApps = emptyList()
                                status = "ከዚህ መሣሪያ ወጥተዋል"
                            } else {
                                sessions = repository.listSessions()
                                status = "የመሣሪያ ክፍለ ጊዜ ተሰርዟል"
                            }
                        } catch (error: Exception) {
                            status = error.toArnaUserMessage()
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


private fun Throwable.toArnaUserMessage(): String = when (this) {
    is et.maalearna.arna.network.ArnaApiException -> when (httpStatus) {
        401 -> "የመግቢያ መረጃው ወይም ክፍለ ጊዜው ትክክል አይደለም"
        403 -> "ይህን ተግባር ለማከናወን ፈቃድ የለዎትም"
        404 -> "የተጠየቀው መረጃ አልተገኘም"
        409 -> "ጥያቄው ከአሁኑ ክፍለ ጊዜ ሁኔታ ጋር አይጣጣምም"
        422 -> "ያስገቡትን መረጃ ያረጋግጡ"
        429 -> "ብዙ ጥያቄዎች ተልከዋል፤ ቆይተው ይሞክሩ"
        in 500..599 -> "ARNA ለጊዜው አይገኝም፤ ቆይተው ይሞክሩ"
        else -> "ጥያቄውን ማጠናቀቅ አልተቻለም"
    }
    is et.maalearna.arna.network.ArnaNetworkException ->
        "የኢንተርኔት ግንኙነት ችግር አለ፤ ግንኙነቱን ያረጋግጡ"
    else -> "ተግባሩን ማጠናቀቅ አልተቻለም"
}


@Composable
private fun LauncherApplicationCard(application: LauncherApplicationDto, locale: String) {
    val amharic = locale.lowercase().startsWith("am")
    val name = if (amharic) application.name_am else application.name_en
    val description = if (amharic) application.description_am else application.description_en
    val context = LocalContext.current
    val launchUri = application.domain?.let { domain ->
        Uri.parse("https://" + domain).takeIf {
            it.scheme == "https" && it.host == domain.lowercase() &&
                it.host?.endsWith(".maalearna.com.et") == true
        }
    }
    Card(
        modifier = Modifier.fillMaxWidth().clickable(enabled = launchUri != null) {
            launchUri?.let { context.startActivity(Intent(Intent.ACTION_VIEW, it)) }
        }
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(application.icon_key ?: "▦", style = MaterialTheme.typography.titleLarge)
                Column(modifier = Modifier.weight(1f)) {
                    Text(name?.takeIf { it.isNotBlank() } ?: application.slug, style = MaterialTheme.typography.titleMedium)
                    Text(application.category ?: application.slug, style = MaterialTheme.typography.labelSmall)
                }
            }
            description?.takeIf { it.isNotBlank() }?.let {
                Text(it, style = MaterialTheme.typography.bodyMedium)
            }
            application.domain?.takeIf { it.isNotBlank() }?.let {
                Text(it + if (launchUri != null) " · Open" else "", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
