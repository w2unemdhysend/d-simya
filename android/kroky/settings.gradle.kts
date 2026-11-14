// Google's mirror of Maven Central first: the main Maven Central host often answers shared build machines with
// "429 Too Many Requests"; the mirror has the same files.
pluginManagement {
    repositories {
        google()
        maven("https://maven-central.storage-download.googleapis.com/maven2") { name = "MavenCentralMirror" }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        maven("https://maven-central.storage-download.googleapis.com/maven2") { name = "MavenCentralMirror" }
        mavenCentral()
    }
}
rootProject.name = "kroky"
include(":app")
