package et.maalearna.arna

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    ArnaWelcome()
                }
            }
        }
    }
}

@Composable
private fun ArnaWelcome() {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("ARNA", style = MaterialTheme.typography.headlineLarge)
        Text("እንኳን ወደ ARNA በደህና መጡ", style = MaterialTheme.typography.titleLarge)
        Text("One Intelligence. Infinite Possibilities.", style = MaterialTheme.typography.bodyMedium)
        Text("Native Android foundation · Amharic-first · Secure sessions", modifier = Modifier.padding(top = 12.dp))
    }
}
