package ua.dsimya.kroky

import android.content.Intent
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.text.InputFilter
import android.text.InputType
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.IOException
import java.text.SimpleDateFormat
import java.time.LocalDate
import java.util.Date
import java.util.Locale

/** One screen: Health Connect access, pairing with a code from «Харчування», today's steps and when they were sent. */
class MainActivity : ComponentActivity() {
    private lateinit var box: LinearLayout
    private var busy = false
    private var note = ""
    private var granted: Set<String> = emptySet()
    private var todaySteps: Long? = null
    private var update: Pair<Int, String>? = null

    private val dark get() = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
    private val ink get() = if (dark) 0xFFE5EBEE.toInt() else 0xFF12181C.toInt()
    private val muted get() = if (dark) 0xFF98A6AE.toInt() else 0xFF53616A.toInt()
    private val surface get() = if (dark) 0xFF182026.toInt() else 0xFFF6F8F9.toInt()
    private val line get() = if (dark) 0xFF2A343B.toInt() else 0xFFC7D0D5.toInt()
    private val ok get() = if (dark) 0xFF66BB6A.toInt() else 0xFF2A7530.toInt()
    private val bad get() = if (dark) 0xFFFF8A80.toInt() else 0xFFB3261E.toInt()
    private fun dp(v: Int) = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics).toInt()

    private val ask = registerForActivityResult(PermissionController.createRequestPermissionResultContract()) { g ->
        granted = g
        note = if (Steps.READ in g) "" else "Без доступу до кроків застосунок нічого не надішле."
        refresh()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        box = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(16), dp(20), dp(16), dp(24)) }
        val scroll = ScrollView(this).apply { addView(box); isFillViewport = true }
        // the bars of the phone over the content (Android 15 draws the app behind them)
        scroll.setOnApplyWindowInsetsListener { v, insets ->
            @Suppress("DEPRECATION") v.setPadding(insets.systemWindowInsetLeft, insets.systemWindowInsetTop, insets.systemWindowInsetRight, insets.systemWindowInsetBottom)
            insets
        }
        setContentView(scroll)
        lifecycleScope.launch { update = withContext(Dispatchers.IO) { Steps.newer() }; render() }
    }

    override fun onResume() { super.onResume(); refresh() }

    /** Reads the state, sends the steps if it can, draws the screen */
    private fun refresh() {
        render()
        if (Steps.availability(this) != 0) return
        lifecycleScope.launch {
            granted = try { Steps.granted(this@MainActivity) } catch (e: Exception) { emptySet() }
            if (Steps.READ in granted) {
                todaySteps = try {
                    val today = LocalDate.now()
                    Steps.read(this@MainActivity).firstOrNull { it.first == today }?.second ?: 0L
                } catch (e: Exception) { null }
                if (Steps.token(this@MainActivity) != null) { SyncWorker.schedule(this@MainActivity); send(quiet = true) }
            }
            render()
        }
    }

    private suspend fun send(quiet: Boolean) {
        if (busy) return
        busy = true; render()
        try {
            Steps.sync(this)
            if (!quiet) note = "Надіслано."
        } catch (e: Steps.Unpaired) {
            note = "Телефон відключено в «Харчуванні». Візьми новий код і підключи знову."
            SyncWorker.cancel(this)
        } catch (e: IOException) {
            if (!quiet) note = "Немає зв’язку з сервером. Спробую пізніше сам."
        } catch (e: Exception) {
            note = "Не вдалося прочитати кроки: ${e.message ?: e.javaClass.simpleName}"
        }
        busy = false; render()
    }

    /* ---------------- drawing ---------------- */
    private fun text(s: CharSequence, size: Float = 16f, color: Int = ink, bold: Boolean = false) = TextView(this).apply {
        text = s; setTextSize(TypedValue.COMPLEX_UNIT_SP, size); setTextColor(color); setLineSpacing(0f, 1.2f)
        if (bold) typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        layoutParams = LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = dp(6) }
    }
    private fun button(label: String, primary: Boolean = true, onClick: () -> Unit) = Button(this).apply {
        text = label; isAllCaps = false; setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f); minHeight = dp(52); stateListAnimator = null
        setTextColor(if (primary) (if (dark) Color.BLACK else Color.WHITE) else ink)
        background = GradientDrawable().apply { cornerRadius = dp(14).toFloat(); if (primary) setColor(ink) else { setColor(Color.TRANSPARENT); setStroke(dp(1), line) } }
        layoutParams = LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = dp(10) }
        setOnClickListener { onClick() }
    }
    private fun card(vararg views: View) = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL; setPadding(dp(14), dp(10), dp(14), dp(14))
        background = GradientDrawable().apply { cornerRadius = dp(16).toFloat(); setColor(surface); setStroke(dp(1), line) }
        layoutParams = LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = dp(12) }
        views.forEach { addView(it) }
    }

    private fun render() {
        box.removeAllViews()
        box.addView(text("Кроки D-SIM’YA", 26f, ink, true))
        box.addView(text("Передає кроки з цього телефона в «Харчування»: сам, щогодини. Потрібно один раз дати доступ і ввести код.", 15f, muted))

        // 1. Health Connect
        val av = Steps.availability(this)
        val hc = mutableListOf<View>(text("1. Доступ до кроків", 18f, ink, true))
        when {
            av == 2 -> hc += text("На цьому телефоні немає Health Connect, тож кроки взяти ніде. Потрібен Android 9 або новіший.", 15f, bad)
            av == 1 -> {
                hc += text("Потрібно встановити або оновити Health Connect: через нього телефон ділиться кроками.", 15f, muted)
                hc += button("Встановити Health Connect") { open("market://details?id=com.google.android.apps.healthdata&url=healthconnect%3A%2F%2Fonboarding") }
            }
            Steps.READ in granted -> {
                hc += text("✓ Доступ до кроків є", 16f, ok, true)
                val bg = Steps.backgroundPossible(this)
                hc += when {
                    bg && Steps.BACKGROUND in granted -> text("✓ Оновлюється у фоні щогодини", 15f, ok)
                    bg -> text("Фоновий доступ не дано: кроки надсилаються лише тоді, коли відкриваєш застосунок.", 15f, muted)
                    else -> text("Ця версія Health Connect не дає читати у фоні: кроки надсилаються, коли відкриваєш застосунок. Оновлення Android це виправить.", 15f, muted)
                }
                if (bg && Steps.BACKGROUND !in granted) hc += button("Дозволити оновлення у фоні", false) { ask.launch(setOf(Steps.READ, Steps.BACKGROUND)) }
            }
            else -> {
                hc += text("Дозволь читати кроки й читати їх у фоні, щоб застосунок сам надсилав їх щогодини.", 15f, muted)
                hc += button("Дозволити доступ до кроків") {
                    ask.launch(if (Steps.backgroundPossible(this)) setOf(Steps.READ, Steps.BACKGROUND) else setOf(Steps.READ))
                }
            }
        }
        box.addView(card(*hc.toTypedArray()))

        // 2. pairing
        val paired = Steps.token(this) != null
        val pv = mutableListOf<View>(text("2. Підключення до «Харчування»", 18f, ink, true))
        if (paired) {
            pv += text("✓ Підключено" + Steps.owner(this).let { if (it.isNotEmpty()) ": $it" else "" }, 16f, ok, true)
            pv += button("Відключити цей телефон", false) { Steps.forget(this); SyncWorker.cancel(this); note = "Відключено. Щоб підключити знову, потрібен новий код."; render() }
        } else {
            pv += text("У D-SIM’YA відкрий «Харчування» → день → «Кроки» → «Крокомір телефона» і введи код звідти.", 15f, muted)
            val input = EditText(this).apply {
                hint = "Код, напр. K7Q4M2XP"; setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f); gravity = Gravity.CENTER; setTextColor(ink); setHintTextColor(muted)
                inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
                filters = arrayOf(InputFilter.AllCaps(), InputFilter.LengthFilter(10)); imeOptions = EditorInfo.IME_ACTION_DONE
                layoutParams = LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = dp(10) }
            }
            pv += input
            pv += button(if (busy) "Підключаю…" else "Підключити") {
                val code = input.text.toString().trim()
                if (code.replace(Regex("[^A-Za-z0-9]"), "").length != 8) { note = "Код має 8 знаків."; render(); return@button }
                busy = true; render()
                lifecycleScope.launch {
                    val r = withContext(Dispatchers.IO) { Steps.pair(this@MainActivity, code) }
                    busy = false
                    note = r.fold({ "Готово! Кроки підуть у щоденник" + (if (it.isNotEmpty()) " ($it)" else "") + "." }, { it.message ?: "Не вдалося." })
                    refresh()
                }
            }
        }
        box.addView(card(*pv.toTypedArray()))

        // 3. today
        if (paired && Steps.READ in granted) {
            val sent = Steps.lastSent(this)
            val tv = mutableListOf<View>(text("Сьогодні", 18f, ink, true))
            tv += text(todaySteps?.let { "%,d".format(Locale("uk"), it).replace(',', ' ') + " кроків" } ?: "—", 34f, ink, true)
            tv += text(if (sent > 0) "Надіслано о " + SimpleDateFormat("HH:mm", Locale("uk")).format(Date(sent)) + (if (!isToday(sent)) " (не сьогодні)" else "") else "Ще не надсилалося", 15f, muted)
            tv += button(if (busy) "Надсилаю…" else "Надіслати зараз", false) { lifecycleScope.launch { send(quiet = false) } }
            box.addView(card(*tv.toTypedArray()))
        }

        val err = note.ifEmpty { Steps.lastError(this) }
        if (err.isNotEmpty()) box.addView(text(err, 15f, if (err.startsWith("Готово") || err == "Надіслано.") ok else bad).apply { (layoutParams as LinearLayout.LayoutParams).topMargin = dp(14) })

        update?.let { (_, url) -> box.addView(card(text("Є нова версія застосунку", 17f, ink, true), button("Завантажити оновлення") { open(url) })) }

        // where the steps come from
        box.addView(card(
            text("Звідки беруться кроки", 17f, ink, true),
            text("Health Connect збирає кроки з телефона й з інших застосунків. На Samsung увімкни передачу: Samsung Health → Налаштування → Health Connect. Якщо тут 0, хоча ти ходив(ла), відкрий Health Connect і перевір, що кроки туди потрапляють.", 15f, muted),
            button("Відкрити Health Connect", false) {
                try { startActivity(Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS)) } catch (e: Exception) { note = "Health Connect не відкрився."; render() }
            },
        ))
        box.addView(text("Кроки йдуть лише на сервер D-SIM’YA, у твій щоденник. Більше нічого застосунок не читає й не надсилає.", 13f, muted).apply {
            setOnClickListener { startActivity(Intent(this@MainActivity, PrivacyActivity::class.java)) }
            (layoutParams as LinearLayout.LayoutParams).topMargin = dp(16)
        })
    }

    private fun isToday(t: Long) = SimpleDateFormat("yyyyMMdd", Locale.ROOT).let { it.format(Date(t)) == it.format(Date()) }
    private fun open(url: String) {
        try { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
        catch (e: Exception) { try { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url.replace("market://details?", "https://play.google.com/store/apps/details?")))) } catch (e2: Exception) { /* nothing to open it */ } }
    }
}
