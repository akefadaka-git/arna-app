package et.maalearna.arna.security

import android.content.Context
import java.io.File
import java.util.UUID

/**
 * Generates a random per-installation identifier. It is not an authentication
 * secret; the API stores only a keyed hash and binds it to the login challenge.
 */
class DeviceIdentity(context: Context) {
    private val file = File(context.filesDir, "installation-id")

    @Synchronized
    fun getOrCreate(): String {
        if (file.exists()) {
            file.readText().trim().takeIf { it.length in 16..128 }?.let { return it }
        }
        val id = UUID.randomUUID().toString() + UUID.randomUUID().toString().replace("-", "")
        file.writeText(id)
        return id
    }
}
