package ua.dsimya.kroky

import android.content.Context
import android.os.Build
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectFeatures
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateGroupByPeriodRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.time.LocalDate
import java.time.Period
import java.time.ZoneId

/** What the app knows and does: the pairing, reading the steps from Health Connect, sending them to the server. */
object Steps {
    const val SERVER = "https://d-simya.whysends.workers.dev/"
    const val SITE = "https://w2unemdhysend.github.io/d-simya/"
    const val DAYS = 7L                       // each sync sends the last seven days: a day missed is caught up later

    val READ = HealthPermission.getReadPermission(StepsRecord::class)
    val BACKGROUND = HealthPermission.PERMISSION_READ_HEALTH_DATA_IN_BACKGROUND

    private fun prefs(c: Context) = c.getSharedPreferences("kroky", Context.MODE_PRIVATE)
    fun token(c: Context): String? = prefs(c).getString("token", null)
    fun owner(c: Context): String = prefs(c).getString("owner", "") ?: ""
    fun lastSent(c: Context): Long = prefs(c).getLong("sent", 0L)
    fun lastToday(c: Context): Long = prefs(c).getLong("today", -1L)
    fun lastError(c: Context): String = prefs(c).getString("error", "") ?: ""
    fun forget(c: Context) = prefs(c).edit().remove("token").remove("owner").remove("sent").remove("today").apply()

    /** Health Connect: 0 here, 1 needs installing or updating, 2 not on this phone */
    fun availability(c: Context): Int = when (HealthConnectClient.getSdkStatus(c)) {
        HealthConnectClient.SDK_AVAILABLE -> 0
        HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> 1
        else -> 2
    }
    fun client(c: Context) = HealthConnectClient.getOrCreate(c)

    suspend fun granted(c: Context): Set<String> = client(c).permissionController.getGrantedPermissions()

    /** Whether this Health Connect lets an app read in the background (newer versions; else only while open) */
    fun backgroundPossible(c: Context): Boolean = try {
        client(c).features.getFeatureStatus(HealthConnectFeatures.FEATURE_READ_HEALTH_DATA_IN_BACKGROUND) ==
            HealthConnectFeatures.FEATURE_STATUS_AVAILABLE
    } catch (e: Throwable) { false }

    /** The steps of the last days, one total per day (Health Connect merges the phone, Samsung Health, a watch…) */
    suspend fun read(c: Context): List<Pair<LocalDate, Long>> {
        val zone = ZoneId.systemDefault()
        val end = LocalDate.now(zone).plusDays(1).atStartOfDay()
        val start = end.minusDays(DAYS)
        val res = client(c).aggregateGroupByPeriod(
            AggregateGroupByPeriodRequest(setOf(StepsRecord.COUNT_TOTAL), TimeRangeFilter.between(start, end), Period.ofDays(1))
        )
        return res.map { it.startTime.toLocalDate() to (it.result[StepsRecord.COUNT_TOTAL] ?: 0L) }
    }

    class Unpaired : Exception()

    private fun post(path: String, body: JSONObject, token: String? = null): Pair<Int, JSONObject> {
        val con = URL(SERVER + path).openConnection() as HttpURLConnection
        try {
            con.requestMethod = "POST"
            con.connectTimeout = 15000; con.readTimeout = 20000
            con.doOutput = true
            con.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            if (token != null) con.setRequestProperty("Authorization", "Bearer $token")
            con.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            val code = con.responseCode
            val text = (if (code < 400) con.inputStream else con.errorStream)?.bufferedReader()?.use { it.readText() } ?: "{}"
            return code to (try { JSONObject(text) } catch (e: Exception) { JSONObject() })
        } finally { con.disconnect() }
    }

    /** Pairs with a code from «Харчування»: returns the name of the person, or an error text in Ukrainian */
    fun pair(c: Context, code: String): Result<String> = try {
        val device = listOf(Build.MANUFACTURER.replaceFirstChar { it.uppercase() }, Build.MODEL).distinct().joinToString(" ")
        val (status, d) = post("steps/pair", JSONObject().put("code", code).put("device", device))
        when {
            status == 200 && d.optString("token").isNotEmpty() -> {
                prefs(c).edit().putString("token", d.getString("token")).putString("owner", d.optString("name")).putString("error", "").apply()
                Result.success(d.optString("name"))
            }
            status == 404 -> Result.failure(Exception("Код не підходить або вже минув. Візьми новий у «Харчуванні»."))
            status == 429 -> Result.failure(Exception("Забагато спроб. Зачекай хвилину."))
            else -> Result.failure(Exception("Сервер не відповів як слід ($status). Спробуй пізніше."))
        }
    } catch (e: IOException) { Result.failure(Exception("Немає зв’язку з сервером. Перевір інтернет.")) }

    /** Reads and sends (off the main thread). Throws Unpaired when the server no longer knows this phone; IOException when offline. */
    suspend fun sync(c: Context): Int = withContext(Dispatchers.IO) { syncNow(c) }
    private suspend fun syncNow(c: Context): Int {
        val token = token(c) ?: return 0
        val days = read(c)
        val zone = ZoneId.systemDefault()
        val today = LocalDate.now(zone)
        val arr = JSONArray()
        for ((day, steps) in days) arr.put(JSONObject().put("day", day.toString()).put("steps", steps))
        val (status, d) = post("steps", JSONObject().put("days", arr).put("app", BuildConfig.VERSION_NAME), token)
        if (status == 401) { forget(c); throw Unpaired() }
        if (status != 200) throw IOException("server $status")
        val t = days.firstOrNull { it.first == today }?.second ?: 0L
        prefs(c).edit().putLong("sent", System.currentTimeMillis()).putLong("today", t).putString("error", "").apply()
        return d.optInt("saved", 0)
    }
    fun noteError(c: Context, text: String) = prefs(c).edit().putString("error", text).apply()

    /** A newer version on the site: {versionCode, url}, or null */
    fun newer(): Pair<Int, String>? = try {
        val con = URL(SITE + "kroky/version.json").openConnection() as HttpURLConnection
        con.connectTimeout = 8000; con.readTimeout = 8000
        val d = JSONObject(con.inputStream.bufferedReader().use { it.readText() })
        con.disconnect()
        val v = d.optInt("versionCode", 0)
        if (v > BuildConfig.VERSION_CODE) v to (SITE + "kroky/" + d.optString("apk", "dsimya-kroky.apk")) else null
    } catch (e: Exception) { null }
}
