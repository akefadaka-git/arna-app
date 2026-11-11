package et.maalearna.arna.security

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.io.File
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/** Stores the selected tenant ID as authenticated AES-GCM ciphertext. */
class TenantSelectionStore(context: Context) {
    private val file = File(context.noBackupFilesDir, "arna-tenant.enc")
    private val alias = "arna.mobile.tenant.v1"

    @Synchronized
    fun save(tenantId: Long) {
        require(tenantId > 0)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
        val payload = cipher.iv + cipher.doFinal(tenantId.toString().toByteArray(Charsets.UTF_8))
        val temporary = File(file.parentFile, file.name + ".tmp")
        temporary.writeBytes(Base64.encode(payload, Base64.NO_WRAP))
        if (!temporary.renameTo(file)) {
            temporary.copyTo(file, overwrite = true)
            temporary.delete()
        }
    }

    @Synchronized
    fun read(): Long? {
        if (!file.exists()) return null
        return try {
            val payload = Base64.decode(file.readBytes(), Base64.NO_WRAP)
            require(payload.size > 12)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(
                Cipher.DECRYPT_MODE,
                getOrCreateKey(),
                GCMParameterSpec(128, payload.copyOfRange(0, 12))
            )
            cipher.doFinal(payload.copyOfRange(12, payload.size))
                .toString(Charsets.UTF_8).toLong().takeIf { it > 0 }
        } catch (_: Exception) {
            clear()
            null
        }
    }

    @Synchronized
    fun clear() {
        if (file.exists()) file.delete()
    }

    private fun getOrCreateKey(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (store.getKey(alias, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(
                alias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            ).setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build()
        )
        return generator.generateKey()
    }
}
