package et.maalearna.arna.security

import android.util.Base64
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class AndroidSecureStorageInstrumentedTest {
    private val context
        get() = InstrumentationRegistry.getInstrumentation().targetContext

    @Test
    fun bearerTokenIsEncryptedAtRestAndCanBeCleared() {
        val store = SessionStore(context)
        val file = File(context.noBackupFilesDir, "arna-session.enc")
        val token = "test-bearer-token-${System.currentTimeMillis()}"

        store.clear()
        store.save(token)

        assertTrue(file.exists())
        assertFalse(String(file.readBytes(), Charsets.UTF_8).contains(token))
        assertEquals(token, store.read())

        store.clear()
        assertFalse(file.exists())
        assertNull(store.read())
    }

    @Test
    fun tamperedCiphertextIsRejectedAndRemoved() {
        val store = SessionStore(context)
        val file = File(context.noBackupFilesDir, "arna-session.enc")

        store.clear()
        store.save("tamper-detection-token")
        val payload = Base64.decode(file.readBytes(), Base64.NO_WRAP)
        assertTrue(payload.size > 12)
        payload[payload.lastIndex] = (payload.last().toInt() xor 0x01).toByte()
        file.writeBytes(Base64.encode(payload, Base64.NO_WRAP))

        assertNull(store.read())
        assertFalse(file.exists())
    }

    @Test
    fun installationIdentityPersistsAcrossInstancesAndHasExpectedEntropyLength() {
        val first = DeviceIdentity(context).getOrCreate()
        val second = DeviceIdentity(context).getOrCreate()

        assertNotNull(first)
        assertTrue(first.length in 16..128)
        assertEquals(first, second)
    }
}
