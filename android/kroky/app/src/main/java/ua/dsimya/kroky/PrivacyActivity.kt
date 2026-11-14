package ua.dsimya.kroky

import android.content.res.Configuration
import android.os.Bundle
import android.util.TypedValue
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.activity.ComponentActivity

/** What the app reads and where it goes: Health Connect shows this from its permission screen. */
class PrivacyActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val dark = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
        val ink = if (dark) 0xFFE5EBEE.toInt() else 0xFF12181C.toInt()
        val pad = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 20f, resources.displayMetrics).toInt()
        val box = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(pad, pad * 2, pad, pad) }
        fun p(s: String, size: Float = 16f) = box.addView(TextView(this).apply { text = s; setTextSize(TypedValue.COMPLEX_UNIT_SP, size); setTextColor(ink); setPadding(0, pad / 2, 0, 0); setLineSpacing(0f, 1.25f) })
        p("Про доступ до даних", 22f)
        p("Застосунок читає з Health Connect лише кількість кроків за день — за останні сім днів. Інших даних про здоров’я він не читає.")
        p("Кроки надсилаються тільки на сервер сімейного застосунку D-SIM’YA і потрапляють у твій щоденник «Харчування», поруч із водою та сном. Партнери в «Разом» кроків не бачать.")
        p("Телефон підключається одноразовим кодом. На сервері зберігається лише відбиток ключа цього телефона; відключити його можна тут або в «Харчуванні».")
        p("Скасувати доступ можна будь-коли: Health Connect → Застосунки → Кроки D-SIM’YA.")
        setContentView(ScrollView(this).apply { addView(box) })
    }
}
