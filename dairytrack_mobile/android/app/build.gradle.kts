plugins {
    id("com.android.application")
    id("kotlin-android")
    
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.example.dairytrack_mobile"
    compileSdk = 35  
    // ndkVersion = flutter.ndkVersion
    ndkVersion = "27.0.12077973"

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
        isCoreLibraryDesugaringEnabled = true
        
        
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        applicationId = "com.example.dairytrack_mobile"
        minSdk = flutter.minSdkVersion
        targetSdk = 34
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

flutter {
    source = "../.."
}

dependencies {
    
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")
}