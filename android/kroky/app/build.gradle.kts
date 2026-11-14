// «Кроки D-SIM'YA»: reads the day's steps from Health Connect and sends them to the family app's server.
// Release signing comes from the environment (KROKY_KEYSTORE, KROKY_STORE_PASS, KROKY_KEY_ALIAS, KROKY_KEY_PASS):
// the key is never in the repository. Build: see android/kroky/README.md.
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "ua.dsimya.kroky"
    compileSdk = 36

    defaultConfig {
        applicationId = "ua.dsimya.kroky"
        minSdk = 28
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    signingConfigs {
        create("release") {
            val store = System.getenv("KROKY_KEYSTORE")
            if (store != null) {
                storeFile = file(store)
                storePassword = System.getenv("KROKY_STORE_PASS")
                keyAlias = System.getenv("KROKY_KEY_ALIAS")
                keyPassword = System.getenv("KROKY_KEY_PASS")
            }
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            if (System.getenv("KROKY_KEYSTORE") != null) signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { buildConfig = true }
    packaging { resources { excludes += setOf("META-INF/*.kotlin_module", "META-INF/AL2.0", "META-INF/LGPL2.1", "DebugProbesKt.bin") } }
}

dependencies {
    implementation("androidx.health.connect:connect-client:1.1.0")
    implementation("androidx.work:work-runtime-ktx:2.10.1")
    implementation("androidx.activity:activity-ktx:1.10.1")
}
