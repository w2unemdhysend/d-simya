package ua.dsimya.kroky

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import java.io.IOException
import java.util.concurrent.TimeUnit

/** Every hour, with a network: the last days' steps to the server (Health Connect allows it with the background permission). */
class SyncWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val c = applicationContext
        if (Steps.token(c) == null || Steps.availability(c) != 0) return Result.success()
        return try {
            val g = Steps.granted(c)
            if (Steps.READ !in g || Steps.BACKGROUND !in g) return Result.success()   // the app sends when it is opened
            Steps.sync(c)
            Result.success()
        } catch (e: Steps.Unpaired) {
            Steps.noteError(c, "Телефон відключено в «Харчуванні». Підключи його знову новим кодом.")
            Result.success()
        } catch (e: IOException) {
            Result.retry()
        } catch (e: SecurityException) {
            Result.success()   // the permission was taken back
        } catch (e: Exception) {
            Steps.noteError(c, "Не вдалося прочитати кроки: ${e.message ?: e.javaClass.simpleName}")
            Result.retry()
        }
    }

    companion object {
        fun schedule(c: Context) {
            val req = PeriodicWorkRequestBuilder<SyncWorker>(1, TimeUnit.HOURS)
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .build()
            WorkManager.getInstance(c).enqueueUniquePeriodicWork("kroky", ExistingPeriodicWorkPolicy.KEEP, req)
        }
        fun cancel(c: Context) = WorkManager.getInstance(c).cancelUniqueWork("kroky")
    }
}
